import { NextResponse } from "next/server";

type FetchExternalOptions = {
	timeoutMs?: number;
	headers?: HeadersInit;
};

function addDaysUtc(base: Date, days: number): Date {
	const d = new Date(base.getTime());
	d.setUTCDate(d.getUTCDate() + days);
	return d;
}

function formatYyyyMmDdUtc(d: Date): string {
	return d.toISOString().slice(0, 10);
}

function normalizeDpSearchQuery(input: string): string {
	const now = new Date();
	const minAllowedDateMin = formatYyyyMmDdUtc(addDaysUtc(now, 3));
	const defaultDateMax = formatYyyyMmDdUtc(addDaysUtc(now, 365));

	if (/^https?:\/\//i.test(input)) {
		const u = new URL(input);
		// Only adjust dates when missing or invalid.
		const providedMin = u.searchParams.get("dateMin") || "";
		const providedMax = u.searchParams.get("dateMax") || "";
		u.searchParams.set("dateMin", providedMin && providedMin >= minAllowedDateMin ? providedMin : minAllowedDateMin);
		u.searchParams.set("dateMax", providedMax || defaultDateMax);
		if (u.searchParams.has("cheapestPerDay")) u.searchParams.delete("cheapestPerDay");
		u.searchParams.set("cheapestPerDuration", "0");
		return u.toString();
	}

	let prefix = "";
	let queryString = input;
	const qIndex = input.indexOf("?");
	if (qIndex >= 0) {
		prefix = input.slice(0, qIndex + 1);
		queryString = input.slice(qIndex + 1);
	} else if (queryString.startsWith("?")) {
		queryString = queryString.slice(1);
	}

	const params = new URLSearchParams(queryString);
	const providedMin = params.get("dateMin") || "";
	const providedMax = params.get("dateMax") || "";
	params.set("dateMin", providedMin && providedMin >= minAllowedDateMin ? providedMin : minAllowedDateMin);
	params.set("dateMax", providedMax || defaultDateMax);
	if (params.has("cheapestPerDay")) params.delete("cheapestPerDay");
	params.set("cheapestPerDuration", "0");
	return `${prefix}${params.toString()}`;
}

/**
 * Fetch JSON from an external URL and return the parsed JSON.
 *
 * - Validates the URL is http/https.
 * - Adds a timeout.
 * - Throws a descriptive error on non-2xx responses.
 */
async function fetchExternalJson(url: string, options: FetchExternalOptions = {}) {
	if (!url || typeof url !== "string") {
		throw new Error("Missing url");
	}
	const query = normalizeDpSearchQuery(url);
	const apiKey = process.env.THIRDPARTY_API_KEY;
    const api_url = `${apiKey}${query}`;
	
	const timeoutMs = options.timeoutMs ?? 15_000;
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const res = await fetch(api_url, {
			method: "GET",
			headers: {
				Accept: "application/json",
				...(apiKey ? { "X-API-KEY": apiKey } : {}),
				...(options.headers ?? {}),
			},
			signal: controller.signal,
			cache: "no-store",
		});

		if (!res.ok) {
			const body = await res.text().catch(() => "");
			throw new Error(`Upstream error ${res.status}: ${body.slice(0, 500)}`);
		}
		const data = await res.json();
		return data;
	} finally {
		clearTimeout(timeoutId);
	}
}


function extractCheapestTotalPrice(data: unknown): number | null {
	// Based on the dpSearch response shape you shared:
	// { Status, Count, Results: [{ totalPrice: number, ... }], Search: {...} }
	if (!data || typeof data !== "object") return null;
	const record = data as Record<string, unknown>;

	const results = record["Results"];
	if (Array.isArray(results) && results.length > 0) {
		let min: number | null = null;
		for (const r of results) {
			if (!r || typeof r !== "object") continue;
			const v = (r as Record<string, unknown>)["totalPrice"];
			const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
			if (!Number.isFinite(n) || n <= 0) continue;
			min = min == null ? n : Math.min(min, n);
		}
		return min;
	}

	const top = record["totalPrice"];
	const n = typeof top === "number" ? top : typeof top === "string" ? Number(top) : NaN;
	return Number.isFinite(n) && n > 0 ? n : null;
}

function extractUpstreamCount(data: unknown): number | null {
	if (!data || typeof data !== "object") return null;
	const record = data as Record<string, unknown>;
	const v = record["Count"];
	const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
	return Number.isFinite(n) ? n : null;
}

function extractUpstreamStatus(data: unknown): string | null {
	if (!data || typeof data !== "object") return null;
	const record = data as Record<string, unknown>;
	const v = record["Status"];
	return typeof v === "string" ? v : v != null ? String(v) : null;
}

function extractDurationMax(data: unknown): number | null {
	if (!data || typeof data !== "object") return null;
	const record = data as Record<string, unknown>;
	const search = record["Search"];
	if (!search || typeof search !== "object") return null;
	const durationMax = (search as Record<string, unknown>)["durationMax"];
	const n = typeof durationMax === "number" ? durationMax : typeof durationMax === "string" ? Number(durationMax) : NaN;
	return Number.isFinite(n) ? n : null;
}

export async function GET(req: Request) {
	const parsed = new URL(req.url);
	// Support both styles:
	// 1) /api/cardprice?url=<querystring>
	// 2) /api/cardprice?<querystring>   (no encoding/decoding)
	const url = parsed.searchParams.get("url") ?? (parsed.search.startsWith("?") ? parsed.search.slice(1) : "");
	

	try {
		const data = await fetchExternalJson(url);
		const price = extractCheapestTotalPrice(data);
		const durationMax = extractDurationMax(data);
		const count = extractUpstreamCount(data);
		const status = extractUpstreamStatus(data);
		return NextResponse.json({ price, durationMax, count, status });
	} catch (e) {
		const message = e instanceof Error ? e.message : "Unknown error";
		return NextResponse.json({ success: false, error: message }, { status: 400 });
	}
}
