"use client";

import { memo, useMemo } from "react";
import dynamic from "next/dynamic";
import Footer from "../organisms/Footer";
import type { Category } from "../molecules/CategoryGrid";
import type { Product } from "../molecules/ProductGrid";

const Carousel = dynamic(() => import("../molecules/Carousel"), {
  ssr: false,
  loading: () => (
    <div className="h-40 w-full animate-pulse rounded-xl bg-neutral-200 sm:h-56 lg:h-72" />
  ),
});

const CategoryGrid = dynamic(() => import("../molecules/CategoryGrid"), {
  loading: () => (
    <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-lg border border-neutral-200 p-4"
          >
            <div className="h-28 w-full rounded-md bg-neutral-200" />
            <div className="mt-3 h-4 w-3/4 rounded bg-neutral-200" />
            <div className="mt-2 h-4 w-1/2 rounded bg-neutral-200" />
          </div>
        ))}
      </div>
    </div>
  ),
});

const ProductGrid = dynamic(() => import("../molecules/ProductGrid"), {
  loading: () => (
    <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-lg border border-neutral-200 p-4"
          >
            <div className="h-28 w-full rounded-md bg-neutral-200" />
            <div className="mt-3 h-4 w-3/4 rounded bg-neutral-200" />
            <div className="mt-2 h-4 w-1/2 rounded bg-neutral-200" />
          </div>
        ))}
      </div>
    </div>
  ),
});

function EmptyBlockBase({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      {hint && <p className="mt-1 text-sm text-neutral-500">{hint}</p>}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-lg border border-neutral-200 p-4"
          >
            <div className="h-28 w-full rounded-md bg-neutral-200" />
            <div className="mt-3 h-4 w-3/4 rounded bg-neutral-200" />
            <div className="mt-2 h-4 w-1/2 rounded bg-neutral-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

const EmptyBlock = memo(EmptyBlockBase);

export type LandingPageProps = {
  bannerSource: string;
  categories: Category[];
  latest: Product[];
  bestSellers: Product[];
};

function LandingPageBase({
  bannerSource,
  categories,
  latest,
  bestSellers,
}: LandingPageProps) {
  const hasCategories = useMemo(() => categories?.length > 0, [categories]);
  const hasLatest = useMemo(() => latest?.length > 0, [latest]);
  const hasBest = useMemo(() => bestSellers?.length > 0, [bestSellers]);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <section className="pt-4 lg:pt-6">
        <Carousel source={bannerSource} />
      </section>

      <section className="mt-10">
        {hasCategories ? (
          <CategoryGrid categories={categories} />
        ) : (
          <EmptyBlock
            title="No categories to show yet"
            hint="We’re curating the best tech for you."
          />
        )}
      </section>

      <section className="mt-12">
        {hasLatest ? (
          <ProductGrid
            title="Our latest arrivals"
            products={latest}
            withFavorites
          />
        ) : (
          <EmptyBlock
            title="No new arrivals yet"
            hint="Check back soon for fresh drops."
          />
        )}
      </section>

      <section className="my-12">
        {hasBest ? (
          <ProductGrid
            title="Our products"
            products={bestSellers}
            withFavorites
          />
        ) : (
          <EmptyBlock
            title="No products available"
            hint="We’ll restock shortly."
          />
        )}
      </section>

      <Footer />
    </main>
  );
}

export default memo(LandingPageBase);
