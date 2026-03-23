"use client";

import { SessionProvider } from "next-auth/react";
import { DataBootstrap } from "./DataBootstrap";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DataBootstrap />
      {children}
    </SessionProvider>
  );
}
