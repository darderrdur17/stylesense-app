"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

export function DataBootstrap() {
  const { status } = useSession();
  const bootstrap = useStore((s) => s.bootstrap);
  const reset = useStore((s) => s.reset);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "authenticated") {
      void bootstrap();
    }
    if (status === "unauthenticated") {
      reset();
    }
  }, [status, bootstrap, reset]);

  return null;
}
