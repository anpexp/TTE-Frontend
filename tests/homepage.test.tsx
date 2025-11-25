import React from "react";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { landingSpy, getApprovedSpy } = vi.hoisted(() => ({
  landingSpy: vi.fn(),
  getApprovedSpy: vi.fn(),
}));

vi.mock("@/components/templates/LandingPage", () => ({
  __esModule: true,
  default: (props: any) => {
    landingSpy(props);
    return <div data-testid="landing-page-mock" />;
  },
}));

vi.mock("@/components/lib/ProductService", () => ({
  ProductService: {
    getApprovedProducts: getApprovedSpy,
  },
}));

type HomePageComponent = (typeof import("@/components/pages/HomePage"))["default"];
let HomePage: HomePageComponent;

type MinimalProductDetail = {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
  inventoryTotal: number;
  inventoryAvailable: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  isInStock: boolean;
};

function makeProduct(overrides: Partial<MinimalProductDetail> = {}): MinimalProductDetail {
  return {
    id: overrides.id ?? `id-${Math.random().toString(36).slice(2, 8)}`,
    title: overrides.title ?? "Sample Product",
    price: overrides.price ?? 199,
    description: overrides.description ?? "Sample description",
    category: overrides.category ?? "Category",
    image: overrides.image ?? "https://picsum.photos/seed/default/800/600",
    rating: overrides.rating ?? { rate: 4.2, count: 20 },
    inventoryTotal: overrides.inventoryTotal ?? 25,
    inventoryAvailable: overrides.inventoryAvailable ?? 25,
    isLowStock: overrides.isLowStock ?? false,
    isOutOfStock: overrides.isOutOfStock ?? false,
    isInStock: overrides.isInStock ?? true,
  };
}

describe("HomePage", () => {
  beforeEach(async () => {
    landingSpy.mockClear();
    getApprovedSpy.mockReset();
    vi.resetModules();
    process.env.MODE = "development";
    HomePage = (await import("@/components/pages/HomePage")).default;
  });

  it("maps approved products into landing sections", async () => {
    const approved = [
      makeProduct({
        id: "p-1",
        title: "Laptop Prime",
        category: "Computers",
        price: 1499,
        rating: { rate: 4.7, count: 120 },
      }),
      makeProduct({
        id: "p-2",
        title: "Smart Speaker",
        category: "Audio",
        price: 199,
        rating: { rate: 4.9, count: 52 },
      }),
      makeProduct({
        id: "p-3",
        title: "Mechanical Keyboard",
        category: "Computers",
        price: 129,
        rating: { rate: 4.4, count: 35 },
      }),
      makeProduct({
        id: "p-4",
        title: "Drone Cam",
        category: "Gadgets",
        price: 799,
        rating: { rate: 4.1, count: 22 },
      }),
      makeProduct({
        id: "p-5",
        title: "VR Headset",
        category: "Gadgets",
        price: 499,
        rating: { rate: 4.95, count: 80 },
      }),
    ];

    getApprovedSpy.mockResolvedValue(approved);

    render(<HomePage />);

    await waitFor(() => {
      const props = landingSpy.mock.calls.at(-1)?.[0];
      expect(props).toBeDefined();
      expect(props.latest.map((p: any) => p.name)).toEqual(
        approved.slice(0, 6).map((item) => item.title)
      );
    });

    const props = landingSpy.mock.calls.at(-1)![0];

    expect(props.bannerSource).toBe("/api/hero-carousel");
    expect(props.categories.map((c: any) => c.name)).toEqual([
      "Computers",
      "Audio",
      "Gadgets",
    ]);
    expect(props.bestSellers.map((p: any) => p.name)).toEqual([
      "VR Headset",
      "Smart Speaker",
      "Laptop Prime",
      "Mechanical Keyboard",
    ]);
  });

  it("falls back to curated selections when the API returns no products", async () => {
    getApprovedSpy.mockResolvedValue([]);

    render(<HomePage />);

    await waitFor(() => {
      expect(landingSpy).toHaveBeenCalled();
      const props = landingSpy.mock.calls.at(-1)![0];
      expect(props.latest).toHaveLength(4);
    });

    const props = landingSpy.mock.calls.at(-1)![0];

    expect(props.latest.map((p: any) => p.name)).toEqual([
      "Jae Namaz",
      "Dates",
      "Miswak",
      "Prayer Rug",
    ]);
    expect(props.bestSellers.map((p: any) => p.name)).toEqual([
      "Jae Namaz",
      "Dates",
      "Miswak",
      "Prayer Rug",
    ]);
    expect(props.categories).toHaveLength(0);
  });

  it("keeps the fallback content if loading approved products fails", async () => {
    getApprovedSpy.mockRejectedValue(new Error("network boom"));

    render(<HomePage />);

    await waitFor(() => {
      const props = landingSpy.mock.calls.at(-1)?.[0];
      expect(getApprovedSpy).toHaveBeenCalled();
      expect(props).toBeDefined();
      expect(props.latest.map((p: any) => p.name)).toEqual([
        "Jae Namaz",
        "Dates",
        "Miswak",
        "Prayer Rug",
      ]);
    });

    const props = landingSpy.mock.calls.at(-1)![0];
    expect(props.bestSellers.map((p: any) => p.name)).toEqual([
      "Jae Namaz",
      "Dates",
      "Miswak",
      "Prayer Rug",
    ]);
    expect(props.categories).toHaveLength(0);
  });
});
