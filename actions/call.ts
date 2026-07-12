"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { StreamClient } from "@stream-io/node-sdk";
import type { Prisma } from "@/lib/generated/prisma/browser";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const callBookingInclude = {
  interviewer: {
    select: {
      id: true,
      clerkUserId: true,
      name: true,
      imageUrl: true,
      categories: true,
    },
  },
  interviewee: {
    select: {
      id: true,
      clerkUserId: true,
      name: true,
      imageUrl: true,
    },
  },
} satisfies Prisma.BookingInclude;

type CallBooking = Prisma.BookingGetPayload<{
  include: typeof callBookingInclude;
}>;

export interface GetCallDataError {
  error: string;
}

export interface GetCallDataSuccess {
  token: string;
  isInterviewer: boolean;
  currentUser: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
  booking: {
    id: string;
    interviewer: CallBooking["interviewer"];
    interviewee: CallBooking["interviewee"];
    categories: CallBooking["interviewer"]["categories"];
    startTime: string;
    endTime: string;
  };
}

export type GetCallDataResult = GetCallDataError | GetCallDataSuccess;

export const getCallData = async (
  callId: string
): Promise<GetCallDataResult> => {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized" };

  const booking = await db.booking.findUnique({
    where: { streamCallId: callId },
    include: callBookingInclude,
  });

  if (!booking) return { error: "Call not found" };

  const isInterviewer = booking.interviewer.clerkUserId === user.id;
  const isInterviewee = booking.interviewee.clerkUserId === user.id;

  if (!isInterviewer && !isInterviewee) return { error: "Forbidden" };

  const streamClient = new StreamClient(
    requireEnv("NEXT_PUBLIC_STREAM_API_KEY"),
    requireEnv("STREAM_SECRET_KEY")
  );

  const token = streamClient.generateUserToken({
    user_id: user.id,
    validity_in_seconds: 60 * 60,
  });

  return {
    token,
    isInterviewer,
    currentUser: {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      imageUrl: user.imageUrl,
    },
    booking: {
      id: booking.id,
      interviewer: booking.interviewer,
      interviewee: booking.interviewee,
      categories: booking.interviewer.categories,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
    },
  };
};