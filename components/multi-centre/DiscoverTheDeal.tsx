"use client";

import DOMPurify from "isomorphic-dompurify";

type Props = {
  title?: string;
  content: string;
};

export default function DiscoverTheDeal({
  title = "Discover the Deal",
  content,
}: Props) {
  const raw = (content || "").trim();

  const parseItemsFromHtml = (html: string) => {
    if (!html) return [] as string[];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const liNodes = Array.from(doc.querySelectorAll("li"));
      if (liNodes.length > 0) return liNodes.map((n) => (n.textContent || "").trim()).filter(Boolean);

      const pNodes = Array.from(doc.querySelectorAll("p"));
      if (pNodes.length > 0) return pNodes.map((n) => (n.textContent || "").trim()).filter(Boolean);

      const bodyText = doc.body.textContent || "";
      const parts = bodyText.split(/<br\s*\/?>|\r?\n/).map((s) => s.trim()).filter(Boolean);
      if (parts.length > 0) return parts;

      return [bodyText.trim()].filter(Boolean);
    } catch {
      return [] as string[];
    }
  };

  const items = parseItemsFromHtml(raw);

  const renderSanitizedHtml = (html: string) => {
    const safe = DOMPurify.sanitize(html || "", { USE_PROFILES: { html: true } });
    return <div dangerouslySetInnerHTML={{ __html: safe }} />;
  };

  // If we parsed items, render as bullets. Otherwise render sanitized HTML or newline paragraphs.
  if (items.length) {
    return (
      <section className="w-full rounded-[8px] bg-[#FBE8F4] p-6 md:p-8 mt-4 md:mt-8" data-testid="discover-the-deal">
        <h2 className="text-[20px] md:text-[24px] font-bold text-pml-primary leading-[140%] mb-4">{title}</h2>
        <ul className="list-disc pl-5 space-y-3 text-[#4C4C4C] text-[14px] md:text-[15px] leading-[160%]">
          {items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      </section>
    );
  }

  // fallback: if no HTML items, try splitting by newline
  const paragraphs = raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  if (paragraphs.length > 1) {
    return (
      <section className="w-full rounded-[8px] bg-[#FBE8F4] p-6 md:p-8 mt-4 md:mt-8" data-testid="discover-the-deal">
        <h2 className="text-[20px] md:text-[24px] font-bold text-pml-primary leading-[140%] mb-4">{title}</h2>
        <div className="space-y-3 text-[#4C4C4C] text-[14px] md:text-[15px] leading-[160%]">
          {paragraphs.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </section>
    );
  }

  // final fallback: render sanitized HTML or raw text
  return (
    <section className="w-full rounded-[8px] bg-[#FBE8F4] p-6 md:p-8 mt-4 md:mt-8" data-testid="discover-the-deal">
      <h2 className="text-[20px] md:text-[24px] font-bold text-pml-primary leading-[140%] mb-4">{title}</h2>
      <div className="text-[#4C4C4C] text-[14px] md:text-[15px] leading-[160%]">
        {raw ? renderSanitizedHtml(raw) : null}
      </div>
    </section>
  );
}