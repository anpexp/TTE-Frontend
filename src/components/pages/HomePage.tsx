// src/pages/HomePage.tsx
"use client";
import { useEffect, useState } from "react";
import LandingPage from "../templates/LandingPage";
import { CategoryService } from "../lib/CategoryService";
import { ProductService } from "../lib/ProductService";
import { Product } from "../molecules/ProductGrid";
import { Category } from "../molecules/CategoryGrid";

const isDev = process.env.MODE === "development";

const DEV_FALLBACK: Product[] = [
  { id: 101 as any, name: "Jae Namaz",  imageUrl: "https://picsum.photos/seed/101/800/600", price: 99 },
  { id: 102 as any, name: "Dates",      imageUrl: "https://picsum.photos/seed/102/800/600", price: 12 },
  { id: 103 as any, name: "Miswak",     imageUrl: "https://picsum.photos/seed/103/800/600", price: 7 },
  { id: 104 as any, name: "Prayer Rug", imageUrl: "https://picsum.photos/seed/104/800/600", price: 59 },
];

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [latest, setLatest] = useState<Product[]>([]);
  const [best, setBest] = useState<Product[]>([]);
  const [banner, setBanner] = useState<string>("https://picsum.photos/id/1069/1600/500");

  useEffect(() => {
    (async () => {
      try {
        // Get all approved products
        const approvedProducts = await ProductService.getApprovedProducts();
        
        // Convert to UI format for product grids
        const toUI = (arr: any[]): Product[] =>
          (arr ?? []).map((p: any) => ({
            id: p.id as any,
            name: p.title,
            imageUrl: p.image || `https://picsum.photos/seed/${p.id}/800/600`,
            price: p.price,
          }));

        const allProducts = toUI(approvedProducts);

        // Set latest products (first 6)
        const latestMapped = allProducts.slice(0, 6);
        setLatest(latestMapped.length ? latestMapped : (isDev ? DEV_FALLBACK : []));

        // Set best products (products with highest rating, limit to 3)
        const bestMapped = [...approvedProducts]
          .sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0))
          .slice(0, 4);
        const bestUI = toUI(bestMapped);
        setBest(bestUI.length ? bestUI : (isDev ? DEV_FALLBACK : []));

        // Set banner from first product
        setBanner(allProducts[0]?.imageUrl || "https://picsum.photos/id/1069/1600/500");

        // Derive categories from approved products
        if (approvedProducts.length) {
          const categoryMap = new Map<string, { name: string; image: string }>();
          
          approvedProducts.forEach((p: any) => {
            const categoryName = p.category;
            if (categoryName && !categoryMap.has(categoryName)) {
              // Use the first product's image for this category
              categoryMap.set(categoryName, {
                name: categoryName,
                image: p.image || `https://picsum.photos/seed/${categoryName}/400/300`
              });
            }
          });

          const derivedCategories: Category[] = Array.from(categoryMap.entries()).map(([id, data]) => ({
            id,
            name: data.name,
            imageUrl: data.image
          }));

          setCategories(derivedCategories);
        }
      } catch (error) {
        console.error("Error loading products:", error);
        setLatest(isDev ? DEV_FALLBACK : []);
        setBest(isDev ? DEV_FALLBACK : []);
        setBanner("https://picsum.photos/id/1069/1600/500");
        setCategories([]);
      }
    })();
  }, []);

  return (
    <LandingPage
      bannerSource={banner}
      categories={categories}
      latest={latest}
      bestSellers={best}
    />
  );
}
