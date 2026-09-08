'use client';
import { useEffect } from 'react';
import Script from 'next/script';
const ResponseIQProvider = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tryOpenViaGlobals = () => {
      const w = window as any;
      const candidates = [
        w?.ResponseIQ?.open,
        w?.responseIQ?.open,
        w?.responseiq?.open,
        w?.ResponseIQWidget?.open,
        w?.responseIQWidget?.open,
      ].filter((fn: unknown) => typeof fn === 'function') as Array<() => void>;

      for (const fn of candidates) {
        try {
          fn();
          return true;
        } catch {
          // ignore and fall back to DOM click
        }
      }

      return false;
    };

    const tryOpenViaDomClick = () => {
      const clickableTags = new Set(['BUTTON', 'A', 'DIV', 'SPAN']);
      const candidates = Array.from(
        document.querySelectorAll<HTMLElement>(
          '[id*="responseiq" i], [class*="responseiq" i], [src*="responseiq" i]'
        )
      );

      const pick = candidates.find((el) => {
        if (!clickableTags.has(el.tagName)) return false;
        if (el.getAttribute('aria-hidden') === 'true') return false;
        if (el.getAttribute('role') === 'button') return true;
        if (el.tagName === 'BUTTON' || el.tagName === 'A') return true;
        if (typeof (el as any).onclick === 'function') return true;
        return false;
      });

      if (!pick) return false;

      try {
        pick.click();
        pick.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return true;
      } catch {
        return false;
      }
    };

    const openChat = () => {
      if (tryOpenViaGlobals()) return;
      tryOpenViaDomClick();
    };

    const onOpenChat = () => openChat();

    (window as any).pmlOpenChat = openChat;
    window.addEventListener('pml:open-responseiq-chat', onOpenChat);

    return () => {
      window.removeEventListener('pml:open-responseiq-chat', onOpenChat);
      try {
        delete (window as any).pmlOpenChat;
      } catch {
        // ignore
      }
    };
  }, []);

  return (
    <Script
      id="responseiq-widget"
      strategy="lazyOnload"
      src={`https://app.responseiq.com/widgetsrc.php?widget=4SYI118ER72MND5958&widgetrnd=${Math.random()}`}
    />
  );
};

export default ResponseIQProvider;
