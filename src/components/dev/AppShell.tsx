"use client";
import { memo } from "react";
import { usePathname } from "next/navigation";
import HeaderShell from "@/components/dev/HeaderShell";
import { CartProvider } from "@/components/context/CartContext";
import { useAuth } from "@/components/auth/AuthContext";

function AppShellImpl({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, ready } = useAuth();

  const onLogin = pathname?.startsWith("/login") ?? false;
  const isShopper = (user?.role ?? "").toLowerCase().includes("shopper");

  if (!ready) return null;
  if (onLogin) return <>{children}</>;

  const content = (
    <>
      <HeaderShell />
      {children}
    </>
  );

  return isShopper ? <CartProvider>{content}</CartProvider> : content;
}

export default memo(AppShellImpl);
