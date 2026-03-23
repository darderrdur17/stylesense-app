"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

export function DataBootstrap() {
  const { status, data: session } = useSession();
  const bootstrap = useStore((s) => s.bootstrap);
  const reset = useStore((s) => s.reset);
  const sessionUserId = session?.user?.id;

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      reset();
      return;
    }
    if (status === "authenticated") {
      // Load profile + wardrobe for both demo and self-registered users; re-run if account changes.
      void bootstrap();
    }
  }, [status, sessionUserId, bootstrap, reset]);

  return null;
}
