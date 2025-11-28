'use client';
// src/pages/MyOrdersPage.tsx
import { useRouter } from "next/navigation";
import OrdersTable from "../molecules/OrderTable";

export default function MyOrdersPage() {
  const router = useRouter();

  // Demo data (replace with API later)
  const orders = [
    // existing
    {
      id: 300,
      customerName: "John",
      paymentStatus: "Paid",
      amount: "$400",
      address: "Los Angeles",
      date: "9-Jan-2022",
      status: "Confirmed",
    },
    {
      id: 301,
      customerName: "John",
      paymentStatus: "Paid",
      amount: "$400",
      address: "Los Angeles",
      date: "9-Jan-2022",
      status: "Cancelled",
    },

    // new ones
    {
      id: 302,
      customerName: "John",
      paymentStatus: "Paid",
      amount: "$180",
      address: "San Diego",
      date: "12-Feb-2022",
      status: "Confirmed",
    },
    {
      id: 303,
      customerName: "John",
      paymentStatus: "Pending",
      amount: "$250",
      address: "San Jose",
      date: "20-Mar-2022",
      status: "In Process",
    },
    {
      id: 304,
      customerName: "John",
      paymentStatus: "Paid",
      amount: "$99",
      address: "Los Angeles",
      date: "2-Apr-2022",
      status: "Confirmed",
    },
    {
      id: 305,
      customerName: "John",
      paymentStatus: "Refunded",
      amount: "$65",
      address: "Pasadena",
      date: "15-Apr-2022",
      status: "Cancelled",
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">My Orders</h1>
        <select className="border px-3 py-1 rounded text-sm">
          <option>Last 7 Days</option>
          <option>Last Month</option>
          <option>Last Year</option>
        </select>
      </div>

      <OrdersTable
        orders={orders}
        onSelect={(id) => router.push(`/my-orders/${id}`)}
      />
    </div>
  );
}
