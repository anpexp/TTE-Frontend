"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { Cart, CartService } from "@/components/lib/CartService";

enum PaymentMethod {
  Card = 0,
  CashOnDelivery = 1,
  BankTransfer = 2,
}

export default function Page() {
  const router = useRouter();
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.Card
  );
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const fmt = useMemo(
    () =>
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
    []
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    if (!user) {
      setLoading(false);
      return;
    }
    CartService.getActive()
      .then((data) => {
        if (active) {
          setCart(data);
          setAddress((data as any)?.address ?? "");
          const pm = (data as any)?.paymentMethod;
          setPaymentMethod(typeof pm === "number" ? pm : PaymentMethod.Card);
        }
      })
      .catch((e: any) => {
        if (active) setError(e?.message || "No se pudo cargar el carrito");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const handleCheckout = async () => {
    if (submitting) return;
    setCheckoutError(null);
    if (!address.trim()) {
      setCheckoutError("Please enter an address");
      return;
    }
    setSubmitting(true);
    try {
      await CartService.checkout({ address, paymentMethod });
      router.push("/my-orders");
    } catch (e: any) {
      setCheckoutError(e?.message || "Error en checkout");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
          Inicia sesión para ver tu carrito
        </div>
        <button
          onClick={() => router.push("/login")}
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          Ir a iniciar sesión
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="animate-pulse text-zinc-600">Cargando carrito…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
        <button
          onClick={() => router.refresh()}
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!cart || !cart.items?.length) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="mb-2 text-2xl font-semibold">Tu carrito</h1>
        <p className="text-zinc-600">Aún no tienes productos.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Tu carrito</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cart.items.map((it) => (
            <div
              key={it.productId}
              className="flex items-center gap-4 rounded-xl border p-4"
            >
              <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-zinc-100">
                {it.productImage ? (
                  <Image
                    src={it.productImage}
                    alt={it.productTitle}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">{it.productTitle}</div>
                <div className="text-sm text-zinc-600">
                  Cantidad: {it.quantity}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-zinc-600">
                  {fmt.format(it.unitPrice)} c/u
                </div>
                <div className="font-semibold">{fmt.format(it.totalPrice)}</div>
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-4 rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">Subtotal</span>
            <span>{fmt.format(cart.totalBeforeDiscount ?? 0)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">Descuento</span>
            <span>
              {fmt.format(
                (cart.totalBeforeDiscount ?? 0) - (cart.totalAfterDiscount ?? 0)
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">Envío</span>
            <span>{fmt.format(cart.shippingCost ?? 0)}</span>
          </div>
          <div className="border-t pt-3" />
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{fmt.format(cart.finalTotal ?? 0)}</span>
          </div>

          <div className="pt-2" />
          <div className="flex flex-col gap-2">
            <label className="text-sm">Address</label>
            <input
              className="w-full rounded-md border px-3 py-2"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Av. Siempre Viva 742"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm">Payment Method</label>
            <select
              className="w-full rounded-md border px-3 py-2"
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(Number(e.target.value) as PaymentMethod)
              }
            >
              <option value={PaymentMethod.Card}>Card</option>
              <option value={PaymentMethod.CashOnDelivery}>
                Cash On Delivery
              </option>
              <option value={PaymentMethod.BankTransfer}>Bank Transfer</option>
            </select>
          </div>

          {checkoutError && (
            <div className="text-sm text-red-600">{checkoutError}</div>
          )}

          <div className="text-sm text-zinc-500">Estado: {cart.status}</div>
          <button
            onClick={handleCheckout}
            disabled={submitting}
            className="mt-2 w-full rounded-lg bg-black px-4 py-2 text-white disabled:opacity-60"
          >
            {submitting ? "Procesando…" : "Continuar"}
          </button>
        </aside>
      </div>
    </div>
  );
}
