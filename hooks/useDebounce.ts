"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function useInfiniteScroll(
  callback: () => void,
  enabled: boolean
): React.RefCallback<Element> {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const observerRef = useRef<IntersectionObserver | null>(null);

  const setRef = useCallback(
    (el: Element | null) => {
      // Always disconnect the previous observer first
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (!enabled || !el) return;
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            callbackRef.current();
          }
        },
        { threshold: 0.1 }
      );
      observerRef.current.observe(el);
    },
    [enabled]
  );

  // When enabled flips off, disconnect the active observer immediately
  useEffect(() => {
    if (!enabled && observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, [enabled]);

  return setRef;
}
