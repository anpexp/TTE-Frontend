import { memo, useCallback, useMemo } from "react";
import Link from "next/link";
import { useFavorites } from "../context/FavoritesContext";

export type Product = {
  id: string | number;
  name: string;
  imageUrl?: string;
  price: number;
};

export type ProductGridProps = {
  title?: string;
  products: Product[];
  withFavorites?: boolean;
};

type ProductCardProps = {
  product: Product;
  isFav: boolean;
  withFavorites: boolean;
  onToggleFavorite: (id: Product["id"]) => void;
  formatPrice: (value: number) => string;
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

  const handleFavorite = useCallback(() => onToggleFavorite(product.id), [onToggleFavorite, product.id]);

  return (
    <div className="relative rounded-xl border bg-white p-3 shadow-sm transition hover:shadow-md">
      <Link
        href={`/product/${product.id}`}
        aria-label={`Go to ${product.name} details`}
        className="block aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100"
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
          onError={(event) => {
            if (event.currentTarget.src !== fallback) {
              event.currentTarget.src = fallback;
            }
          }}
        />
      </Link>

      {withFavorites && (
        <button
          type="button"
          onClick={handleFavorite}
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
          title={isFav ? "Remove from favorites" : "Add to favorites"}
          className="absolute right-2 top-2 rounded-full border bg-white/90 p-1 hover:bg-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={`h-5 w-5 ${isFav ? "fill-current text-rose-600" : "stroke-current text-gray-700"}`}
            fill="none"
            strokeWidth="1.5"
          >
            <path d="M16.5 3.75c-1.657 0-3.09.99-4.5 3-1.41-2.01-2.843-3-4.5-3A4.75 4.75 0 0 0 2.75 8.5c0 5.25 7.75 9.75 9.25 10.75 1.5-1 9.25-5.5 9.25-10.75a4.75 4.75 0 0 0-4.75-4.75Z" />
          </svg>
        </button>
      )}

      <div className="mt-3">
        <Link href={`/product/${product.id}`} className="block text-left text-sm">
          <div className="truncate font-medium" title={product.name}>
            {product.name}
          </div>
          <div className="text-gray-600">{formatPrice(product.price)}</div>
        </Link>
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";

function ProductGridBase({
  title,
  products,
  withFavorites = true,
}: ProductGridProps) {
  const { isFavorite, toggle } = useFavorites();

  const formatPrice = useMemo(() => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
    return (value: number) => formatter.format(value);
  }, []);

  const handleToggleFavorite = useCallback(
    (id: Product["id"]) => {
      toggle(id);
    },
    [toggle]
  );

  return (
    <section className="mx-auto max-w-6xl">
      {title && <h2 className="mb-4 text-xl font-semibold">{title}</h2>}

      {products.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center text-gray-700">
          <p className="text-lg font-medium">No items to show yet</p>
          <p className="mt-1 text-gray-600">We’re curating the best tech for you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFav={isFavorite(product.id)}
              withFavorites={withFavorites}
              onToggleFavorite={handleToggleFavorite}
              formatPrice={formatPrice}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default memo(ProductGridBase);
