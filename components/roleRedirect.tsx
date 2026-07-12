"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserRole } from "@/lib/generated/prisma/enums";

const INTERVIEWER_ONLY = ["/appointments"];
const INTERVIEWEE_ONLY = ["/dashboard"];

interface RoleRedirectProps {
  role: UserRole;
}

export default function RoleRedirect({ role } : RoleRedirectProps) {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (role === "UNASSIGNED" && pathname !== "/onboarding")
            router.replace("/onboarding");
        // Already onboarded users shouldn't be on /onboarding
        if (role === "INTERVIEWER" && pathname.startsWith("/onboarding"))
            router.replace("/dashboard");
        if (role === "INTERVIEWEE" && pathname.startsWith("/onboarding"))
            router.replace("/explore");
        if (
            role === "INTERVIEWER" &&
            INTERVIEWER_ONLY.some((p) => pathname.startsWith(p))
        )
            router.replace("/dashboard");
        if (
            role === "INTERVIEWEE" &&
            INTERVIEWEE_ONLY.some((p) => pathname.startsWith(p))
        )
            router.replace("/appointments");
    }, [role, pathname, router]);

    return null;
}