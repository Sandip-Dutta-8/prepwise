import { redirect, notFound } from "next/navigation";
import { getCallData } from "@/actions/call";
import CallRoom from "./_components/CallRoom";

interface CallPageProps {
    params: Promise<{ callId: string }>;
}

export default async function CallPage({ params }: CallPageProps) {
    const { callId } = await params;

    const result = await getCallData(callId);

    if ("error" in result) {
        if (result.error === "Call not found") {
            notFound();
        }
        // "Unauthorized" and "Forbidden" (and any future error variant) send
        // the user back home.
        redirect("/");
    }

    const { token, isInterviewer, currentUser, booking } = result;

    return (
        <CallRoom
            callId={callId}
            token={token}
            apiKey={process.env.NEXT_PUBLIC_STREAM_API_KEY!}
            currentUser={currentUser}
            booking={booking}
            isInterviewer={isInterviewer}
        />
    );
}