import { memo } from "react";
import { useRouter } from "next/navigation";
import { useFavoriteStatus } from "../context/FavoritesContext";
/** Small, reusable product card molecule (Atomic Design) */
export type ProductLike = {
  id: string | number;
  name: string;
  price: number | string;
  imageUrl?: string; // Optional for placeholders
};

type ProductCardProps = {
  product: ProductLike;
  withFavorites?: boolean;
};

function ProductCardComponent({ product, withFavorites = true }: ProductCardProps) {
  const navigate = useRouter();
  const { isFavorite, toggle } = useFavoriteStatus(product.id);

  // Go to product detail when clicking the image/name area
  const goDetail = () => navigate.push(`/product/${product.id}`);

  return (
    <div className="group rounded-xl border bg-white p-3 shadow-sm hover:shadow-md transition">
      {/* Media */}
      <button
        onClick={goDetail}
        className="block w-full aspect-[4/3] rounded-lg bg-gray-200 overflow-hidden"
        aria-label={`Go to ${product.name} details`}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              const fallback = `https://picsum.photos/seed/${product.id}/800/600`;
              if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
            }}
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-gray-500">No image</div>
        )}
      </button>

      {/* Content */}
      <div className="mt-3 flex items-start justify-between gap-2">
        <button onClick={goDetail} className="text-sm text-left">
          <div className="font-medium">{product.name}</div>
          <div className="text-gray-600">{typeof product.price === "number" ? `$${product.price}` : product.price}</div>
        </button>

        {/* Favorite heart */}
        {withFavorites && (
          <button
            onClick={toggle}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            className="p-1 rounded-full border hover:bg-gray-50"
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {/* Using a simple heart SVG to avoid extra deps */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className={`h-5 w-5 ${isFavorite ? "fill-current text-rose-600" : "stroke-current text-gray-700"}`}
              fill="none"
              strokeWidth="1.5"
            >
              <path
                d="M16.5 3.75c-1.657 0-3.09.99-4.5 3-1.41-2.01-2.843-3-4.5-3A4.75 4.75 0 0 0 2.75 8.5c0 5.25 7.75 9.75 9.25 10.75 1.5-1 9.25-5.5 9.25-10.75a4.75 4.75 0 0 0-4.75-4.75Z"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

const ProductCard = memo(ProductCardComponent);
ProductCard.displayName = "ProductCard";

export default ProductCard;
