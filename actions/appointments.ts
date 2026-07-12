"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/browser";

const intervieweeAppointmentsInclude = {
    interviewer: {
        select: {
            name: true,
            imageUrl: true,
            email: true,
            title: true,
            company: true,
            categories: true,
        },
    },
    feedback: true,
} satisfies Prisma.BookingInclude;

export type IntervieweeAppointment = Prisma.BookingGetPayload<{
    include: typeof intervieweeAppointmentsInclude;
}>;

export const getIntervieweeAppointments = async (): Promise<
    IntervieweeAppointment[]
> => {
    const user = await currentUser();
    if (!user) return [];

    const dbUser = await db.user.findUnique({
        where: { clerkUserId: user.id },
    });
    if (!dbUser) return [];

    return db.booking.findMany({
        where: { intervieweeId: dbUser.id },
        include: intervieweeAppointmentsInclude,
        orderBy: { startTime: "desc" },
    });
};