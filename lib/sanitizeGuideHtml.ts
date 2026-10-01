import DOMPurify from "isomorphic-dompurify";

// Mirrors CKEDITOR_CONFIGS['guide'] in the backend: anything the editor toolbar can
// produce is kept so the page renders exactly as it did in the editor.
const ALLOWED_TAGS = [
  "p", "br", "h2", "h3", "h4", "span", "div",
  "strong", "b", "em", "i", "u", "s", "strike", "sub", "sup",
  "a", "ul", "ol", "li", "blockquote", "hr", "img", "iframe",
  "table", "caption", "colgroup", "col", "thead", "tbody", "tfoot", "tr", "th", "td",
];

const ALLOWED_ATTR = [
  "style", "class", "id", "name", "href", "target", "rel", "src", "alt", "title",
  "width", "height", "align",
  "border", "cellpadding", "cellspacing", "summary", "colspan", "rowspan", "scope",
  "frameborder", "allow", "allowfullscreen", "loading", "referrerpolicy",
];

function isAllowedEmbed(src: string): boolean {
  let url: URL;
  try {
    url = new URL(src, "https://planmyluxe.co.uk");
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    return url.pathname.startsWith("/embed/");
  }
  if (host === "google.com") return url.pathname.startsWith("/maps");
  return host === "maps.google.com";
}

function isExternalHref(href: string): boolean {
  if (!/^https?:\/\//i.test(href)) return false;
  try {
    return !new URL(href).hostname.replace(/^www\./, "").endsWith("planmyluxe.co.uk");
  } catch {
    return false;
  }
}

const dropDisallowedEmbeds = (node: Node, data: { tagName: string }) => {
  if (data.tagName !== "iframe") return;
  const element = node as Element;
  if (!isAllowedEmbed(element.getAttribute("src") || "")) {
    element.parentNode?.removeChild(element);
  }
};

const secureLinks = (node: Node) => {
  const element = node as Element;
  if (element.tagName !== "A") return;
  const href = element.getAttribute("href") || "";
  if (isExternalHref(href) || element.getAttribute("target") === "_blank") {
    element.setAttribute("rel", "noopener noreferrer");
  }
};

export function sanitizeGuideHtml(html: string | null | undefined): string {
  if (!html) return "";

  DOMPurify.addHook("uponSanitizeElement", dropDisallowedEmbeds);
  DOMPurify.addHook("afterSanitizeAttributes", secureLinks);
  try {
    const clean = DOMPurify.sanitize(html, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      ADD_TAGS: ["iframe"],
    });
    return clean
      .replace(/<table\b/gi, '<div class="guide-table-scroll"><table')
      .replace(/<\/table>/gi, "</table></div>");
  } finally {
    DOMPurify.removeHook("uponSanitizeElement", dropDisallowedEmbeds);
    DOMPurify.removeHook("afterSanitizeAttributes", secureLinks);
  }
}
