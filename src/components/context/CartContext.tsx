"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
  useMemo,
} from "react";
import { usePathname } from "next/navigation";
import { CartService, type Cart } from "@/components/lib/CartService";
import { useAuth } from "@/components/auth/AuthContext";

type Ctx = {
  cart: Cart | null;
  refresh: () => Promise<void>;
  addItem: (productId: string, qty?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
};

type CartStore = {
  getSnapshot: () => Cart | null;
  subscribe: (listener: () => void) => () => void;
  refresh: () => Promise<void>;
  addItem: (productId: string, qty?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  reset: () => void;
};

type InternalCartStore = CartStore & {
  setCart: (value: Cart | null) => void;
};

const CartContext = createContext<CartStore | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  const cart = useSyncExternalStore(
    ctx.subscribe,
    ctx.getSnapshot,
    ctx.getSnapshot
  );

  return useMemo<Ctx>(
    () => ({
      cart,
      refresh: ctx.refresh,
      addItem: ctx.addItem,
      removeItem: ctx.removeItem,
    }),
    [cart, ctx]
  );
}

const getToken = () =>
  localStorage.getItem("jwt_token") ||
  sessionStorage.getItem("jwt_token") ||
  localStorage.getItem("tte_token") ||
  "";

const isShopper = (r?: string) => (r ?? "").toLowerCase() === "shopper";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const storeRef = useRef<InternalCartStore>();

  if (!storeRef.current) {
    const listeners = new Set<() => void>();
    let currentCart: Cart | null = null;

    const setCart = (value: Cart | null) => {
      currentCart = value;
      listeners.forEach((listener) => listener());
    };

    const refresh = async () => {
      try {
        const data = await CartService.getActive();
        setCart(data ?? null);
      } catch {
        setCart(null);
      }
    };

    const addItem = async (productId: string, qty = 1) => {
      try {
        const data = await CartService.addItem(productId, qty);
        setCart(data ?? null);
      } catch {
        await refresh();
      }
    };

    const removeItem = async (productId: string) => {
      try {
        const data = await CartService.removeItem(productId);
        setCart(data ?? null);
      } catch {
        await refresh();
      }
    };

    const subscribe = (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    };

    storeRef.current = {
      getSnapshot: () => currentCart,
      subscribe,
      refresh,
      addItem,
      removeItem,
      reset: () => setCart(null),
      setCart,
    };
  }

  const store = storeRef.current!;

  useEffect(() => {
    const onLogin = pathname?.startsWith("/login");
    const hasToken = !!getToken();
    const shopper = isShopper(user?.role);
    if (onLogin || !hasToken || !shopper) {
      store.reset();
      return;
    }
    void store.refresh();
  }, [pathname, user?.role, store]);

  return (
    <CartContext.Provider value={store}>{children}</CartContext.Provider>
  );
}
