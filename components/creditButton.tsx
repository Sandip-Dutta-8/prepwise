"use client";

import { useState } from "react";
import { Coins } from "lucide-react";
import UpgradeModal from "./upgradeModal";
import { Button } from "./ui/button";

type CreditButtonProps = {
    role: "INTERVIEWER" | "CANDIDATE" | string;
    credits: number;
};

export default function CreditButton({ role, credits }: CreditButtonProps) {
    const [open, setOpen] = useState<boolean>(false);

    const handleClick = () => {
        if (role === "INTERVIEWER") {
            window.location.href = "/dashboard";
        } else {
            setOpen(true);
        }
    };

    return (
        <>
            <Button
                variant="outline"
                className="border-amber-400/20 text-amber-400 cursor-pointer"
                onClick={handleClick}
            >
                <Coins size={14} />
                <span className="opacity-70">
                    {credits} {role === "INTERVIEWER" ? "Earned" : "Credits"}
                </span>
            </Button>
            <UpgradeModal open={open} onOpenChange={setOpen} />
        </>
    );
}