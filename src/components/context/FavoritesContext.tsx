"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";

export type FavoriteID = string | number;

type Ctx = {
  items: FavoriteID[];
  isFavorite: (id: FavoriteID) => boolean;
  toggle: (id: FavoriteID) => void;
  clear: () => void;
};

type FavoritesStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => FavoriteID[];
  has: (id: FavoriteID) => boolean;
  getCount: () => number;
  toggle: (id: FavoriteID) => void;
  clear: () => void;
};

type InternalFavoritesStore = FavoritesStore & {
  setItems: (
    value:
      | FavoriteID[]
      | ((prev: FavoriteID[]) => FavoriteID[])
  ) => void;
  hydrate: (value: FavoriteID[]) => void;
};

const FavoritesContext = createContext<FavoritesStore | null>(null);

const LS_KEY = "tte_favorites_v1";

const readPersisted = (): FavoriteID[] => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as FavoriteID[]) : [];
  } catch {
    return [];
  }
};

const writePersisted = (items: FavoriteID[]) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {}
};

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<InternalFavoritesStore>();

  if (!storeRef.current) {
    const listeners = new Set<() => void>();
    let items: FavoriteID[] = [];

    const setItems: InternalFavoritesStore["setItems"] = (value) => {
      items = typeof value === "function" ? (value as (prev: FavoriteID[]) => FavoriteID[])(items) : value;
      writePersisted(items);
      listeners.forEach((listener) => listener());
    };

    const subscribe = (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    };

    const toggle = (id: FavoriteID) => {
      setItems((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    };

    const has = (id: FavoriteID) => items.includes(id);
    const getCount = () => items.length;

    const clear = () => setItems([]);

    storeRef.current = {
      subscribe,
      getSnapshot: () => items,
      has,
      getCount,
      toggle,
      clear,
      setItems,
      hydrate: (value: FavoriteID[]) => {
        items = value;
        listeners.forEach((listener) => listener());
      },
    };
  }

  const store = storeRef.current!;

  useEffect(() => {
    const initial = readPersisted();
    store.hydrate(initial);
  }, [store]);

  return (
    <FavoritesContext.Provider value={store}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const store = useContext(FavoritesContext);
  if (!store) throw new Error("useFavorites must be used inside <FavoritesProvider>");

  const items = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  return useMemo<Ctx>(
    () => ({
      items,
      isFavorite: store.has,
      toggle: store.toggle,
      clear: store.clear,
    }),
    [items, store]
  );
}

export function useFavoriteStatus(id: FavoriteID) {
  const store = useContext(FavoritesContext);
  if (!store) throw new Error("useFavoriteStatus must be used inside <FavoritesProvider>");

  const isFavorite = useSyncExternalStore(
    store.subscribe,
    () => store.has(id),
    () => store.has(id)
  );

  const toggle = useMemo(() => () => store.toggle(id), [store, id]);

  return useMemo(
    () => ({ isFavorite, toggle }),
    [isFavorite, toggle]
  );
}

export function useFavoritesCount() {
  const store = useContext(FavoritesContext);
  if (!store) throw new Error("useFavoritesCount must be used inside <FavoritesProvider>");

  const count = useSyncExternalStore(
    store.subscribe,
    store.getCount,
    store.getCount
  );

  return count;
}
