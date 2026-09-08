"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useUtmPhone } from "@/components/utm/UtmPhoneProvider";

export type PhoneNumberValue = {
  phoneDisplay: string;
  phoneTel: string;
};

type PhoneNumberProps = {
  asLink?: boolean;
  className?: string;
  children?: ReactNode | ((value: PhoneNumberValue) => ReactNode);
};

export default function PhoneNumber({
  asLink = false,
  className,
  children,
}: PhoneNumberProps) {
  const { phoneDisplay, phoneTel } = useUtmPhone();
  const value = { phoneDisplay, phoneTel };

  if (typeof children === "function") {
    return <>{children(value)}</>;
  }

  if (children) {
    return <>{children}</>;
  }

  if (!asLink) return <span className={className}>{phoneDisplay}</span>;

  return (
    <Link href={`tel:${phoneTel}`} className={className}>
      {phoneDisplay}
    </Link>
  );
}
