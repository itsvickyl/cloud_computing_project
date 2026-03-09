"use client";

// import { SessionProvider } from "next-auth/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { LoadingProvider } from "./loading-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            retry: 1,
            networkMode: "online",
            structuralSharing: true,
          },
        },
      })
  );

  return (
    <LoadingProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </LoadingProvider>
  );
}

// <SessionProvider
//   refetchInterval={0}
//   refetchOnWindowFocus={false}
//   refetchWhenOffline={false}
//   basePath="/api/auth"
// >
//   {children}
// </SessionProvider>
