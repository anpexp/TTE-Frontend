"use client";
import { memo, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function QueryProviderImpl({ children }: { children: React.ReactNode }) {
  const client = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, refetchOnWindowFocus: false },
          mutations: {
            onError: (err: any) => {
              try {
                if (err?.status === 401) {
                  localStorage.removeItem("jwt_token");
                  localStorage.removeItem("user");
                  window.location.reload();
                }
              } catch {}
            },
          },
        },
      }),
    []
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export default memo(QueryProviderImpl);
