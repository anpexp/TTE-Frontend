"use client";
import { memo, useMemo, useCallback } from "react";
import Header from "@/components/organisms/Header";
import { useFavorites } from "@/components/context/FavoritesContext";
import { useAuth } from "@/components/auth/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import type { UserLike } from "@/components/molecules/UserDropdown";

function HeaderShellImpl() {
  const { items } = useFavorites();
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

  if (!showHeader) return null;

  return (
    <Header
      currency="USD"
      user={user}
      cartCount={3}
      wishlistCount={items?.length || 0}
      onSearch={handleSearch}
      onGoToCart={handleGoToCart}
      onGoToWishlist={handleGoToWishlist}
      onSelectCurrency={handleSelectCurrency}
      onLogoClick={handleLogoClick}
    />
  );
}

export default memo(HeaderShellImpl);
