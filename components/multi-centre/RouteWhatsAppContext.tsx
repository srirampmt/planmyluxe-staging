"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type RouteWhatsAppState = {
  pathname: string;
  contextLine?: string;
};

type RouteWhatsAppContextValue = {
  routeWhatsAppState: RouteWhatsAppState | null;
  setRouteWhatsAppState: (value: {
    pathname?: string | null;
    contextLine?: string | null;
  }) => void;
  clearRouteWhatsAppState: (pathname?: string | null) => void;
};

const RouteWhatsAppContext = createContext<RouteWhatsAppContextValue | null>(null);

function normalizePathname(pathname?: string | null): string | undefined {
  const normalized = String(pathname ?? "").trim();
  return normalized || undefined;
}

function normalizeContextLine(contextLine?: string | null): string | undefined {
  const normalized = String(contextLine ?? "").trim();
  return normalized || undefined;
}

export function RouteWhatsAppProvider({ children }: { children: ReactNode }) {
  const [routeWhatsAppState, setRouteWhatsAppStateInternal] =
    useState<RouteWhatsAppState | null>(null);

  const setRouteWhatsAppState = useCallback(
    ({ pathname, contextLine }: { pathname?: string | null; contextLine?: string | null }) => {
      const normalizedPathname = normalizePathname(pathname);

      if (!normalizedPathname) {
        setRouteWhatsAppStateInternal(null);
        return;
      }

      const nextState = {
        pathname: normalizedPathname,
        contextLine: normalizeContextLine(contextLine),
      } satisfies RouteWhatsAppState;

      setRouteWhatsAppStateInternal((current) => {
        if (
          current?.pathname === nextState.pathname &&
          current?.contextLine === nextState.contextLine
        ) {
          return current;
        }

        return nextState;
      });
    },
    []
  );

  const clearRouteWhatsAppState = useCallback((pathname?: string | null) => {
    const normalizedPathname = normalizePathname(pathname);

    setRouteWhatsAppStateInternal((current) => {
      if (!current) return current;
      if (normalizedPathname && current.pathname !== normalizedPathname) {
        return current;
      }

      return null;
    });
  }, []);

  const value = useMemo(
    () => ({
      routeWhatsAppState,
      setRouteWhatsAppState,
      clearRouteWhatsAppState,
    }),
    [routeWhatsAppState, setRouteWhatsAppState, clearRouteWhatsAppState]
  );

  return (
    <RouteWhatsAppContext.Provider value={value}>
      {children}
    </RouteWhatsAppContext.Provider>
  );
}

function useRouteWhatsAppContext() {
  const context = useContext(RouteWhatsAppContext);

  if (!context) {
    throw new Error("RouteWhatsAppContext is not available");
  }

  return context;
}

export function usePublishRouteWhatsAppContext(
  pathname?: string | null,
  contextLine?: string | null
) {
  const { setRouteWhatsAppState, clearRouteWhatsAppState } = useRouteWhatsAppContext();
  const normalizedPathname = normalizePathname(pathname);
  const normalizedContextLine = normalizeContextLine(contextLine);

  useEffect(() => {
    if (!normalizedPathname) return;

    setRouteWhatsAppState({
      pathname: normalizedPathname,
      contextLine: normalizedContextLine,
    });

    return () => {
      clearRouteWhatsAppState(normalizedPathname);
    };
  }, [
    normalizedPathname,
    normalizedContextLine,
    setRouteWhatsAppState,
    clearRouteWhatsAppState,
  ]);
}

export function useActiveRouteWhatsAppContextLine(pathname?: string | null) {
  const { routeWhatsAppState } = useRouteWhatsAppContext();
  const normalizedPathname = normalizePathname(pathname);

  if (!normalizedPathname) {
    return undefined;
  }

  if (routeWhatsAppState?.pathname !== normalizedPathname) {
    return undefined;
  }

  return routeWhatsAppState.contextLine;
}