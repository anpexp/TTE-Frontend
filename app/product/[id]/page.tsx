"use client";

import { memo, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import Button from "@/components/atoms/Button";
import {
  FavoriteID,
  useFavoriteStatus,
} from "@/components/context/FavoritesContext";
import { useAuth } from "@/components/auth/AuthContext";
import { useCart } from "@/components/context/CartContext";
import { ProductDetail, ProductService } from "@/components/lib/ProductService";

function toBool(v: any) {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v.trim().toLowerCase() === "true";
  if (typeof v === "number") return v !== 0;
  return false;
}

function computeAvailable(p: any) {
  if (!p) return false;
  const flags = [
    p.isInStock,
    p.available,
    p.inStock,
    typeof p.isOutOfStock !== "undefined" ? !toBool(p.isOutOfStock) : undefined,
  ];
  for (const f of flags) if (typeof f !== "undefined") return toBool(f);
  const inv = Number(
    p.inventoryAvailable ?? p.availableInventory ?? p.inventory ?? p.stock ?? 0
  );
  return inv > 0;
}

const FavoriteToggleButton = memo(
  ({ productId }: { productId: FavoriteID }) => {
    const { isFavorite, toggle } = useFavoriteStatus(productId);

    return (
      <Button onClick={toggle}>
        {isFavorite ? "Remove from wishlist" : "Add to wishlist"}
      </Button>
    );
  }
);

FavoriteToggleButton.displayName = "FavoriteToggleButton";

export default function Page() {
  const router = useRouter();
  const { id: rawId } = useParams() as { id?: string | string[] };
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [cartErr, setCartErr] = useState<string | null>(null);

  const fmt = useMemo(
    () =>
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
    []
  );

  useEffect(() => {
    let active = true;
    if (!id) {
      setLoading(false);
      setError("Invalid product id");
      return;
    }
    setLoading(true);
    setError(null);
    ProductService.getById(id)
      .then((d) => {
        if (active) setProduct(d);
      })
      .catch((e: any) => {
        if (active) setError(e?.message || "Error loading product");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const onAdd = async () => {
    if (!id) return;
    if (!user) {
      router.push(`/login?from=/product/${id}`);
      return;
    }
    try {
      setAdding(true);
      setCartErr(null);
      const fresh = await ProductService.getById(id);
      setProduct(fresh);
      if (!computeAvailable(fresh)) {
        setCartErr("This item is out of stock");
        return;
      }
      await addItem(id, 1);
    } catch (e: any) {
      setCartErr(e?.message || "Error adding to cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="p-8">Loading…</div>;

  if (error)
    return (
      <div className="p-8">
        <div className="mb-4 text-red-600">{error}</div>
        <Button onClick={() => router.back()}>Go back</Button>
      </div>
    );

  if (!product) return null;

  const available = computeAvailable(product);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="relative h-80 w-full overflow-hidden rounded-xl bg-zinc-100 md:h-[28rem]">
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
            priority
          />
        </div>
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">{product.title}</h1>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold">
              {fmt.format(product.price)}
            </span>
            {!available ? (
              <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                Out of stock
              </span>
            ) : (product as any).isLowStock ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                Low stock
              </span>
            ) : (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                In stock
              </span>
            )}
          </div>
          <p className="text-zinc-600">{product.description}</p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={onAdd}
              disabled={adding || !available}
              aria-disabled={adding || !available}
            >
              {available
                ? adding
                  ? "Adding..."
                  : "Add to cart"
                : "Unavailable"}
            </Button>
            <FavoriteToggleButton productId={product.id} />
          </div>
          {cartErr && <div className="text-sm text-red-600">{cartErr}</div>}
        </div>
      </div>
    </div>
  );
}
