"use client";

import React from "react";
import { AuthGuard } from "@/components/providers/AuthGuard";
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  );
}

