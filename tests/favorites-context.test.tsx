import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { FavoritesProvider, useFavorites } from "@/components/context/FavoritesContext";
import { mockBrowserStorage } from "./test-utils";

describe("FavoritesContext", () => {
  let restore: () => void;
  let setItemSpy: Mock;

  beforeEach(() => {
    const browser = mockBrowserStorage({
      local: {
        tte_favorites_v1: JSON.stringify(["seed-1", "seed-2"]),
      },
    });
    restore = browser.restore;
    setItemSpy = browser.local.storage.setItem as Mock;
  });

  afterEach(() => {
    restore();
  });

  it("hydrates favorites from localStorage on mount", async () => {
    function Harness() {
      const { items } = useFavorites();
      return <div data-testid="items">{items.join(",")}</div>;
    }

    render(
      <FavoritesProvider>
        <Harness />
      </FavoritesProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("items").textContent).toBe("seed-1,seed-2");
    });
  });

  it("adds and removes favorites while persisting the new state", async () => {
    function Harness() {
      const { items, toggle, clear } = useFavorites();
      return (
        <div>
          <div data-testid="items">{items.join(",")}</div>
          <button type="button" onClick={() => toggle("seed-1")}>
            toggle-seed-1
          </button>
          <button type="button" onClick={() => toggle("prod-1")}>
            toggle-prod-1
          </button>
          <button type="button" onClick={() => toggle("prod-2")}>
            toggle-prod-2
          </button>
          <button type="button" onClick={clear}>
            clear-all
          </button>
        </div>
      );
    }

    render(
      <FavoritesProvider>
        <Harness />
      </FavoritesProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("items").textContent).toBe("seed-1,seed-2");
    });

    await act(async () => {
      screen.getByText("toggle-prod-1").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("items").textContent).toBe(
        "seed-1,seed-2,prod-1"
      );
    });

    await act(async () => {
      screen.getByText("toggle-seed-1").click();
      screen.getByText("toggle-prod-2").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("items").textContent).toBe(
        "seed-2,prod-1,prod-2"
      );
    });

    expect(setItemSpy).toHaveBeenLastCalledWith(
      "tte_favorites_v1",
      JSON.stringify(["seed-2", "prod-1", "prod-2"])
    );

    await act(async () => {
      screen.getByText("clear-all").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("items").textContent).toBe("");
    });
  });
});
