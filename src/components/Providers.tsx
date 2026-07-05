"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/lib/ThemeContext";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </SessionProvider>
  );
}
