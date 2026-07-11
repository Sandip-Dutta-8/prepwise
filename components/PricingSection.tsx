"use client";

import { PricingTable } from "@clerk/nextjs";

export default function ClerkPricingTable() {
    return (
        <PricingTable
            appearance={{
                variables: {
                    colorPrimary: "#fbbf24", // amber-400
                    colorBackground: "#0a0a0b",
                    borderRadius: "1rem",
                },
                elements: {
                    pricingTableCard:
                        "bg-[#0f0f11] border border-white/10 hover:border-amber-400/20 rounded-2xl transition-all duration-300 hover:-translate-y-1 shadow-none text-stone-200",
                    pricingTableCardTitle:
                        "font-serif text-xl tracking-tight text-stone-100",
                    pricingTableCardFee:
                        "font-serif text-5xl bg-linear-to-br from-amber-300 to-amber-500 bg-clip-text text-transparent",
                    pricingTableCardFeaturesListItem: "text-sm text-stone-400",
                    pricingTableCardActionButton:
                        "w-full bg-amber-400 hover:bg-amber-300 text-[#0a0a0b] font-semibold rounded-lg transition-colors",
                },
            }}

            checkoutProps={{
                appearance: {
                    elements: {
                        drawerRoot: {
                            zIndex: 2000
                        }
                    }
                }
            }}
        />
    );
}