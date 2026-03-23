"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Safari / bfcache: when users return from an external site (same tab, back button),
 * the React tree can appear blank. Refreshing RSC payload restores the UI.
 */
export function VisibilityRecovery() {
  const router = useRouter();

  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        router.refresh();
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [router]);

  return null;
}
