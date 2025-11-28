"use client";
import { memo, useMemo, useCallback, useState } from "react";
import { CurrencyRail, ShippingBanner } from "../../molecules/TopRails";
import BrandLogo from "../../molecules/BrandLogo";
import NavMenu, { type NavItem } from "../../molecules/NavMenu";
import ActionIcon from "../../molecules/SearchBar/ActionIcon";
import SearchBar from "../../molecules/SearchBar";
import {
  GuestDropdown,
  UserDropdown,
  type UserLike,
} from "../../molecules/UserDropdown";
import Button from "../../atoms/Button";
import { useAuth } from "@/components/auth/AuthContext";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useFavoritesCount } from "@/components/context/FavoritesContext";

const AutoWishlistActionIcon = memo(({ onClick }: { onClick?: () => void }) => {
  const count = useFavoritesCount();
  return (
    <ActionIcon
      name="heart"
      ariaLabel="Wishlist"
      onClick={onClick}
      count={count}
    />
  );
});

AutoWishlistActionIcon.displayName = "AutoWishlistActionIcon";

function WishlistActionIcon({
  count,
  onClick,
}: {
  count?: number;
  onClick?: () => void;
}) {
  if (typeof count === "number") {
    return (
      <ActionIcon
        name="heart"
        ariaLabel="Wishlist"
        onClick={onClick}
        count={count}
      />
    );
  }

  return <AutoWishlistActionIcon onClick={onClick} />;
}

export type HeaderProps = {
  currency?: string;
  user?: UserLike | null;
  cartCount?: number;
  wishlistCount?: number;
  navItems?: NavItem[];
  onSearch?: (q: string) => void;
  onSelectCurrency?: () => void;
  onGoToCart?: () => void;
  onGoToWishlist?: () => void;
  onLogoClick?: () => void;
  onSignIn?: () => void;
  onLogout?: () => void;
  onGoToPortal?: () => void;
};

const defaultNav: NavItem[] = [
  { key: "shop-list", label: "Shop List", href: "/my-orders" },
  { key: "wishlist", label: "Wishlist", href: "/favorites" },
];

function HeaderImpl({
  currency,
  cartCount = 0,
  wishlistCount,
  navItems = defaultNav,
  onSearch,
  onSelectCurrency,
  onGoToCart,
  onGoToWishlist,
  onLogoClick,
}: Partial<HeaderProps>) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const hideNativeCart = useMemo(
    () => (pathname ?? "").startsWith("/employee-portal"),
    [pathname]
  );
  const roleStr = useMemo(
    () => (user?.role ?? "").toString().toLowerCase(),
    [user?.role]
  );
  const isStaff =
    roleStr === "employee" || roleStr === "admin" || roleStr === "superadmin";
  const showShopperIcons = !isStaff && !hideNativeCart;

  const effectiveNavItems = useMemo(
    () =>
      isStaff
        ? navItems.filter((i) => i.key !== "shop-list" && i.key !== "wishlist")
        : navItems,
    [isStaff, navItems]
  );

  const toggleSearch = useCallback(() => setShowSearch((v) => !v), []);
  const toggleMobile = useCallback(() => setMobileOpen((v) => !v), []);

  const handleSignIn = useCallback(() => router.push("/login"), [router]);
  const handleSignUp = useCallback(() => router.push("/register"), [router]);
  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/");
  }, [logout, router]);
  const handlePortal = useCallback(
    () => router.push("/employee-portal"),
    [router]
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <CurrencyRail currency={currency} onSelectCurrency={onSelectCurrency} />
      <ShippingBanner />
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between py-2 md:py-3">
          <BrandLogo onClick={onLogoClick} />
          <NavMenu items={effectiveNavItems} />
          <div className="flex items-center gap-3 md:gap-4">
            <ActionIcon
              name="search"
              ariaLabel="Search"
              onClick={toggleSearch}
            />
            {showShopperIcons && (
              <>
                <WishlistActionIcon
                  count={wishlistCount}
                  onClick={onGoToWishlist}
                />
                <ActionIcon
                  name="cart"
                  ariaLabel="Cart"
                  onClick={onGoToCart}
                  count={cartCount}
                />
              </>
            )}
            {user ? (
              roleStr === "employee" || roleStr === "superadmin" ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-neutral-900">{user.name}</span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-sm underline underline-offset-2 hover:opacity-80"
                  >
                    Logout
                  </button>
                  <Button size="sm" onClick={handlePortal}>
                    Employee Portal
                  </Button>
                </div>
              ) : (
                <UserDropdown
                  user={user as any}
                  onLogout={handleLogout}
                  onGoToPortal={handlePortal}
                />
              )
            ) : (
              <GuestDropdown onSignIn={handleSignIn} onSignUp={handleSignUp} />
            )}
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-neutral-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 md:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={toggleMobile}
            >
              Menu
            </button>
          </div>
        </div>
        <div
          className={`pb-3 md:pb-6 ${showSearch ? "block" : "hidden md:block"}`}
        >
          <SearchBar onSearch={onSearch} />
        </div>
        <div
          id="mobile-menu"
          className={`md:hidden ${mobileOpen ? "block" : "hidden"}`}
        >
          <nav aria-label="Mobile" className="border-t border-neutral-200 py-3">
            <ul className="flex flex-col gap-2 text-sm">
              {effectiveNavItems.map((n) => (
                <li key={n.key}>
                  <Link
                    href={n.href}
                    className="block rounded-md px-2 py-2 font-medium hover:bg-neutral-100"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

function areEqual(a: Partial<HeaderProps>, b: Partial<HeaderProps>) {
  return (
    a.currency === b.currency &&
    a.cartCount === b.cartCount &&
    a.wishlistCount === b.wishlistCount &&
    a.onSearch === b.onSearch &&
    a.onSelectCurrency === b.onSelectCurrency &&
    a.onGoToCart === b.onGoToCart &&
    a.onGoToWishlist === b.onGoToWishlist &&
    a.onLogoClick === b.onLogoClick &&
    a.navItems === b.navItems
  );
}

export default memo(HeaderImpl, areEqual);
