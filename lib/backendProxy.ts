import { NextResponse } from "next/server";

import { BackendConfigError, fetchBackend } from "@/lib/backendFetch";

export const FORWARDED_REQUEST_HEADERS: Array<[string, string]> = [
    ["user-agent", "User-Agent"],
    ["x-forwarded-for", "X-Forwarded-For"],
    ["x-real-ip", "X-Real-IP"],
    ["cf-connecting-ip", "CF-Connecting-IP"],
    ["cf-ipcountry", "CF-IPCountry"],
    ["x-vercel-ip-country", "X-Vercel-IP-Country"],
    ["x-vercel-ip-country-region", "X-Vercel-IP-Country-Region"],
    ["x-vercel-ip-city", "X-Vercel-IP-City"],
    ["x-client-ip", "X-Client-IP"],
    ["x-request-fingerprint", "X-Request-Fingerprint"],
    ["x-idempotency-key", "X-Idempotency-Key"],
    ["idempotency-key", "Idempotency-Key"],
];

function resolveClientIp(incomingRequest: Request): string {
    const forwardedFor = incomingRequest.headers.get("x-forwarded-for") || "";
    const firstForwardedFor = forwardedFor
        .split(",")
        .map((value) => value.trim())
        .find((value) => value.length > 0);

    return (
        firstForwardedFor ||
        incomingRequest.headers.get("x-real-ip") ||
        incomingRequest.headers.get("cf-connecting-ip") ||
        incomingRequest.headers.get("x-client-ip") ||
        ""
    );
}

const FORWARDED_RESPONSE_HEADERS = [
    "retry-after",
    "x-ratelimit-limit",
    "x-ratelimit-remaining",
    "x-ratelimit-reset",
];

export async function proxyToBackend(
    path: string,
    options: RequestInit = {},
    incomingRequest?: Request,
) {
    try {
        const headers = new Headers(options.headers);

        if (incomingRequest) {
            for (const [sourceName, targetName] of FORWARDED_REQUEST_HEADERS) {
                const value = incomingRequest.headers.get(sourceName);
                if (value && !headers.has(targetName)) {
                    headers.set(targetName, value);
                }
            }

            const clientIp = resolveClientIp(incomingRequest);
            if (clientIp) {
                if (!headers.has("X-Forwarded-For")) {
                    headers.set("X-Forwarded-For", clientIp);
                }

                if (!headers.has("X-Real-IP")) {
                    headers.set("X-Real-IP", clientIp);
                }
            }
        }

        const res = await fetchBackend(path, {
            ...options,
            headers,
            cache: options.cache ?? "no-store",
        });

        const text = await res.text();
        const responseHeaders: Record<string, string> = {
            ...(res.headers.get("content-type")
                ? { "Content-Type": res.headers.get("content-type")! }
                : {}),
        };

        for (const header of FORWARDED_RESPONSE_HEADERS) {
            const value = res.headers.get(header);
            if (value) {
                responseHeaders[header] = value;
            }
        }

        return new NextResponse(text, {
            status: res.status,
            headers: responseHeaders,
        });
    } catch (error) {
        const status = error instanceof BackendConfigError ? 500 : 502;
        return NextResponse.json(
            {
                error:
                    error instanceof BackendConfigError
                        ? "Server configuration error"
                        : "Failed to connect to backend server",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status },
        );
    }
}
