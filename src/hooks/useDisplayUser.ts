"use client";

import { useSession } from "next-auth/react";
import { useStore } from "@/lib/store";

/** Prefer API-loaded profile; fall back to JWT session so the UI isn’t blank if /api/me is slow or fails. */
export function useDisplayUser() {
  const user = useStore((s) => s.user);
  const { data: session } = useSession();

  const name =
    (user.name && user.name.trim()) ||
    (session?.user?.name && String(session.user.name).trim()) ||
    "";
  const email =
    (user.email && user.email.trim()) ||
    (session?.user?.email && String(session.user.email).trim()) ||
    "";
  const location = (user.location && user.location.trim()) || "New York";

  return { name, email, location };
}
