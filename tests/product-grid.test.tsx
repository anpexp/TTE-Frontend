import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProductGrid from "@/components/molecules/ProductGrid";
import { FavoritesProvider } from "@/components/context/FavoritesContext";
import { mockBrowserStorage } from "./test-utils";

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: any) => (
    <a href={typeof href === "string" ? href : href?.pathname ?? "#"} {...rest}>
      {children}
    </a>
  ),
}));

describe("ProductGrid", () => {
  let restore: () => void;

  beforeEach(() => {
    restore = mockBrowserStorage().restore;
  });

  afterEach(() => {
    restore();
  });

  const products = [
    { id: "p-1", name: "Drone Cam", price: 799, imageUrl: "https://example.com/drone.jpg" },
    { id: "p-2", name: "VR Headset", price: 599 },
  ];

  const renderGrid = (props?: Partial<React.ComponentProps<typeof ProductGrid>>) =>
    render(
      <FavoritesProvider>
        <ProductGrid products={products} withFavorites {...props} />
      </FavoritesProvider>
    );

  it("shows a friendly empty state when there are no products", async () => {
    render(
      <FavoritesProvider>
        <ProductGrid products={[]} title="Our latest arrivals" />
      </FavoritesProvider>
    );

    expect(screen.getByText("No items to show yet")).toBeInTheDocument();
    expect(
      screen.getByText("We’re curating the best tech for you.")
    ).toBeInTheDocument();
  });

  it("renders each product card with formatted price and links", async () => {
    renderGrid({ title: "Our picks" });

    expect(screen.getByText("Our picks")).toBeInTheDocument();
    expect(screen.getByText("Drone Cam")).toBeInTheDocument();
    expect(screen.getByText("$799")).toBeInTheDocument();

    const vrLink = screen.getByRole("link", { name: /go to vr headset details/i });
    expect(vrLink).toHaveAttribute("href", "/product/p-2");
  });

  it("lets shoppers toggle favorites directly from the grid", async () => {
    renderGrid();

    const [firstToggle] = screen.getAllByRole("button", { name: /add to favorites/i });
    fireEvent.click(firstToggle);

    await waitFor(() => {
      expect(firstToggle).toHaveAttribute("aria-label", "Remove from favorites");
    });

    fireEvent.click(firstToggle);

    await waitFor(() => {
      expect(firstToggle).toHaveAttribute("aria-label", "Add to favorites");
    });
  });
});
