const TEN_MINUTES_MS = 10 * 60 * 1000;

type Bucket = {
    count: number;
    resetAt: number;
};

type AntiSpamStore = {
    counters: Map<string, Bucket>;
    seenKeys: Map<string, number>;
    dedupeKeys: Map<string, number>;
};

type RateLimitOptions = {
    limit?: number;
    windowMs?: number;
};

type RateLimitResult = {
    allowed: boolean;
    remaining: number;
    retryAfterSec: number;
};

const GLOBAL_STORE_KEY = "__pmlAntiSpamStore";

function getStore(): AntiSpamStore {
    const target = globalThis as typeof globalThis & {
        [GLOBAL_STORE_KEY]?: AntiSpamStore;
    };

    if (!target[GLOBAL_STORE_KEY]) {
        target[GLOBAL_STORE_KEY] = {
            counters: new Map<string, Bucket>(),
            seenKeys: new Map<string, number>(),
            dedupeKeys: new Map<string, number>(),
        };
    }

    return target[GLOBAL_STORE_KEY]!;
}

function cleanupExpired(now: number, map: Map<string, number>) {
    for (const [key, expiresAt] of map) {
        if (expiresAt <= now) {
            map.delete(key);
        }
    }
}

function normalizeIp(rawIp: string): string {
    const value = rawIp.trim().toLowerCase();
    if (!value) return "unknown";
    if (value === "::1") return "127.0.0.1";
    if (value.startsWith("::ffff:")) return value.slice(7);
    return value;
}

export function isAntiSpamEnabled(): boolean {
    const value = process.env.ANTI_SPAM_ENABLED?.trim().toLowerCase();
    if (!value) return true;
    return !["0", "false", "off", "no"].includes(value);
}

export function getClientIp(headers: Headers): string {
    const forwardedFor = headers.get("x-forwarded-for") || "";
    const fromForwardedFor = forwardedFor.split(",")[0] || "";
    const realIp = headers.get("x-real-ip") || "";
    const cloudflareIp = headers.get("cf-connecting-ip") || "";

    return normalizeIp(fromForwardedFor || realIp || cloudflareIp || "unknown");
}

export function getIdempotencyKey(headers: Headers): string {
    const value = headers.get("idempotency-key") || headers.get("x-idempotency-key") || "";
    return value.trim();
}

export function getUserAgent(headers: Headers): string {
    return (headers.get("user-agent") || "unknown").trim().slice(0, 256);
}

export async function toSha256(input: string): Promise<string> {
    const encoded = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest("SHA-256", encoded);
    const bytes = Array.from(new Uint8Array(digest));
    return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function getRequestFingerprint(params: {
    route: string;
    ip: string;
    userAgent: string;
    identity?: string;
}): Promise<string> {
    const { route, ip, userAgent, identity = "" } = params;
    return toSha256(`${route}|${ip}|${userAgent}|${identity}`);
}

export async function hashPayload(payload: string): Promise<string> {
    return toSha256(payload);
}

export function consumeIdempotencyKey(key: string, ttlMs = TEN_MINUTES_MS): boolean {
    const store = getStore();
    const now = Date.now();
    cleanupExpired(now, store.seenKeys);

    const seenUntil = store.seenKeys.get(key);
    if (seenUntil && seenUntil > now) {
        return false;
    }

    store.seenKeys.set(key, now + ttlMs);
    return true;
}

export function consumeDedupeKey(key: string, ttlMs = 2 * 60 * 1000): boolean {
    const store = getStore();
    const now = Date.now();
    cleanupExpired(now, store.dedupeKeys);

    const seenUntil = store.dedupeKeys.get(key);
    if (seenUntil && seenUntil > now) {
        return false;
    }

    store.dedupeKeys.set(key, now + ttlMs);
    return true;
}

export function checkRateLimit(
    scope: string,
    options: RateLimitOptions = {},
): RateLimitResult {
    const limit = options.limit ?? 3;
    const windowMs = options.windowMs ?? TEN_MINUTES_MS;

    const store = getStore();
    const now = Date.now();
    const bucket = store.counters.get(scope);

    if (!bucket || bucket.resetAt <= now) {
        store.counters.set(scope, {
            count: 1,
            resetAt: now + windowMs,
        });
        return {
            allowed: true,
            remaining: Math.max(0, limit - 1),
            retryAfterSec: Math.ceil(windowMs / 1000),
        };
    }

    bucket.count += 1;

    const remaining = Math.max(0, limit - bucket.count);
    const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

    if (bucket.count > limit) {
        return {
            allowed: false,
            remaining,
            retryAfterSec,
        };
    }

    return {
        allowed: true,
        remaining,
        retryAfterSec,
    };
}
