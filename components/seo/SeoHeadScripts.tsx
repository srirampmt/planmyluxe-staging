import Script from "next/script";

type SeoHeadScriptsProps = {
  html?: string | null;
  debugId?: string;
};

type ParsedScript = {
  attrs: Record<string, string | boolean>;
  content: string;
};

function parseScriptTags(input: string): ParsedScript[] {
  const scripts: ParsedScript[] = [];
  const blockRe = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  const selfClosingRe = /<script\b([^>]*)\/\s*>/gi;

  const parseAttrs = (attrsRaw: string) => {
    const attrs: Record<string, string | boolean> = {};
    const attrRe = /([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
    let attrMatch: RegExpExecArray | null;

    while ((attrMatch = attrRe.exec(attrsRaw)) !== null) {
      const key = attrMatch[1].toLowerCase();
      const value = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4];
      attrs[key] = value === undefined ? true : value;
    }

    return attrs;
  };

  let match: RegExpExecArray | null;
  while ((match = blockRe.exec(input)) !== null) {
    scripts.push({
      attrs: parseAttrs(match[1] || ""),
      content: match[2] || "",
    });
  }

  while ((match = selfClosingRe.exec(input)) !== null) {
    scripts.push({
      attrs: parseAttrs(match[1] || ""),
      content: "",
    });
  }

  return scripts;
}

function stableKeyFromScript(script: ParsedScript, index: number): string {
  const src = typeof script.attrs.src === "string" ? script.attrs.src : "";
  if (src) return `src:${src}`;

  const type = typeof script.attrs.type === "string" ? script.attrs.type : "";
  const raw = `${index}|${type}|${script.content}`;

  let hash = 0;
  for (let offset = 0; offset < raw.length; offset += 1) {
    hash = (hash * 31 + raw.charCodeAt(offset)) >>> 0;
  }

  return `inline:${hash.toString(16)}`;
}

export default function SeoHeadScripts({ html, debugId }: SeoHeadScriptsProps) {
  const raw = (html ?? "").trim();
  if (!raw) return null;

  const scripts = raw.toLowerCase().includes("<script")
    ? parseScriptTags(raw)
    : [{ attrs: {}, content: raw }];

  return (
    <>
      {scripts.map((script, index) => {
        const scriptKey = stableKeyFromScript(script, index);
        const props: Record<string, unknown> = {
          "data-pml-seo-script": "true",
        };

        if (debugId) {
          props["data-pml-seo-debug"] = debugId;
        }

        for (const [key, value] of Object.entries(script.attrs)) {
          if (value === false || value == null) continue;

          if (value === true) {
            if (key === "async") props.async = true;
            else if (key === "defer") props.defer = true;
            else props[key] = true;
            continue;
          }

          if (key === "crossorigin") {
            props.crossOrigin = value;
          } else if (key === "referrerpolicy") {
            props.referrerPolicy = value;
          } else {
            props[key] = value;
          }
        }

        if (!props.src && script.content) {
          props.dangerouslySetInnerHTML = { __html: script.content };
        }

        props.id ??= scriptKey;

        return <Script key={scriptKey} strategy="lazyOnload" {...props} />;
      })}
    </>
  );
}