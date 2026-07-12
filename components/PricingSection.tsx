"use client";

import { PricingTable } from "@clerk/nextjs";

export default function ClerkPricingTable() {
    return (
        <div className="pricing-table-wrap">
            <PricingTable
                appearance={{
                    variables: {
                        colorPrimary: "#fbbf24",
                        colorBackground: "#0a0a0b",
                        borderRadius: "1rem",
                        fontFamily: "inherit",
                    },
                }}
                checkoutProps={{
                    appearance: {
                        elements: {
                            drawerRoot: "z-[2000]",
                        },
                    },
                }}
            />
        </div>
    );
}