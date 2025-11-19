"use client";
import { usePathname } from "next/navigation";
import HeaderShell from "@/components/dev/HeaderShell";
import { CartProvider } from "@/components/context/CartContext";
import { useAuth } from "@/components/auth/AuthContext";

const isShopper = (r?: string) => (r ?? "").toLowerCase().includes("shopper");

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, ready } = useAuth();

  if (!ready) return null;

  const onLogin = pathname?.startsWith("/login");
  if (onLogin) return <>{children}</>;

  const content = (
    <>
      <HeaderShell />
      {children}
    </>
  );

  if (isShopper(user?.role)) {
    return <CartProvider>{content}</CartProvider>;
  }

  return content;
}
