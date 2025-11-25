import { memo, useCallback, useMemo } from "react";
import Link from "next/link";
import { useFavorites } from "../context/FavoritesContext";

export type Product = {
  id: string | number;
  name: string;
  imageUrl?: string;
  price: number;
};

type ProductCardProps = {
  product: Product;
  isFav: boolean;
  withFavorites: boolean;
  onToggleFavorite: (id: Product["id"]) => void;
  formatPrice: (n: number) => string;
};

const ProductCard = memo(function ProductCard({
  product,
  isFav,
  withFavorites,
  onToggleFavorite,
  formatPrice,
}: ProductCardProps) {
  const fallback = `https://picsum.photos/seed/${product.id}/800/600`;
  const img = product.imageUrl || fallback;

  const handleFav = useCallback(
    () => onToggleFavorite(product.id),
    [onToggleFavorite, product.id]
  );

  return (
    <div className="relative rounded-xl border bg-white p-3 shadow-sm hover:shadow-md transition">
      <Link
        href={`/product/${product.id}`}
        aria-label={`Go to ${product.name} details`}
        className="block w-full aspect-[4/3] rounded-lg bg-gray-100 overflow-hidden"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={product.name}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          width={800}
          height={600}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          fetchPriority="low"
          onError={(e) => {
            if (e.currentTarget.src !== fallback) {
              e.currentTarget.src = fallback;
            }
          }}
        />
      </Link>

      {withFavorites && (
        <button
          type="button"
          onClick={handleFav}
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
          title={isFav ? "Remove from favorites" : "Add to favorites"}
          className="absolute top-2 right-2 p-1 rounded-full border bg-white/90 hover:bg-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={`h-5 w-5 ${
              isFav
                ? "fill-current text-rose-600"
                : "stroke-current text-gray-700"
            }`}
            fill="none"
            strokeWidth="1.5"
          >
            <path d="M16.5 3.75c-1.657 0-3.09.99-4.5 3-1.41-2.01-2.843-3-4.5-3A4.75 4.75 0 0 0 2.75 8.5c0 5.25 7.75 9.75 9.25 10.75 1.5-1 9.25-5.5 9.25-10.75a4.75 4.75 0 0 0-4.75-4.75Z" />
          </svg>
        </button>
      )}

      <div className="mt-3">
        <Link
          href={`/product/${product.id}`}
          className="text-left text-sm block"
        >
          <div className="font-medium truncate" title={product.name}>
            {product.name}
          </div>
          <div className="text-gray-600">{formatPrice(product.price)}</div>
        </Link>
      </div>
    </div>
  );
});

export default function ProductGrid({
  title,
  products,
  withFavorites = true,
}: {
  title?: string;
  products: Product[];
  withFavorites?: boolean;
}) {
  const { isFavorite, toggle } = useFavorites();

  const formatPrice = useMemo(() => {
    const f = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
    return (n: number) => f.format(n);
  }, []);

  const onToggleFavorite = useCallback(
    (id: Product["id"]) => {
      toggle(id);
    },
    [toggle]
  );

  return (
    <section className="mx-auto max-w-6xl">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}

      {products.length === 0 ? (
        <div className="rounded-2xl border p-10 text-center text-gray-700 bg-white">
          <p className="text-lg font-medium">No items to show yet</p>
          <p className="text-gray-600 mt-1">
            We’re curating the best tech for you.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              isFav={isFavorite(p.id)}
              withFavorites={withFavorites}
              onToggleFavorite={onToggleFavorite}
              formatPrice={formatPrice}
            />
          ))}
        </div>
      )}
    </section>
  );
}
