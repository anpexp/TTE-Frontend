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
    // Use the exact endpoint: GET /api/store/products?title={title}&page=1&pageSize=12
    const url = `${STORE}/products?title=${titleQ}&page=1&pageSize=12`;
    const res = await http.get<PagedProductsResponse>(url);
    if (Array.isArray(res.data?.items) && res.data.items.length > 0) {
      // If we have a category to check, verify it matches
      if (categoryIdOrName) {
        const catLower = categoryIdOrName.toLowerCase();
        return res.data.items.some((p) => 
          p.category?.toString().toLowerCase() === catLower
        );
      }
      // Otherwise, any match means duplicate
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function normalizeDetail(p: any): ProductDetail {
  const rate = typeof p.rating === "number" ? p.rating : p.rating?.rate ?? 0;
  const count = typeof p.rating === "object" ? p.rating?.count ?? 0 : p.ratingCount ?? 0;
  const invTotal = Number(p.inventoryTotal ?? p.inventory ?? 0);
  const invAvail = Number(p.inventoryAvailable ?? p.inventory ?? 0);
  const inStock = invAvail > 0;
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
    isLowStock: inStock && invAvail <= 5,
    isOutOfStock: !inStock,
    isInStock: inStock,
  };
}

export const ProductService = {
  getApprovedProducts: async (): Promise<ProductDetail[]> => {
    const res = await http.get<ProductDetail[]>(`${PRODUCT}/approved`);
    const arr = Array.isArray(res.data) ? res.data : [];
    return arr.map(normalizeDetail);
  },

  getProducts: async (page = 1, pageSize = 12): Promise<PagedProductsResponse> => {
    const res = await http.get<PagedProductsResponse>(`${STORE}/products?page=${page}&pageSize=${pageSize}`);
    return res.data;
  },

  getLatestProducts: async (): Promise<Product[]> => {
    const res = await http.get<PagedProductsResponse>(
      `${STORE}/products?page=1&pageSize=6&sortBy=Title&sortDir=Desc`
    );
    return res.data.items;
  },

  getBestProducts: async (): Promise<Product[]> => {
    const res = await http.get<PagedProductsResponse>(
      `${STORE}/products?page=1&pageSize=3&sortBy=Rating&sortDir=Desc`
    );
    return res.data.items;
  },

  getById: async (id: string): Promise<ProductDetail> => {
    const urls = [
      `${STORE}/products/${encodeURIComponent(id)}`,
      `${PRODUCT}/${encodeURIComponent(id)}`
    ];
    let lastErr: any;
    for (const url of urls) {
      try {
        const res = await http.get<any>(url);
        if (res?.data) return normalizeDetail(res.data);
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
    const duplicated = await ProductService.existsByTitleAndCategory(
      draft.title,
      draft.categoryId ?? draft.category
    );
    if (duplicated) throw new Error("Product already exists in this category.");
    const payload = mapDraftToApi(draft);
    // Use POST /api/product endpoint
    const res = await http.post<Product>(`${PRODUCT}`, payload);
    return res.data;
  },
};
