"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Shirt } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  /** Roles allowed to access this route. Empty = all authenticated users */
  allowedRoles?: string[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, initialize } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Redirect ke login dengan return URL
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Role-based access check
    if (allowedRoles && allowedRoles.length > 0 && user) {
      if (!allowedRoles.includes(user.role)) {
        // Kasir yang coba akses halaman owner → redirect ke POS
        if (user.role === "cashier") {
          router.replace("/app/kasir");
        } else {
          router.replace("/app");
        }
        return;
      }
    }

    setIsReady(true);
  }, [isAuthenticated, isLoading, user, allowedRoles, router, pathname]);

  // Loading state — premium spinner
  if (isLoading || !isReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans gap-6">
        <div className="relative">
          <div className="h-16 w-16 border-4 border-[#4DA8FF]/20 rounded-full" />
          <div className="absolute inset-0 h-16 w-16 border-4 border-[#4DA8FF] border-t-transparent rounded-full animate-spin" />
          <Shirt className="absolute inset-0 m-auto h-6 w-6 text-[#4DA8FF]/60" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest animate-pulse">
            Memverifikasi Sesi...
          </p>
          <p className="text-[10px] text-slate-600">LUNDRY.id Gateway</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
