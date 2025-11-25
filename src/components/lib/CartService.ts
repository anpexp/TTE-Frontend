import { http } from "./http";

const API_ROOT = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
if (!API_ROOT) throw new Error("NEXT_PUBLIC_API_URL is required");
const CART = `${API_ROOT}/api/Cart`;

export enum PaymentMethod {
  Card = 0,
  CashOnDelivery = 1,
  BankTransfer = 2,
}

export type CartItem = {
  productId: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productImage: string;
};

export type Cart = {
  id: string;
  userId: string;
  shoppingCart: (number | string)[] | null;
  items: CartItem[];
  couponApplied: string | null;
  totalBeforeDiscount: number;
  totalAfterDiscount: number;
  shippingCost: number;
  finalTotal: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  address?: string;
  paymentMethod?: PaymentMethod;
};

const token = () =>
  localStorage.getItem("jwt_token") ||
  sessionStorage.getItem("jwt_token") ||
  localStorage.getItem("tte_token") ||
  "";

const auth = () => {
  const t = token();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const onLoginPage = () =>
  typeof window !== "undefined" && /^\/login(?:\/|$)/i.test(window.location.pathname);

const asDate = (v?: string) => (v ? new Date(v) : new Date(0));

type MineOptions = { onlyOrders?: boolean; from?: Date; to?: Date };

export const CartService = {
  getActive: async (): Promise<Cart | null> => {
    if (onLoginPage()) return null;
    if (!token()) return null;
    const res = await http.get<Cart>(`${CART}/active`, { headers: auth() });
    return res.data ?? null;
  },
  getAllMine: async (opts: MineOptions = {}): Promise<Cart[]> => {
    if (onLoginPage()) return [];
    if (!token()) return [];
    const res = await http.get<Cart[]>(`${CART}/my-carts`, { headers: auth() });
    const list = Array.isArray(res.data) ? res.data : [];
    const onlyOrders = opts.onlyOrders ?? false;
    const from = opts.from;
    const to = opts.to;
    const filtered = list.filter((x) => {
      if (onlyOrders && (!x.status || x.status === "Active")) return false;
      if (from && asDate(x.createdAt) < from) return false;
      if (to && asDate(x.createdAt) > to) return false;
      return true;
    });
    return filtered.sort((a, b) => asDate(b.createdAt).getTime() - asDate(a.createdAt).getTime());
  },
  addItem: async (productId: string, quantity = 1): Promise<Cart | null> => {
    if (onLoginPage()) return null;
    if (!token()) return null;
    const res = await http.post<Cart>(`${CART}/add-item`, { productId, quantity }, { headers: auth() });
    return res.data ?? null;
  },
  updateItem: async (productId: string, quantity: number): Promise<Cart | null> => {
    if (onLoginPage()) return null;
    if (!token()) return null;
    const res = await http.put<Cart>(`${CART}/update-item`, { productId, quantity }, { headers: auth() });
    return res.data ?? null;
  },
  removeItem: async (productId: string): Promise<Cart | null> => {
    if (onLoginPage()) return null;
    if (!token()) return null;
    const res = await http.delete<Cart>(`${CART}/remove-item/${productId}`, { headers: auth() });
    return res.data ?? null;
  },
  checkout: async (payload: { address: string; paymentMethod: PaymentMethod }): Promise<Cart | null> => {
    if (onLoginPage()) return null;
    if (!token()) return null;
    const res = await http.post<Cart>(`${CART}/checkout`, payload, {
      headers: { ...auth(), "Content-Type": "application/json" },
    });
    return res.data ?? null;
  },
  clear: async (): Promise<void> => {
    if (onLoginPage()) return;
    if (!token()) return;
    await http.post(`${CART}/clear`, {}, { headers: auth() });
  },
};
