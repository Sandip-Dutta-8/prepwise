import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/prisma";
import { NextRequest } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────

interface StreamWebhookBody {
    type: string;
    call_cid?: string;
    call_recording?: { url?: string };
    call_transcription?: { url?: string };
}

interface TranscriptSpeechEntry {
    type: "speech";
    speaker_id: string;
    text: string;
}

type TranscriptEntry = TranscriptSpeechEntry | { type: string;[key: string]: unknown };

type OverallRating = "POOR" | "AVERAGE" | "GOOD" | "EXCELLENT";

interface GeminiFeedback {
    summary: string;
    technical: string;
    communication: string;
    problemSolving: string;
    recommendation: string;
    strengths: string[];
    improvements: string[];
    overallRating: OverallRating;
}

// ─── Handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<Response> {
    const body = (await request.json()) as StreamWebhookBody;
    const eventType = body.type;


    if (
        eventType !== "call.transcription_ready" &&
        eventType !== "call.recording_ready"
    ) {
        return Response.json({ ok: true });
    }

    // call_cid arrives as "default:mock_123_abc" — we stored just "mock_123_abc"
    const callCid = body.call_cid ?? "";
    const streamCallId = callCid.includes(":") ? callCid.split(":")[1] : callCid;

    if (!streamCallId) {
        return Response.json({ ok: true });
    }

    try {
        const booking = await db.booking.findUnique({
            where: { streamCallId },
            include: {
                interviewer: {
                    select: { id: true, clerkUserId: true, name: true, categories: true },
                },
                interviewee: {
                    select: { id: true, clerkUserId: true, name: true },
                },
                feedback: { select: { id: true } },
            },
        });

        if (!booking) {
            return Response.json({ ok: true });
        }

        // ── Recording ready ───────────────────────────────────────────────────
        if (eventType === "call.recording_ready") {
            const recordingUrl = body.call_recording?.url;

            if (!recordingUrl) {
                return Response.json({ ok: true });
            }

            await db.booking.update({
                where: { id: booking.id },
                data: { recordingUrl },
            });

            return Response.json({ ok: true });
        }

        // ── Transcription ready ───────────────────────────────────────────────
        if (eventType === "call.transcription_ready") {
            // Outer guard — catches sequential retries
            if (booking.feedback) {
                return Response.json({ ok: true });
            }

            const transcriptUrl = body.call_transcription?.url;
            if (!transcriptUrl) {
                return Response.json({ ok: true });
            }

            // 1. Download JSONL from Stream CDN
            console.log(`[stream-webhook] Downloading transcript from Stream CDN...`);
            const transcriptRes = await fetch(transcriptUrl);
            const transcriptText = await transcriptRes.text();

            // 2. Parse JSONL into readable conversation
            const lines = transcriptText
                .trim()
                .split("\n")
                .filter(Boolean)
                .map((line): TranscriptEntry | null => {
                    try {
                        return JSON.parse(line) as TranscriptEntry;
                    } catch {
                        return null;
                    }
                })
                .filter(
                    (entry): entry is TranscriptSpeechEntry =>
                        entry?.type === "speech"
                );

            if (lines.length === 0) {
                console.log(
                    `[stream-webhook] No speech segments found in transcript, skipping`
                );
                return Response.json({ ok: true });
            }

            // Map clerkUserId to display name
            const speakerMap: Record<string, string> = {
                [booking.interviewer.clerkUserId]:
                    booking.interviewer.name ?? "Interviewer",
                [booking.interviewee.clerkUserId]:
                    booking.interviewee.name ?? "Interviewee",
            };

            const transcript = lines
                .map((l) => `${speakerMap[l.speaker_id] ?? l.speaker_id}: ${l.text}`)
                .join("\n");

            // 3. Generate feedback via Gemini
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("Missing GEMINI_API_KEY environment variable");
            }

            // Free-tier, GA Gemini model — see the note in actions/aiQuestions.ts
            // about model naming; verify at
            // https://ai.google.dev/gemini-api/docs/models before changing.
            const GEMINI_MODEL = "gemini-2.5-flash-lite";

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
            const categories =
                booking.interviewer.categories?.join(", ") ?? "General";

            const prompt = `You are an expert technical interviewer evaluating a mock interview.

Interview categories: ${categories}
Interviewer: ${booking.interviewer.name}
Candidate: ${booking.interviewee.name}

TRANSCRIPT:
${transcript}

Analyze the candidate's performance. Respond ONLY with a valid JSON object, no markdown, no backticks, no explanation:
{
  "summary": "2-3 sentence overall summary of the session",
  "technical": "Assessment of technical knowledge and accuracy",
  "communication": "Assessment of clarity, structure, and communication style",
  "problemSolving": "Assessment of problem-solving approach and thought process",
  "recommendation": "HIRE / CONSIDER / NO_HIRE with a one-sentence reason",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "overallRating": "POOR or AVERAGE or GOOD or EXCELLENT"
}`;

            const result = await model.generateContent(prompt);
            const raw = result.response
                .text()
                .trim()
                .replace(/^```json|^```|```$/gm, "")
                .trim();

            let feedbackData: GeminiFeedback;
            try {
                feedbackData = JSON.parse(raw) as GeminiFeedback;
            } catch (parseErr) {
                console.error(
                    `[stream-webhook] ✗ Failed to parse Gemini response as JSON:`,
                    parseErr
                );
                throw new Error("Failed to parse feedback from Gemini response");
            }

            console.log(`[stream-webhook] Writing feedback to DB...`);
            await db.$transaction([
                db.feedback.upsert({
                    where: { bookingId: booking.id },
                    create: {
                        bookingId: booking.id,
                        summary: feedbackData.summary,
                        technical: feedbackData.technical,
                        communication: feedbackData.communication,
                        problemSolving: feedbackData.problemSolving,
                        recommendation: feedbackData.recommendation,
                        strengths: feedbackData.strengths,
                        improvements: feedbackData.improvements,
                        overallRating: feedbackData.overallRating,
                    },
                    update: {}, // already exists — no-op, keep the original
                }),
                db.booking.update({
                    where: { id: booking.id },
                    data: { status: "COMPLETED" },
                }),
            ]);

            // Credit transaction is outside the main transaction so we can check first
            const earnExists = await db.creditTransaction.findFirst({
                where: { bookingId: booking.id, type: "BOOKING_EARNING" },
            });
            if (!earnExists) {
                await db.creditTransaction.create({
                    data: {
                        userId: booking.interviewer.id,
                        amount: booking.creditsCharged,
                        type: "BOOKING_EARNING",
                        bookingId: booking.id,
                    },
                });

            } else {
                console.log(
                    `[stream-webhook] Earning transaction already exists, skipping`
                );
            }
        }

        return Response.json({ ok: true });
    } catch (err) {
        console.error(`[stream-webhook] ✗ ${eventType} error:`, err);
        // Always 200 — non-2xx triggers Stream retries, making the race worse
        return Response.json({ ok: true });
    }
}