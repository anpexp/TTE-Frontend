import { vi } from "vitest";

type StorageRecord = Record<string, string>;

const createStorage = (snapshot: StorageRecord = {}) => {
  const store = new Map<string, string>(Object.entries(snapshot));

  const storage: Partial<Storage> = {
    getItem: vi.fn((key: string) => (store.has(key) ? store.get(key)! : null)),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
    key: vi.fn((index: number) => Array.from(store.keys())[index] ?? null),
  };

  Object.defineProperty(storage, "length", {
    get: () => store.size,
  });

  return { storage: storage as Storage, store };
};

export function mockBrowserStorage(options?: {
  local?: StorageRecord;
  session?: StorageRecord;
}) {
  const { storage: localStorageMock, store: localStore } = createStorage(options?.local);
  const { storage: sessionStorageMock, store: sessionStore } = createStorage(options?.session);

  vi.stubGlobal("localStorage", localStorageMock);
  vi.stubGlobal("sessionStorage", sessionStorageMock);

  return {
    local: { storage: localStorageMock, store: localStore },
    session: { storage: sessionStorageMock, store: sessionStore },
    restore: () => {
      vi.unstubAllGlobals();
    },
  };
}
