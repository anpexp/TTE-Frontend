import { http } from "./http";

const API_ROOT = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
if (!API_ROOT) throw new Error("NEXT_PUBLIC_API_URL is required");
const STORE = `${API_ROOT}/api/store`;
const PRODUCT = `${API_ROOT}/api/product`;

export type ProductRating = { rate: number; count: number };
export type ProductStatus = "approved" | "unapproved";

export type Product = {
  id: string;
  title: string;
  price: number;
  category: string;
  image: string;
  description: string;
  rating: ProductRating;
  inventory?: number;
  status?: ProductStatus;
};

export type ProductDetail = {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: ProductRating;
  inventoryTotal: number;
  inventoryAvailable: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  isInStock: boolean;
  status?: ProductStatus; // approval state
  createdAt?: string;
  createdBy?: string;
};

export type ProductDraft = {
  title: string;
  price: number;
  categoryId?: string;
  category?: string;
  description: string;
  image: string;
  inventory: number;
  status: ProductStatus;
  createdBy?: { id: string; role: "employee" | "admin" };
};

function mapDraftToApi(d: ProductDraft) {
  return {
    title: d.title,
    price: d.price,
    description: d.description,
    category: d.category ?? d.categoryId ?? "",
    imageUrl: d.image,
    inventoryTotal: d.inventory,
    inventoryAvailable: d.inventory,
  };
}

export type PagedProductsResponse = {
  items: Product[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasMore: boolean;
};

async function checkDuplicateServerSide(title: string, categoryIdOrName?: string): Promise<boolean> {
  const titleQ = encodeURIComponent(title.trim());
  try {
    const url = `${STORE}/products?title=${titleQ}&page=1&pageSize=12`;
    const res = await http.get<PagedProductsResponse>(url);
    if (Array.isArray(res.data?.items) && res.data.items.length > 0) {
      if (categoryIdOrName) {
        const catLower = categoryIdOrName.toLowerCase();
        return res.data.items.some((p) => p.category?.toString().toLowerCase() === catLower);
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function deepUnwrap(x: any): any {
  let v = x;
  let i = 0;
  while (v && typeof v === "object" && i < 6) {
    if ("data" in v) v = v.data;
    else if ("result" in v) v = v.result;
    else if ("value" in v) v = v.value;
    else if ("item" in v) v = v.item;
    else if ("product" in v) v = v.product;
    else break;
    i++;
  }
  if (Array.isArray(v)) v = v[0];
  return v ?? {};
}

function asBool(v: any) {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v.trim().toLowerCase() === "true";
  if (typeof v === "number") return v !== 0;
  return false;
}

function normalizeDetail(raw: any): ProductDetail {
  const p = deepUnwrap(raw);
  const rate = typeof p.rating === "number" ? p.rating : p.rating?.rate ?? 0;
  const count = typeof p.rating === "object" ? p.rating?.count ?? 0 : p.ratingCount ?? 0;
  const invTotal = Number(p.inventoryTotal ?? p.inventory ?? p.stock ?? 0);
  const invAvail = Number(p.inventoryAvailable ?? p.availableInventory ?? p.inventory ?? p.stock ?? 0);
  const explicitIn = typeof p.isInStock !== "undefined" ? asBool(p.isInStock) : typeof p.available !== "undefined" ? asBool(p.available) : null;
  const explicitOut = typeof p.isOutOfStock !== "undefined" ? asBool(p.isOutOfStock) : null;
  const inferred = invAvail > 0;
  const isInStock = explicitIn ?? (explicitOut !== null ? !explicitOut : inferred);
  const isOutOfStock = !isInStock;
  const isLowStock = isInStock && invAvail > 0 && invAvail <= 5;

  return {
    id: String(p.id ?? ""),
    title: String(p.title ?? p.name ?? ""),
    price: Number(p.price ?? 0),
    description: String(p.description ?? ""),
    category: String(p.category ?? p.categoryName ?? ""),
    image: String(p.image ?? p.imageUrl ?? ""),
    rating: { rate: Number(rate), count: Number(count) },
    inventoryTotal: invTotal,
    inventoryAvailable: invAvail,
    isLowStock,
    isOutOfStock,
    isInStock,
    status: (p.status ?? p.approvalStatus ?? p.productStatus) as ProductStatus | undefined,
    createdAt: typeof p.createdAt === "string" ? p.createdAt : undefined,
    createdBy: typeof p.createdBy === "string" ? p.createdBy : (typeof p.creatorId === "string" ? p.creatorId : undefined),
  };
}

function normalizeListItem(p: any): Product {
  return {
    id: String(p.id ?? ""),
    title: String(p.title ?? p.name ?? ""),
    price: Number(p.price ?? 0),
    category: String(p.category ?? p.categoryName ?? ""),
    image: String(p.image ?? p.imageUrl ?? ""),
    description: String(p.description ?? ""),
    rating:
      typeof p.rating === "object"
        ? { rate: Number(p.rating?.rate ?? 0), count: Number(p.rating?.count ?? 0) }
        : { rate: Number(p.rating ?? 0), count: Number(p.ratingCount ?? 0) },
    inventory: Number(p.inventory ?? p.inventoryAvailable ?? 0),
    status: p.status as ProductStatus | undefined,
  };
}

export type SearchParams = {
  q?: string;
  categoryId?: string;
  category?: string;
  min?: number;
  max?: number;
  sort?: "price_asc" | "price_desc" | "latest" | "bestsellers" | "";
  page?: number;
  pageSize?: number;
};

function mapSort(sort?: SearchParams["sort"]): { sortBy?: string; sortDir?: "Asc" | "Desc" } {
  if (sort === "price_asc") return { sortBy: "Price", sortDir: "Asc" };
  if (sort === "price_desc") return { sortBy: "Price", sortDir: "Desc" };
  if (sort === "latest") return { sortBy: "Title", sortDir: "Desc" };
  if (sort === "bestsellers") return { sortBy: "Rating", sortDir: "Desc" };
  return {};
}

export const ProductService = {
  getApprovedProducts: async (): Promise<ProductDetail[]> => {
    const res = await http.get<ProductDetail[]>(`${PRODUCT}/approved`);
    const arr = Array.isArray(res.data) ? res.data : [];
    return arr.map(normalizeDetail);
  },

  // Fetch all products (approved + unapproved) for employee/admin visibility of approval state
  getAllProductsDetailed: async (): Promise<ProductDetail[]> => {
    const res = await http.get<ProductDetail[]>(`${PRODUCT}`);
    const arr = Array.isArray(res.data) ? res.data : [];
    return arr.map(normalizeDetail);
  },

  getProducts: async (page = 1, pageSize = 12): Promise<PagedProductsResponse> => {
    const res = await http.get<PagedProductsResponse>(`${STORE}/products?page=${page}&pageSize=${pageSize}`);
    const items = Array.isArray(res.data?.items) ? res.data.items.map(normalizeListItem) : [];
    return { ...res.data, items };
  },

  getLatestProducts: async (): Promise<Product[]> => {
    const res = await http.get<PagedProductsResponse>(`${STORE}/products?page=1&pageSize=6&sortBy=Title&sortDir=Desc`);
    return (res.data.items ?? []).map(normalizeListItem);
  },

  getBestProducts: async (): Promise<Product[]> => {
    const res = await http.get<PagedProductsResponse>(`${STORE}/products?page=1&pageSize=3&sortBy=Rating&sortDir=Desc`);
    return (res.data.items ?? []).map(normalizeListItem);
  },

  getById: async (id: string): Promise<ProductDetail> => {
    const bust = `t=${Date.now()}`;
    const candidates = [
      `${PRODUCT}/${encodeURIComponent(id)}?${bust}`,
      `${PRODUCT}?id=${encodeURIComponent(id)}&${bust}`,
      `${PRODUCT}/details/${encodeURIComponent(id)}?${bust}`,
      `${PRODUCT}/get/${encodeURIComponent(id)}?${bust}`,
    ];
    let lastErr: any = null;
    for (const url of candidates) {
      try {
        const res = await http.get<any>(url);
        const r: any = res;
        const payload = r?.data ?? r?.result ?? r?.value ?? r?.item ?? r?.product ?? null;
        if (payload) return normalizeDetail(r);
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr ?? new Error("Product not found");
  },

  existsByTitleAndCategory: async (title: string, categoryIdOrName?: string): Promise<boolean> => {
    return checkDuplicateServerSide(title, categoryIdOrName);
  },

  create: async (draft: ProductDraft): Promise<Product> => {
    const duplicated = await ProductService.existsByTitleAndCategory(draft.title, draft.categoryId ?? draft.category);
    if (duplicated) throw new Error("Product already exists in this category.");
    const payload = mapDraftToApi(draft);
    const res = await http.post<Product>(`${PRODUCT}`, payload);
    return normalizeListItem(deepUnwrap(res.data));
  },

  search: async (p: SearchParams): Promise<PagedProductsResponse> => {
    const page = p.page ?? 1;
    const pageSize = p.pageSize ?? 24;
    const q = p.q?.trim() ? `&title=${encodeURIComponent(p.q.trim())}` : "";
    const cat = (p.categoryId || p.category)?.trim() ? `&category=${encodeURIComponent((p.categoryId || p.category) as string)}` : "";
    const min = typeof p.min === "number" ? `&minPrice=${p.min}` : "";
    const max = typeof p.max === "number" ? `&maxPrice=${p.max}` : "";
    const sort = mapSort(p.sort);
    const sortBy = sort.sortBy ? `&sortBy=${sort.sortBy}` : "";
    const sortDir = sort.sortDir ? `&sortDir=${sort.sortDir}` : "";
    const url = `${STORE}/products?page=${page}&pageSize=${pageSize}${q}${cat}${min}${max}${sortBy}${sortDir}`;
    const res = await http.get<PagedProductsResponse>(url);
    const items = Array.isArray(res.data?.items) ? res.data.items.map(normalizeListItem) : [];
    return { ...res.data, items };
  },

  update: async (id: string, draft: Partial<ProductDraft> & { status?: ProductStatus }): Promise<{ message: string }> => {
    if (!id) throw new Error("Product id required");
    const payload = {
      id,
      ...mapDraftToApi({
        title: draft.title || "",
        price: draft.price || 0,
        description: draft.description || "",
        category: draft.category || draft.categoryId || "",
        image: draft.image || "",
        inventory: (draft as any).inventory ?? 0,
        status: draft.status || "unapproved",
      } as ProductDraft),
      status: draft.status || "unapproved",
    };
    const res = await http.put<{ message: string }>(`${PRODUCT}`, payload);
    return res.data;
  },

  delete: async (id: string, approved: boolean): Promise<{ message: string }> => {
    if (!id) throw new Error("Product id required");
    const res = await http.delete<{ message: string }>(`${PRODUCT}`, { data: { id, approved } });
    return res.data;
  },
};

export const toGridProduct = (p: Product) => ({
  id: p.id,
  name: p.title,
  imageUrl: p.image,
  price: p.price,
});
