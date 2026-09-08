"use client";

import { useEffect, useRef, useState } from "react";

type UseVisibleElementOptions = {
  rootMargin?: string;
  threshold?: number | number[];
};

export function useVisibleElement<T extends Element>({
  rootMargin = "200px 0px",
  threshold = 0.01,
}: UseVisibleElementOptions = {}) {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) return;

    const element = ref.current;
    if (!element || typeof window === "undefined") return;

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      {
        root: null,
        rootMargin,
        threshold,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [isVisible, rootMargin, threshold]);

  return { ref, isVisible };
}