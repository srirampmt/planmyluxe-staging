export const TAWK_SCRIPT_ID = "pml-tawk-script";
export const TAWK_SRC = "https://embed.tawk.to/6284328cb0d10b6f3e72bb70/1g3a6atnh";
export const TAWK_OPEN_EVENT = "pml:open-tawk";

type TawkApi = {
  maximize?: () => void;
  toggle?: () => void;
};

type TawkWindow = Window & {
  Tawk_API?: TawkApi;
  pmlOpenTawk?: () => void;
};

export function openTawkChat(): void {
  if (typeof window === "undefined") return;

  const tawkWindow = window as TawkWindow;
  if (typeof tawkWindow.pmlOpenTawk === "function") {
    tawkWindow.pmlOpenTawk();
    return;
  }

  window.dispatchEvent(new Event(TAWK_OPEN_EVENT));
}