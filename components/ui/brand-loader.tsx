"use client";

import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import * as React from "react";

import { cn } from "@/lib/utils";

const activeOverlayIds = new Set<string>();
const overlayListeners = new Set<() => void>();

function emitOverlayChange() {
  overlayListeners.forEach((listener) => listener());
}

function subscribeToOverlayChange(listener: () => void) {
  overlayListeners.add(listener);
  return () => {
    overlayListeners.delete(listener);
  };
}

function getActiveOverlayOwner() {
  const iterator = activeOverlayIds.values().next();
  return iterator.done ? null : iterator.value;
}

function useTimedLoaderVisibility(show: boolean, showDelay = 450, minimumVisible = 500) {
  const [visible, setVisible] = React.useState(false);
  const shownAt = React.useRef(0);

  React.useEffect(() => {
    let timeout: number | undefined;

    if (show) {
      if (!visible) {
        timeout = window.setTimeout(() => {
          shownAt.current = Date.now();
          setVisible(true);
        }, showDelay);
      }
    } else if (visible) {
      const elapsed = Date.now() - shownAt.current;
      timeout = window.setTimeout(() => {
        setVisible(false);
      }, Math.max(0, minimumVisible - elapsed));
    } else {
      setVisible(false);
    }

    return () => {
      if (timeout !== undefined) {
        window.clearTimeout(timeout);
      }
    };
  }, [minimumVisible, show, showDelay, visible]);

  return visible;
}

export function BrandLoader({ label = "Loading", className }: { label?: string; className?: string }) {
  return (
    <div className={cn("grid place-items-center", className)} role="status" aria-live="polite" aria-label={label}>
      <div className="brand-loader-mark relative grid h-28 w-28 place-items-center">
        <div className="brand-loader-aura absolute inset-4 rounded-full blur-2xl" aria-hidden="true" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 112 112" aria-hidden="true">
          <circle className="brand-loader-frame" cx="56" cy="56" r="43" fill="none" strokeWidth="1.2" />
          <circle className="brand-loader-orbit brand-loader-orbit-a" cx="56" cy="56" r="45" fill="none" strokeWidth="2.8" strokeLinecap="round" />
          <circle className="brand-loader-orbit brand-loader-orbit-b" cx="56" cy="56" r="36" fill="none" strokeWidth="1.8" strokeLinecap="round" />
          <circle className="brand-loader-star brand-loader-star-a" cx="87" cy="25" r="2.4" />
        </svg>
        <div className="brand-loader-plaque relative h-16 w-16 overflow-hidden rounded-full border border-[#d8bb73]/35 shadow-[0_18px_42px_rgba(0,0,0,0.42)]">
          <div className="brand-loader-plaque-shine absolute inset-0" aria-hidden="true" />
          <Image src="/logo/logo-2.png" alt="" fill className="object-contain p-2" sizes="64px" priority />
        </div>
      </div>
    </div>
  );
}

export function RouteLoadingScreen() {
  const visible = useTimedLoaderVisibility(true, 250, 500);

  if (!visible) return null;

  return (
    <div className="brand-loader-screen grid min-h-screen place-items-center px-5" data-route-loader="true">
      <div className="brand-loader-panel rounded-3xl p-5">
        <BrandLoader label="Loading" />
      </div>
    </div>
  );
}

export function LoadingOverlay({
  show,
  label,
  showDelay = 180,
  minimumVisible = 500
}: {
  show: boolean;
  label?: string;
  showDelay?: number;
  minimumVisible?: number;
}) {
  const overlayId = React.useId();
  const activeOwner = React.useSyncExternalStore(subscribeToOverlayChange, getActiveOverlayOwner, () => null);
  const [routeLoaderVisible, setRouteLoaderVisible] = React.useState(false);
  const timedVisible = useTimedLoaderVisibility(show, showDelay, minimumVisible);

  React.useEffect(() => {
    if (!show) {
      if (activeOverlayIds.delete(overlayId)) {
        emitOverlayChange();
      }
      return;
    }

    activeOverlayIds.add(overlayId);
    emitOverlayChange();

    return () => {
      if (activeOverlayIds.delete(overlayId)) {
        emitOverlayChange();
      }
    };
  }, [overlayId, show]);

  React.useEffect(() => {
    const checkRouteLoader = () => {
      setRouteLoaderVisible(document.querySelector("[data-route-loader='true']") !== null);
    };

    checkRouteLoader();

    const observer = new MutationObserver(checkRouteLoader);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  if (!show || !timedVisible || routeLoaderVisible || activeOwner !== overlayId) return null;

  return (
    <div className="brand-loader-screen fixed inset-0 z-[9999] grid place-items-center px-5" data-brand-loader-overlay="true">
      <div className="brand-loader-panel rounded-3xl p-5">
        <BrandLoader label={label} />
      </div>
    </div>
  );
}

export function NavigationLoadingOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [apiRequestCount, setApiRequestCount] = React.useState(0);
  const currentUrl = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`;
  const isLoading = isNavigating || apiRequestCount > 0;

  React.useEffect(() => {
    setIsNavigating(false);
  }, [currentUrl]);

  React.useEffect(() => {
    if (!isNavigating) return;

    const timeout = window.setTimeout(() => {
      setIsNavigating(false);
    }, 8000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isNavigating]);

  React.useEffect(() => {
    function beginRequest() {
      setApiRequestCount((count) => count + 1);
    }

    function endRequest() {
      setApiRequestCount((count) => Math.max(0, count - 1));
    }

    function shouldTrackRequest(input: RequestInfo | URL) {
      const rawUrl = typeof input === "string" || input instanceof URL ? input.toString() : input.url;
      const url = new URL(rawUrl, window.location.href);
      if (url.origin !== window.location.origin) return false;
      if (url.pathname.startsWith("/_next/static") || url.pathname.startsWith("/_next/image")) return false;
      return true;
    }

    const originalFetch = window.fetch.bind(window);
    const xhrUrls = new WeakMap<XMLHttpRequest, string>();

    window.fetch = async (input, init) => {
      const shouldTrack = shouldTrackRequest(input);
      if (shouldTrack) beginRequest();

      try {
        return await originalFetch(input, init);
      } finally {
        if (shouldTrack) endRequest();
      }
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    const callOpen = originalOpen as (
      this: XMLHttpRequest,
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null
    ) => void;

    XMLHttpRequest.prototype.open = function open(
      this: XMLHttpRequest,
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null
    ) {
      xhrUrls.set(this, String(url));
      if (async === undefined) {
        return callOpen.call(this, method, url);
      }

      return callOpen.call(this, method, url, async, username, password);
    } as typeof XMLHttpRequest.prototype.open;

    XMLHttpRequest.prototype.send = function send(body) {
      const requestUrl = xhrUrls.get(this);
      const shouldTrack = requestUrl ? shouldTrackRequest(requestUrl) : false;

      if (shouldTrack) {
        beginRequest();
        this.addEventListener("loadend", endRequest, { once: true });
      }

      return originalSend.call(this, body);
    };

    return () => {
      window.fetch = originalFetch;
      XMLHttpRequest.prototype.open = originalOpen;
      XMLHttpRequest.prototype.send = originalSend;
    };
  }, []);

  React.useEffect(() => {
    function isModifiedClick(event: MouseEvent) {
      return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
    }

    function shouldShowForUrl(url: URL) {
      if (url.origin !== window.location.origin) return false;
      const next = `${url.pathname}${url.search}`;
      const current = `${window.location.pathname}${window.location.search}`;
      return next !== current;
    }

    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || isModifiedClick(event)) return;

      const target = event.target instanceof Element ? event.target.closest("a") : null;
      if (!target) return;
      if (target.target && target.target !== "_self") return;
      if (target.hasAttribute("download")) return;

      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      const url = new URL(href, window.location.href);
      if (shouldShowForUrl(url)) {
        setIsNavigating(true);
      }
    }

    function handleSubmit(event: SubmitEvent) {
      if (event.defaultPrevented) return;
      const form = event.target instanceof HTMLFormElement ? event.target : null;
      if (!form) return;

      const method = (form.getAttribute("method") ?? "get").toLowerCase();
      if (method !== "get") return;

      const action = form.getAttribute("action") || window.location.pathname;
      const url = new URL(action, window.location.href);
      if (url.origin === window.location.origin) {
        setIsNavigating(true);
      }
    }

    function handlePopState() {
      setIsNavigating(true);
    }

    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return <LoadingOverlay show={isLoading} label={apiRequestCount > 0 ? "Loading data" : "Loading"} showDelay={80} minimumVisible={450} />;
}
