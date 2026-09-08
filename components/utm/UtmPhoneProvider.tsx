"use client";

import React, { createContext, useContext } from "react";
import { DEFAULT_CALL_PHONE_DISPLAY, DEFAULT_CALL_PHONE_TEL } from "@/lib/phone";

export type UtmPhoneContextValue = {
  phoneDisplay: string;
  phoneTel: string;
};

const UtmPhoneContext = createContext<UtmPhoneContextValue | null>(null);

export function UtmPhoneProvider({
  value,
  children,
}: {
  value: UtmPhoneContextValue;
  children: React.ReactNode;
}) {
  return <UtmPhoneContext.Provider value={value}>{children}</UtmPhoneContext.Provider>;
}

export function useUtmPhone() {
  const ctx = useContext(UtmPhoneContext);
  if (ctx) return ctx;

  // Provider should always be present (layout), but keep a safe fallback.
  return {
    phoneDisplay: DEFAULT_CALL_PHONE_DISPLAY,
    phoneTel: DEFAULT_CALL_PHONE_TEL,
  } satisfies UtmPhoneContextValue;
}
