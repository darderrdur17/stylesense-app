"use client";

import { getSession, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";

/** Delay before treating “logged out” as real — avoids wiping UI when tab refocus triggers a flaky session refetch. */
const UNAUTH_RESET_MS = 450;

export function DataBootstrap() {
  const { status, data: session } = useSession();
  const bootstrap = useStore((s) => s.bootstrap);
  const reset = useStore((s) => s.reset);
  const sessionUserId = session?.user?.id;
  const unauthTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated") {
      if (unauthTimer.current) {
        clearTimeout(unauthTimer.current);
        unauthTimer.current = null;
      }
      void bootstrap();
      return;
    }

    if (status === "unauthenticated") {
      if (unauthTimer.current) clearTimeout(unauthTimer.current);
      unauthTimer.current = setTimeout(() => {
        unauthTimer.current = null;
        void getSession().then((s) => {
          if (!s) reset();
        });
      }, UNAUTH_RESET_MS);
    }

    return () => {
      if (unauthTimer.current) {
        clearTimeout(unauthTimer.current);
        unauthTimer.current = null;
      }
    };
  }, [status, sessionUserId, bootstrap, reset]);

  return null;
}
