'use client';

import { useEffect } from 'react';

type CmsHeadScriptsProps = {
  html?: string | null;
  debugId?: string;
};

type ParsedScript = {
  attrs: Record<string, string | boolean>;
  content: string;
};

function parseScriptTags(input: string): ParsedScript[] {
  const scripts: ParsedScript[] = [];
  // Support both normal <script ...>...</script> and (non-standard but common in CMS)
  // self-closing <script ... /> tags.
  const blockRe = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  const selfClosingRe = /<script\b([^>]*)\/\s*>/gi;

  const parseAttrs = (attrsRaw: string) => {
    const attrs: Record<string, string | boolean> = {};
    const attrRe = /([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
    let attrMatch: RegExpExecArray | null;
    while ((attrMatch = attrRe.exec(attrsRaw)) !== null) {
      const key = attrMatch[1];
      const value = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4];
      attrs[key.toLowerCase()] = value === undefined ? true : value;
    }
    return attrs;
  };

  let match: RegExpExecArray | null;
  while ((match = blockRe.exec(input)) !== null) {
    const attrsRaw = match[1] || '';
    const content = match[2] || '';

    scripts.push({ attrs: parseAttrs(attrsRaw), content });
  }

  // Self-closing scripts (no inline content).
  while ((match = selfClosingRe.exec(input)) !== null) {
    const attrsRaw = match[1] || '';
    scripts.push({ attrs: parseAttrs(attrsRaw), content: '' });
  }

  return scripts;
}

function stableKeyFromScript(script: ParsedScript): string {
  const src = typeof script.attrs.src === 'string' ? script.attrs.src : '';
  if (src) return `src:${src}`;

  const type = typeof script.attrs.type === 'string' ? script.attrs.type : '';
  const content = script.content || '';
  const raw = `${type}|${content}`;

  // Tiny non-crypto hash for dedupe.
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return `inline:${hash.toString(16)}`;
}

export default function CmsHeadScripts({ html, debugId }: CmsHeadScriptsProps) {
  useEffect(() => {
    const raw = (html ?? '').trim();
    if (!raw) return;

    const inserted: HTMLScriptElement[] = [];

    const scripts = raw.toLowerCase().includes('<script')
      ? parseScriptTags(raw)
      : [{ attrs: {}, content: raw }];

    for (const script of scripts) {
      const key = stableKeyFromScript(script);

      // Skip if the same script is already present.
      const existing = document.head.querySelector(
        `script[data-pml-cms-script="true"][data-pml-cms-key="${CSS.escape(key)}"]`,
      );
      if (existing) continue;

      const el = document.createElement('script');
      el.setAttribute('data-pml-cms-script', 'true');
      el.setAttribute('data-pml-cms-key', key);
      if (debugId) el.setAttribute('data-pml-cms-debug', debugId);

      for (const [k, v] of Object.entries(script.attrs)) {
        if (v === false || v === undefined || v === null) continue;

        // Handle common boolean attrs.
        if (v === true) {
          if (k === 'async') el.async = true;
          else if (k === 'defer') el.defer = true;
          else el.setAttribute(k, '');
          continue;
        }

        const value = String(v);
        if (k === 'src') {
          el.src = value;
        } else if (k === 'type') {
          el.type = value;
        } else if (k === 'crossorigin') {
          el.crossOrigin = value;
        } else if (k === 'referrerpolicy') {
          (el as any).referrerPolicy = value;
        } else if (k === 'nonce') {
          // Browsers treat nonce as an attribute.
          el.setAttribute('nonce', value);
        } else if (k === 'integrity') {
          el.integrity = value;
        } else if (k === 'id') {
          el.id = value;
        } else {
          el.setAttribute(k, value);
        }
      }

      if (!el.src) {
        // Inline JS / JSON-LD.
        el.text = script.content;
      }

      document.head.appendChild(el);
      inserted.push(el);
    }

    return () => {
      for (const el of inserted) {
        try {
          el.parentNode?.removeChild(el);
        } catch {
          // ignore
        }
      }
    };
  }, [html, debugId]);

  return null;
}
