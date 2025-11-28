import { useEffect, useState } from "react";
import ProductCard, { type ProductLike } from "../molecules/ProductCard";
import { useFavorites } from "../context/FavoritesContext";
import { ProductService, type ProductDetail } from "../lib/ProductService";

export default function FavoritesPage() {
  const { items, clear } = useFavorites();
  const [products, setProducts] = useState<ProductLike[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!items.length) {
        setProducts([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Charging details in parallel; if anyone fails, we skip it
        const results = await Promise.all(
          items.map(async (id) => {
            try {
              const p: ProductDetail = await ProductService.getById(String(id));
              return {
                id: p.id,
                name: p.title,
                price: p.price,
                imageUrl: p.image || `https://picsum.photos/seed/${p.id}/800/600`,
              } satisfies ProductLike;
            } catch {
              return null;
            }
          })
        );
        if (active) setProducts(results.filter(Boolean) as ProductLike[]);
      } catch (e: any) {
        if (active) setError(e?.message || "Error loading favorites");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [items]);

  const hasItems = products.length > 0;

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Favorites</h1>
        {hasItems && (
          <button onClick={clear} className="text-sm underline underline-offset-4">
            Clear all
          </button>
        )}
      </div>

      {loading ? (
        <div className="rounded-xl border p-10 text-center bg-white">
          <p className="text-lg font-medium">Loading your favorites…</p>
        </div>
      ) : !hasItems ? (
        <div className="rounded-xl border p-10 text-center bg-white">
          <p className="text-lg font-medium">Your favorites list is empty.</p>
          <p className="text-gray-600 mt-1">Browse products and tap the heart to add them here.</p>
          <a href="/" className="inline-block mt-6 px-4 py-2 rounded-lg border bg-white hover:bg-gray-50">
            Go to Home
          </a>
        </div>
      ) : error ? (
        <div className="rounded-xl border p-10 text-center bg-white text-red-600">
          <p className="font-medium">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
