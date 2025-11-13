"use client";
import { usePathname } from "next/navigation";
import HeaderShell from "@/components/dev/HeaderShell";
import { CartProvider } from "@/components/context/CartContext";
import { useAuth } from "@/components/auth/AuthContext";

const isShopper = (r?: string) => (r ?? "").toLowerCase() === "shopper";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const onLogin = pathname?.startsWith("/login");
  if (onLogin) return <>{children}</>;
  if (isShopper(user?.role)) {
    return (
      <CartProvider>
        <HeaderShell />
        {children}
      </CartProvider>
    );
  }
  return (
    <>
      <HeaderShell />
      {children}
    </>
  );
}
