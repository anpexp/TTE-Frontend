import { http } from "./http";

const API_ROOT = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
if (!API_ROOT) throw new Error("NEXT_PUBLIC_API_URL is required");
const CART = `${API_ROOT}/api/Cart`;

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
};

const getToken = () =>
  localStorage.getItem("jwt_token") ||
  sessionStorage.getItem("jwt_token") ||
  localStorage.getItem("tte_token") ||
  "";

const onLoginPage = () =>
  typeof window !== "undefined" && /^\/login(?:\/|$)/i.test(window.location.pathname);

const authHeader = () => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export const CartService = {
  getMine: async (): Promise<Cart | null> => {
    if (onLoginPage()) return null;
    const t = getToken();
    if (!t) return null;
    const res = await http.get<Cart>(`${CART}/my-carts`, { headers: authHeader() });
    return res.data ?? null;
  },
  getAllMine: async (): Promise<Cart[]> => {
    if (onLoginPage()) return [];
    const t = getToken();
    if (!t) return [];
    const res = await http.get<Cart[]>(`${CART}/my-carts`, { headers: authHeader() });
    return Array.isArray(res.data) ? res.data : [];
  },
  addItem: async (productId: string, quantity = 1): Promise<Cart | null> => {
    if (onLoginPage()) return null;
    const t = getToken();
    if (!t) return null;
    const res = await http.post<Cart>(`${CART}/add-item`, { productId, quantity }, { headers: authHeader() });
    return res.data ?? null;
  },
  removeItem: async (productId: string): Promise<Cart | null> => {
    if (onLoginPage()) return null;
    const t = getToken();
    if (!t) return null;
    const res = await http.post<Cart>(`${CART}/remove-item`, { productId }, { headers: authHeader() });
    return res.data ?? null;
  },
};
