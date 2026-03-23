"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { DataBootstrap } from "./DataBootstrap";

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  /** From `auth()` in the root layout — avoids client session stuck on "loading" (which blocks data bootstrap). */
  session: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <DataBootstrap />
      {children}
    </SessionProvider>
  );
}
