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
import { MessageSquare, Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────

/**
 * Minimal booking shape this component needs. Mirrors the relevant fields
 * from `GetCallDataSuccess["booking"]` (see the `getCallData` server
 * action) — adjust the import if that type lives elsewhere in your project.
 */
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
            <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center gap-3">
                <p className="text-stone-400 text-sm">Leaving call…</p>
            </div>
        );
    }

    return (
        <div className="min-h-[92vh] bg-[#0a0a0b] flex flex-col overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/8 shrink-0">
                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className="border-white/10 text-stone-500 text-xs"
                    >
                        {booking.interviewer.name}
                        <span className="text-stone-700 mx-1.5">×</span>
                        {booking.interviewee.name}
                    </Badge>
                    {isInterviewer && (
                        <Badge
                            variant="outline"
                            className="border-amber-400/20 bg-amber-400/5 text-amber-400 text-xs"
                        >
                            Interviewer
                        </Badge>
                    )}
                </div>
            </div>

            {/* Body: video + side panel */}
            <div className="flex flex-1 min-h-0">
                {/* ── LEFT: Video ── */}
                <div className="flex flex-col flex-1 min-w-0">
                    <StreamTheme>
                        <SpeakerLayout participantsBarPosition="bottom" />
                        <CallControls onLeave={handleLeave} />
                    </StreamTheme>
                </div>

                {/* ── RIGHT: Chat panel ── */}
                <div className="w-85 shrink-0 flex flex-col border-l border-white/8 bg-[#0a0a0b]">
                    <div className="flex items-center justify-center gap-2 py-3 border-b border-white/8 shrink-0 text-xs font-medium text-amber-400">
                        <MessageSquare size={13} />
                        Chat
                    </div>

                    {/* Panel content */}
                    <div className="flex-1 min-h-0 overflow-hidden">
                        {chatClient && chatChannel ? (
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}