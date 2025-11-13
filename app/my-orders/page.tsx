"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { Cart, CartService } from "@/components/lib/CartService";

function Badge({ status }: { status: string }) {
  const m: Record<string, string> = {
    Confirmed: "bg-green-100 text-green-800",
    CheckedOut: "bg-green-100 text-green-800",
    Paid: "bg-green-100 text-green-800",
    Processing: "bg-yellow-100 text-yellow-800",
    Cancelled: "bg-red-100 text-red-800",
    Active: "bg-zinc-100 text-zinc-700",
  };
  return <span className={`rounded px-2 py-1 text-xs font-medium ${m[status] || "bg-gray-100 text-gray-800"}`}>{status}</span>;
}

export default function Page() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fmt = useMemo(() => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }), []);

  useEffect(() => {
    let active = true;
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    CartService.getAllMine()
      .then((list) => {
        if (!active) return;
        const done = (list || []).filter(x => x.status && x.status !== "Active");
        setOrders(done);
      })
      .catch((e: any) => { if (active) setError(e?.message || "No se pudieron cargar las órdenes"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">Inicia sesión para ver tus órdenes</div>
        <button onClick={() => router.push("/login")} className="rounded-lg bg-black px-4 py-2 text-white">Ir a iniciar sesión</button>
      </div>
    );
  }

  if (loading) return <div className="mx-auto max-w-6xl px-4 py-16">Cargando órdenes…</div>;
  if (error) return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
      <button onClick={() => router.refresh()} className="rounded-lg bg-black px-4 py-2 text-white">Reintentar</button>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Orders</h1>
      </div>
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="min-w-full table-fixed">
          <thead className="bg-zinc-50 text-left text-sm text-zinc-600">
            <tr>
              <th className="px-5 py-3 font-medium">Order No.</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Order Date</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-zinc-50">
                <td className="px-5 py-4">{o.id.slice(0, 8)}</td>
                <td className="px-5 py-4 font-medium">{fmt.format(o.finalTotal ?? 0)}</td>
                <td className="px-5 py-4">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "-"}</td>
                <td className="px-5 py-4"><Badge status={o.status} /></td>
              </tr>
            ))}
            {!orders.length && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-zinc-500">No tienes órdenes</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
