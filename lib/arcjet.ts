import arcjet, { tokenBucket } from "@arcjet/next";

export interface RateLimiterOptions {
    /** tokens added per interval */
    refillRate: number;
    /** duration string ("1s" | "1m" | "1h" | "1d") or seconds as a number */
    interval: string | number;
    /** max burst size */
    capacity: number;
}

/**
 * Creates a pre-configured Arcjet instance with token bucket rate limiting.
 */
export function createRateLimiter({
    refillRate,
    interval,
    capacity,
}: RateLimiterOptions) {
    return arcjet({
        key: process.env.ARCJET_KEY as string,
        characteristics: ["userId"], // fingerprint by Clerk user ID, not IP
        rules: [
            tokenBucket({
                mode: "LIVE",
                refillRate,
                interval,
                capacity,
            }),
        ],
    });
}

export type RateLimiter = ReturnType<typeof createRateLimiter>;

/** The request type accepted by this Arcjet instance's protect() method. */
type ProtectRequest = Parameters<RateLimiter["protect"]>[0];

/**
 * Runs an Arcjet decision and returns an error string if denied, null if allowed.
 * userId is the Clerk user ID — passed as the fingerprint characteristic.
 */
export async function checkRateLimit(
    aj: RateLimiter,
    req: ProtectRequest,
    userId: string
): Promise<string | null> {
    const decision = await aj.protect(req, { userId, requested: 1 });
    if (decision.isDenied()) {
        return decision.reason.isRateLimit()
            ? "Too many requests. Please try again later."
            : "Request blocked.";
    }
    return null;
}