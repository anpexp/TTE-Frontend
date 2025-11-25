"use client";
import { memo, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Header from "@/components/organisms/Header";
import { useAuth } from "@/components/auth/AuthContext";
import { useFavorites } from "@/components/context/FavoritesContext";
import { useCart } from "@/components/context/CartContext";
import type { UserLike } from "@/components/molecules/UserDropdown";

function HeaderShellImpl() {
  const { items } = useFavorites();
  const { cart } = useCart();
  const { user: authUser } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const showHeader = useMemo(
    () => pathname !== "/login" && pathname !== "/forgot-password",
    [pathname]
  );

  const user: UserLike | null = useMemo(() => {
    if (!authUser) return null;
    const r = String(authUser.role || "").toLowerCase();
    const role = r.includes("admin")
      ? "admin"
      : r.includes("employee")
      ? "employee"
      : "shopper";
    return {
      id: authUser.id,
      name: authUser.name,
      avatarUrl: authUser.avatarUrl,
      role,
    };
  }, [authUser]);

  const handleSearch = useCallback(
    (q: string) =>
      router.push(`/products${q ? `?q=${encodeURIComponent(q)}` : ""}`),
    [router]
  );
  const handleGoToCart = useCallback(() => router.push("/my-orders"), [router]);
  const handleGoToWishlist = useCallback(
    () => router.push("/favorites"),
    [router]
  );
  const handleSelectCurrency = useCallback(() => {}, []);
  const handleLogoClick = useCallback(() => router.push("/"), [router]);

  const cartCount = useMemo(
    () => cart?.items?.reduce((total, item) => total + (item.quantity ?? 0), 0) ?? 0,
    [cart]
  );
  const wishlistCount = items.length;

  if (!showHeader) return null;

  return (
    <Header
      currency="USD"
      user={user}
      cartCount={cartCount}
      wishlistCount={wishlistCount}
      onSearch={handleSearch}
      onGoToCart={handleGoToCart}
      onGoToWishlist={handleGoToWishlist}
      onSelectCurrency={handleSelectCurrency}
      onLogoClick={handleLogoClick}
    />
  );
}

export default memo(HeaderShellImpl);
