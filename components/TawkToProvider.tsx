'use client';

import { useEffect } from 'react';

import { TAWK_OPEN_EVENT, TAWK_SCRIPT_ID, TAWK_SRC } from '@/lib/tawk';

type TawkApi = {
  maximize?: () => void;
  toggle?: () => void;
};

type TawkState = {
  intervalId?: number;
  startedAt?: number;
  pendingOpen?: boolean;
  reloadTriggered?: boolean;
};

type TawkWindow = Window & {
  Tawk_API?: TawkApi;
  pmlOpenTawk?: () => void;
  __pmlTawkState?: TawkState;
};

const OPEN_TIMEOUT_MS = 8000;
const RECOVERY_RELOAD_MS = 2500;
const POLL_INTERVAL_MS = 100;

function getTawkState(tawkWindow: TawkWindow): TawkState {
  if (!tawkWindow.__pmlTawkState) {
    tawkWindow.__pmlTawkState = {};
  }

  return tawkWindow.__pmlTawkState;
}

function getExistingScript(): HTMLScriptElement | null {
  const byId = document.getElementById(TAWK_SCRIPT_ID);
  if (byId instanceof HTMLScriptElement) {
    return byId;
  }

  const bySrc = document.querySelector(`script[src="${TAWK_SRC}"]`);
  if (bySrc instanceof HTMLScriptElement) {
    bySrc.id = TAWK_SCRIPT_ID;
    return bySrc;
  }

  return null;
}

function removeManagedScripts(): void {
  const scripts = Array.from(document.querySelectorAll(`script[src="${TAWK_SRC}"]`));
  for (const script of scripts) {
    script.parentNode?.removeChild(script);
  }

  const byId = document.getElementById(TAWK_SCRIPT_ID);
  if (byId && !scripts.includes(byId)) {
    byId.parentNode?.removeChild(byId);
  }
}

function ensureScript(forceReload = false): HTMLScriptElement {
  if (forceReload) {
    removeManagedScripts();
  } else {
    const existing = getExistingScript();
    if (existing) {
      return existing;
    }
  }

  const script = document.createElement('script');
  script.id = TAWK_SCRIPT_ID;
  script.src = TAWK_SRC;
  script.async = true;
  script.charset = 'UTF-8';
  script.setAttribute('crossorigin', '*');
  document.body.appendChild(script);

  return script;
}

function isWidgetReady(tawkWindow: TawkWindow): boolean {
  return Boolean(
    typeof tawkWindow.Tawk_API?.maximize === 'function' ||
      typeof tawkWindow.Tawk_API?.toggle === 'function'
  );
}

function tryOpenWidget(tawkWindow: TawkWindow): boolean {
  if (typeof tawkWindow.Tawk_API?.maximize === 'function') {
    try {
      tawkWindow.Tawk_API.maximize();
      return true;
    } catch {
      return false;
    }
  }

  if (typeof tawkWindow.Tawk_API?.toggle === 'function') {
    try {
      tawkWindow.Tawk_API.toggle();
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

function stopRecovery(tawkWindow: TawkWindow): void {
  const state = getTawkState(tawkWindow);
  if (state.intervalId) {
    window.clearInterval(state.intervalId);
  }

  state.intervalId = undefined;
  state.startedAt = undefined;
  state.pendingOpen = false;
  state.reloadTriggered = false;
}

function startRecovery(tawkWindow: TawkWindow, pendingOpen: boolean): void {
  const state = getTawkState(tawkWindow);
  state.pendingOpen = state.pendingOpen || pendingOpen;

  ensureScript();

  if (state.pendingOpen && tryOpenWidget(tawkWindow)) {
    stopRecovery(tawkWindow);
    return;
  }

  if (!state.pendingOpen && isWidgetReady(tawkWindow)) {
    stopRecovery(tawkWindow);
    return;
  }

  if (state.intervalId) {
    return;
  }

  state.startedAt = Date.now();
  state.reloadTriggered = false;
  state.intervalId = window.setInterval(() => {
    const activeState = getTawkState(tawkWindow);
    const elapsed = Date.now() - (activeState.startedAt ?? Date.now());

    if (activeState.pendingOpen) {
      if (tryOpenWidget(tawkWindow)) {
        stopRecovery(tawkWindow);
        return;
      }
    } else if (isWidgetReady(tawkWindow)) {
      stopRecovery(tawkWindow);
      return;
    }

    if (!activeState.reloadTriggered && elapsed >= RECOVERY_RELOAD_MS) {
      ensureScript(true);
      activeState.reloadTriggered = true;
      return;
    }

    if (elapsed >= OPEN_TIMEOUT_MS) {
      stopRecovery(tawkWindow);
    }
  }, POLL_INTERVAL_MS);
}

const TawkToProvider = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tawkWindow = window as TawkWindow;
    tawkWindow.pmlOpenTawk = () => {
      startRecovery(tawkWindow, true);
    };

    const onOpen = () => {
      tawkWindow.pmlOpenTawk?.();
    };

    window.addEventListener(TAWK_OPEN_EVENT, onOpen);

    // Defer the initial (non-user-triggered) widget load until the browser is
    // idle, so it doesn't compete with the critical rendering path. The
    // user-triggered open path (pmlOpenTawk above) stays synchronous.
    const idleWindow = window as Window & {
      requestIdleCallback?: (cb: IdleRequestCallback) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;

    if (typeof idleWindow.requestIdleCallback === 'function') {
      idleHandle = idleWindow.requestIdleCallback(() => startRecovery(tawkWindow, false));
    } else {
      timeoutHandle = window.setTimeout(() => startRecovery(tawkWindow, false), 1);
    }

    return () => {
      window.removeEventListener(TAWK_OPEN_EVENT, onOpen);
      if (idleHandle !== undefined) {
        idleWindow.cancelIdleCallback?.(idleHandle);
      }
      if (timeoutHandle !== undefined) {
        window.clearTimeout(timeoutHandle);
      }
    };
  }, []);

  return null;
};

export default TawkToProvider;


