import { HttpClient } from "./HttpClient";

const http = HttpClient.instance;

export type OrderItem = {
  productId: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productImage?: string;
};

export type Order = {
  id: string;
  orderNumber?: string | number;
  customerName?: string;
  amount: number;
  address?: string;
  createdAt: string;
  status: string;
  items: OrderItem[];
};

export const OrderService = {
  async getMine(): Promise<Order[]> {
    const { data } = await http.get("/api/Order/my-orders");
    return data;
  },
  async getById(id: string): Promise<Order> {
    const { data } = await http.get(`/api/Order/${id}`);
    return data;
  },
};
