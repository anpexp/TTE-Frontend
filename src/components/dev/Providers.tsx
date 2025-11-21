"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/auth/AuthContext";
import { FavoritesProvider } from "../context/FavoritesContext";
import { CartProvider } from "../context/CartContext";


export default function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({
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
  }));

  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>{children}</FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
