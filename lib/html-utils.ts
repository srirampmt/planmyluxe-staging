// Helper to strip HTML tags for plain text display
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

// Helper to parse HTML list items
export function parseHtmlList(html: string): string[] {
  const matches = html.match(/<li[^>]*>(.*?)<\/li>/gi);
  if (!matches) return [];
  return matches.map((item) => stripHtml(item));
}

// Rich-text CMS field → plain text. Prefers list-item extraction (for <ul><li>...</li></ul>
// content) over a flat strip, so list items don't run together with no separation.
export function richTextToPlain(html: unknown): string {
  if (typeof html !== "string" || !html.trim()) return "";
  const items = parseHtmlList(html);
  return items.length > 0 ? items.join(" ") : stripHtml(html);
}

// Get board basis icon component
export function getBoardBasisIcon(code: string): string {
  // Returns appropriate icon based on board basis
  return code === "AI" ? "🍽️" : "🍴";
}
