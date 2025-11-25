
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

export default function ProductDetailPage() {
  const router = useRouter();
  const { id: rawId } = useParams() as { id?: string | string[] };
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fmt = useMemo(() => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }), []);

  useEffect(() => {
    let active = true;
    if (!id) {
      setLoading(false);
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

  const [adding, setAdding] = useState(false);
  const [cartErr, setCartErr] = useState<string | null>(null);
  const onAdd = async () => {
    if (!id) return;
    if (!user) {
      router.push(`/login?from=/product/${id}`);
      return;
    }
    setAdding(true);
    setCartErr(null);
    try {
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
          <p className="text-zinc-600">{product.description}</p>
          <div className="text-2xl font-bold">{fmt.format(product.price)}</div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={onAdd} disabled={adding}>{adding ? "Adding..." : "Add to cart"}</Button>
            <FavoriteToggleButton productId={product.id} />
          </div>
          {cartErr && <div className="text-sm text-red-600">{cartErr}</div>}
        </div>
      </div>
    </div>
  );
}
