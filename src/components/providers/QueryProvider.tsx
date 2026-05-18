"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Instansiasi QueryClient di dalam state agar aman dari Re-creation saat Server Rendering
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 menit data dianggap segar
            refetchOnWindowFocus: false, // Jangan ambil data ulang setiap tab difokuskan
            retry: 1, // Ulangi request gagal 1 kali saja
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
