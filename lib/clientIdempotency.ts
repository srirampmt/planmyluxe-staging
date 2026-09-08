export function createIdempotencyKey(scope: string): string {
    const timestamp = Date.now();
    const randomPart =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;

    return `${scope}-${timestamp}-${randomPart}`;
}

export function createSearchIdempotencyKey(): string {
    return createIdempotencyKey("search");
}
