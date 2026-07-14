"use client";

import { useEffect, useCallback, useState } from "react";

// Stream Video
import {
    StreamTheme,
    SpeakerLayout,
    useCallStateHooks,
    useCall,
    CallingState,
    CallControls,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

// Stream Chat
import {
    Chat,
    Channel,
    MessageList,
    MessageComposer,
    Window,
    useCreateChatClient,
} from "stream-chat-react";
import "stream-chat-react/dist/css/index.css";

import { Badge } from "@/components/ui/badge";
import { MessageSquare, Sparkles, Loader2 } from "lucide-react";
import { CATEGORY_LABEL } from "@/lib/data";
import AIQuestionsPanel from "./AiQuestions";

// ─── Types ────────────────────────────────────────────────────────────────

export interface CallBookingParty {
    clerkUserId: string;
    name: string | null;
}

declare module "stream-chat" {
    interface CustomChannelData {
        name?: string;
    }
}

export interface CallUIBooking {
    interviewer: CallBookingParty;
    interviewee: CallBookingParty;
}

export interface CallUICurrentUser {
    id: string;
    name: string;
    imageUrl: string | null;
}

interface CallUIProps {
    callId: string;
    isInterviewer: boolean;
    booking: CallUIBooking;
    onLeave: () => void;
    apiKey: string;
    token: string;
    currentUser: CallUICurrentUser;
}

type SidePanelTab = "chat" | "ai";

const ALL_CATEGORIES = Object.keys(CATEGORY_LABEL) as (keyof typeof CATEGORY_LABEL)[];

// ─── Call UI (inside StreamCall context) ─────────────────────────────────────

export default function CallUI({
    callId,
    isInterviewer,
    booking,
    onLeave,
    apiKey,
    token,
    currentUser,
}: CallUIProps) {
    const { useCallCallingState } = useCallStateHooks();
    const call = useCall();
    const callingState = useCallCallingState();

    const [activeTab, setActiveTab] = useState<SidePanelTab>("chat");

    // Auto-stop recording before leaving
    const handleLeave = useCallback(async () => {
        try {
            if (call) {
                const isRecording = call.state?.recording;
                if (isRecording) {
                    await call.stopRecording().catch(() => { });
                }
                await call.leave().catch(() => { });
            }
        } finally {
            onLeave();
        }
    }, [call, onLeave]);

    // ── Chat client — same token works for both Video + Chat SDKs ──
    const chatClient = useCreateChatClient({
        apiKey,
        tokenOrProvider: token,
        userData: {
            id: currentUser.id,
            name: currentUser.name,
            image: currentUser.imageUrl ?? undefined,
        },
    });

    const [chatChannel, setChatChannel] = useState<ReturnType<
        NonNullable<typeof chatClient>["channel"]
    > | null>(null);

    useEffect(() => {
        if (!chatClient) return;

        const channel = chatClient.channel("messaging", callId, {
            name: "Interview Chat",
            members: [
                booking.interviewer.clerkUserId,
                booking.interviewee.clerkUserId,
            ],
        });

        channel
            .watch()
            .then(() => setChatChannel(channel))
            .catch(console.error);

        return () => {
            channel.stopWatching().catch(() => { });
        };
    }, [chatClient, callId, booking]);

    if (callingState === CallingState.LEFT) {
        return (
            <div className="min-h-[100dvh] bg-[#0a0a0b] flex flex-col items-center justify-center gap-3">
                <p className="text-stone-400 text-sm">Leaving call…</p>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] md:min-h-[92vh] bg-[#0a0a0b] flex flex-col overflow-hidden">
            {/* Top bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-3 border-b border-white/8 shrink-0">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <Badge
                        variant="outline"
                        className="border-white/10 text-stone-500 text-xs max-w-full"
                    >
                        <span className="truncate max-w-[120px] sm:max-w-none inline-block align-bottom">
                            {booking.interviewer.name}
                        </span>
                        <span className="text-stone-700 mx-1.5">×</span>
                        <span className="truncate max-w-[120px] sm:max-w-none inline-block align-bottom">
                            {booking.interviewee.name}
                        </span>
                    </Badge>
                    {isInterviewer && (
                        <Badge
                            variant="outline"
                            className="border-amber-400/20 bg-amber-400/5 text-amber-400 text-xs shrink-0"
                        >
                            Interviewer
                        </Badge>
                    )}
                </div>
            </div>

            {/* Body: video + side panel */}
            <div className="flex flex-col md:flex-row flex-1 min-h-0">
                {/* ── Video ── */}
                <div className="flex flex-col flex-1 min-w-0 min-h-[50vh] md:min-h-0">
                    <StreamTheme className="flex flex-col flex-1 min-h-0">
                        <div className="flex-1 min-h-0">
                            <SpeakerLayout participantsBarPosition="bottom" />
                        </div>
                        <CallControls onLeave={handleLeave} />
                    </StreamTheme>
                </div>

                {/* ── Chat / AI Questions panel ── */}
                <div className="w-full md:w-85 md:shrink-0 h-[42vh] md:h-auto flex flex-col border-t md:border-t-0 md:border-l border-white/8 bg-[#0a0a0b] min-h-0">
                    {/* Tab switcher — the AI Questions tab only renders for interviewers */}
                    <div className="flex items-center border-b border-white/8 shrink-0">
                        <button
                            type="button"
                            onClick={() => setActiveTab("chat")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors ${activeTab === "chat"
                                ? "text-amber-400"
                                : "text-stone-500 hover:text-stone-400"
                                }`}
                        >
                            <MessageSquare size={13} />
                            Chat
                        </button>
                        {isInterviewer && (
                            <button
                                type="button"
                                onClick={() => setActiveTab("ai")}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors ${activeTab === "ai"
                                    ? "text-amber-400"
                                    : "text-stone-500 hover:text-stone-400"
                                    }`}
                            >
                                <Sparkles size={13} />
                                AI Questions
                            </button>
                        )}
                    </div>

                    {/* Panel content */}
                    <div className="flex-1 min-h-0 overflow-hidden">
                        {activeTab === "chat" || !isInterviewer ? (
                            chatClient && chatChannel ? (
                                <Chat client={chatClient} theme="str-chat__theme-dark">
                                    <Channel channel={chatChannel}>
                                        <Window>
                                            <MessageList />
                                            <MessageComposer focus />
                                        </Window>
                                    </Channel>
                                </Chat>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 size={18} className="text-stone-600 animate-spin" />
                                </div>
                            )
                        ) : (
                            <div className="h-full overflow-hidden p-3">
                                <AIQuestionsPanel categories={ALL_CATEGORIES} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}