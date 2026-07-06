"use client";

import * as React from "react";
import { Toaster } from "@/app/components/ui/Toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster />
      {children}
    </>
  );
}

