import React, { type ReactElement } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  routerPush,
  routerBack,
  paramsSpy,
  authSpy,
  addItemSpy,
  getByIdSpy,
  favoriteStatusSpy,
  favoriteToggleSpy,
} = vi.hoisted(() => ({
  routerPush: vi.fn(),
  routerBack: vi.fn(),
  paramsSpy: vi.fn(() => ({ id: "prd-1" })),
  authSpy: vi.fn<[], { user: { id: string; role: string } | null }>(() => ({ user: null })),
  addItemSpy: vi.fn(() => Promise.resolve()),
  getByIdSpy: vi.fn(),
  favoriteToggleSpy: vi.fn(),
  favoriteStatusSpy: vi.fn(() => ({ isFavorite: false, toggle: vi.fn() })),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush, back: routerBack }),
  useParams: paramsSpy,
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

vi.mock("@/components/auth/AuthContext", () => ({
  useAuth: authSpy,
}));

vi.mock("@/components/context/CartContext", () => ({
  useCart: () => ({ addItem: addItemSpy }),
}));

vi.mock("@/components/context/FavoritesContext", () => ({
  useFavoriteStatus: favoriteStatusSpy,
}));

vi.mock("@/components/lib/ProductService", () => ({
  ProductService: {
    getById: getByIdSpy,
  },
}));

let ProductPage: () => ReactElement | null;

type ProductFixture = {
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
  isInStock: boolean;
  isOutOfStock: boolean;
};

const makeProduct = (overrides: Partial<ProductFixture> = {}): ProductFixture => ({
  id: "prd-1",
  title: "Galaxy Drone",
  price: 799,
  description: "4K aerial footage",
  category: "Gadgets",
  image: "https://example.com/drone.jpg",
  rating: { rate: 4.8, count: 112 },
  inventoryTotal: 10,
  inventoryAvailable: 10,
  isLowStock: false,
  isInStock: true,
  isOutOfStock: false,
  ...overrides,
});

describe("Product detail page", () => {
  beforeEach(async () => {
    vi.resetModules();
    routerPush.mockReset();
    routerBack.mockReset();
    paramsSpy.mockReturnValue({ id: "prd-1" });
    authSpy.mockReturnValue({ user: null });
    addItemSpy.mockResolvedValue(undefined);
    getByIdSpy.mockReset();
    favoriteToggleSpy.mockReset();
    favoriteStatusSpy.mockReturnValue({ isFavorite: false, toggle: favoriteToggleSpy });
    ProductPage = (await import("../app/product/[id]/page")).default;
  });

  it("redirects unauthenticated shoppers to login before adding to cart", async () => {
    getByIdSpy.mockResolvedValue(makeProduct());

    render(<ProductPage />);

    await waitFor(() => {
      expect(screen.getByText("Galaxy Drone")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));

    await waitFor(() => {
      expect(routerPush).toHaveBeenCalledWith("/login?from=/product/prd-1");
    });
    expect(addItemSpy).not.toHaveBeenCalled();
  });

  it("prevents checkout when the latest inventory says out of stock", async () => {
    const inStock = makeProduct({
      inventoryAvailable: 3,
      isInStock: true,
      isOutOfStock: false,
    });
    const outOfStock = makeProduct({
      inventoryAvailable: 0,
      isInStock: false,
      isOutOfStock: true,
    });

    getByIdSpy.mockResolvedValueOnce(inStock);
    getByIdSpy.mockResolvedValueOnce(outOfStock);

    authSpy.mockReturnValue({ user: { id: "u-1", role: "shopper" } });

    render(<ProductPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /add to cart/i })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));

    await waitFor(() => {
      expect(screen.getByText("This item is out of stock")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /unavailable/i })).toBeDisabled();
    });

    expect(addItemSpy).not.toHaveBeenCalled();
  });

  it("shows a helpful message when fetching the product fails", async () => {
    getByIdSpy.mockRejectedValue(new Error("boom"));

    render(<ProductPage />);

    await waitFor(() => {
      expect(screen.getByText("boom")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /go back/i }));
    expect(routerBack).toHaveBeenCalled();
  });
});
