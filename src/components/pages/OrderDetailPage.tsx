'use client';
import Link from "next/link";
import { useParams } from "next/navigation";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = (params?.orderId ?? params?.id ?? "").toString();

  // Mock data
  const order = {
    id: orderId,
    customer: "John",
    total: "$400",
    address: "Los Angeles",
    items: [
      { id: 1, name: "Headphones", qty: 1, price: "$100" },
      { id: 2, name: "Keyboard", qty: 2, price: "$150" },
    ],
    status: "Confirmed",
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Link href="/my-orders" className="text-blue-600 hover:underline">
        ← Back to My Orders
      </Link>
      <h1 className="text-2xl font-semibold mt-4 mb-6">Order #{order.id}</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><strong>Customer:</strong> {order.customer}</div>
          <div><strong>Status:</strong> {order.status}</div>
          <div><strong>Address:</strong> {order.address}</div>
          <div><strong>Total:</strong> {order.total}</div>
        </div>

        <h2 className="text-lg font-medium mt-6 mb-3">Products</h2>
        <ul className="divide-y">
          {order.items.map((item) => (
            <li key={item.id} className="py-2 flex justify-between">
              <span>{item.name} × {item.qty}</span>
              <span>{item.price}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
