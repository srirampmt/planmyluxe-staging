import React from "react";
import Link from "next/link";

const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const INTERNAL_HOST_RE = /^https?:\/\/(www\.)?planmyluxe\.co\.uk(?=\/|$|\?|#)/i;
const EXTERNAL_RE = /^(https?:\/\/|mailto:|tel:)/i;

const linkClassName = "font-semibold text-[#CB2187] underline-offset-2 hover:underline";

function internalPath(url: string): string | null {
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  if (INTERNAL_HOST_RE.test(url)) return url.replace(INTERNAL_HOST_RE, "") || "/";
  return null;
}

/** Renders CMS text where links are written as [text](url). Unsafe URLs render as plain text. */
export function renderInlineLinks(text?: string): React.ReactNode {
  if (!text) return text;
  const nodes: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK_RE)) {
    const [whole, label, url] = match;
    const start = match.index ?? 0;
    if (start > last) nodes.push(text.slice(last, start));

    const path = internalPath(url);
    if (path) {
      nodes.push(
        <Link key={start} href={path} className={linkClassName}>
          {label}
        </Link>
      );
    } else if (EXTERNAL_RE.test(url)) {
      nodes.push(
        <a key={start} href={url} target="_blank" rel="noopener noreferrer" className={linkClassName}>
          {label}
        </a>
      );
    } else {
      nodes.push(label);
    }
    last = start + whole.length;
  }
  if (last === 0) return text;
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** Plain-text version of [text](url) markup, for meta tags and structured data. */
export function stripInlineLinks(text?: string): string {
  return (text || "").replace(LINK_RE, "$1");
}
