// src/lib/CategoryService.ts
import { http } from "./http";

const API_ROOT = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
if (!API_ROOT) throw new Error("NEXT_PUBLIC_API_URL is required");
const BASE = `${API_ROOT}/api`;

/* ---------------- Existing types (kept intact) ---------------- */

export type CategoryCreator = {
  id: string;
  name: string;
  email: string;
};

export type CategoryProduct = {
  id: string;
  title: string;
  price: number;
  category: string;
  image: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  state: number; // backend numeric state
  createdBy: string;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string | null;
  approvedAt: string | null;
  creator: CategoryCreator | null;
  approver: CategoryCreator | null;
  products: CategoryProduct[];
};

export const CategoryService = {
  getCategories: async (): Promise<Category[]> => {
    const response = await http.get<Category[]>(`${BASE}/categories`);
    return Array.isArray(response.data) ? response.data : [];
  },

  /** Duplicate check using new search endpoint */
  async existsByName(name: string): Promise<boolean> {
    const term = encodeURIComponent(name.trim());
    try {
      const res = await http.get<Category[]>(`${BASE}/categories/search?term=${term}`);
      const list = Array.isArray(res.data) ? res.data : [];
      return list.some(c => c.name.trim().toLowerCase() === name.trim().toLowerCase());
    } catch {
      // Fallback: fetch all
      try {
        const all = await CategoryService.getCategories();
        return all.some(c => c.name.trim().toLowerCase() === name.trim().toLowerCase());
      } catch {
        return false;
      }
    }
  },

  /** Create category with minimal payload { name, slug } */
  async createCategory(name: string): Promise<Category> {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Name required");
    const dup = await CategoryService.existsByName(trimmed);
    if (dup) throw new Error("Category already exists.");
    const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const payload = { name: trimmed, slug }; // API expects only these two keys
    const res = await http.post<Category>(`${BASE}/categories`, payload);
    return res.data;
  },
};

export type CategoryDraft = { name: string; slug: string }; // kept for compatibility if needed
