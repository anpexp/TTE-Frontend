import { memo } from "react";

export type Category = { id: string; name: string; imageUrl: string };

type CategoryGridProps = { categories: Category[] };

function CategoryGridComponent({ categories }: CategoryGridProps) {
  return (
    <section className="py-10 text-center">
      <h2 className="text-2xl font-bold mb-2">Categories</h2>
      <p className="text-neutral-600 mb-6 max-w-xl mx-auto">
        Discover our top product categories.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {categories.slice(0, 3).map((cat) => (
          <div key={cat.id} className="rounded-lg overflow-hidden shadow hover:shadow-lg transition">
            <img src={cat.imageUrl} alt={cat.name} className="h-56 w-full object-cover" />
            <div className="p-3 font-semibold">{cat.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

const CategoryGrid = memo(CategoryGridComponent);
CategoryGrid.displayName = "CategoryGrid";

export default CategoryGrid;
