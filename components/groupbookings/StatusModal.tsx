"use client";

import { useEffect } from "react";

type StatusModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  variant: "success" | "error";
  message: string;
};

export default function StatusModal({
  open,
  onClose,
  title,
  variant,
  message,
}: StatusModalProps) {
  // ESC + body scroll lock (same pattern as EnquiryModal)
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const styles =
    variant === "success"
      ? {
          box: "border-green-600 bg-green-50",
          heading: "Message sent!",
          button: "bg-pml-primary hover:bg-pink-800",
        }
      : {
          box: "border-red-600 bg-red-50",
          heading: "Something went wrong",
          button: "bg-[#595858] hover:bg-[#3f3f3f]",
        };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[560px] max-h-[calc(100vh-2rem)] bg-white rounded-[4px] overflow-hidden shadow-2xl font-['Montserrat']"
      >
        <div className="flex items-center justify-between bg-[#595858] text-white px-4 py-3">
          <div className="text-[16px] md:text-[18px] font-semibold">
            {title}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/90 hover:text-white text-[22px] leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-4 md:p-5 bg-[#F3F3F3] overflow-y-auto">
          <div className={`rounded-[4px] border p-4 text-[#4C4C4C] ${styles.box}`}>
            <div className="font-semibold">{styles.heading}</div>
            <div className="text-sm mt-1 whitespace-pre-wrap">{message}</div>

            <button
              type="button"
              onClick={onClose}
              className={`mt-4 w-full text-white font-semibold py-3 rounded-[8px] transition-all duration-200 text-[16px] ${styles.button}`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
