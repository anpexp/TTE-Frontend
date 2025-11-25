import { http } from "./http";

// Unified user service types
export type UserRecord = {
  id: string;
  email: string;
  username: string;
  role: number | string;
  createdAt?: string;
  name?: string; // legacy compatibility
};

export type UpdateUserRequest = Partial<Pick<UserRecord, "email" | "name" | "username">>;

function roleLabel(role: number | string): string {
  const r = typeof role === "string" ? role.toLowerCase() : role;
  if (r === 3 || r === "3" || r === "superadmin") return "Superadmin";
  if (r === 1 || r === "1" || r === "employee") return "Employee";
  return "Shopper";
}

// Single export object (merged functionality)
export const UserService = {
  // Get users from real API
  async getUsers(): Promise<UserRecord[]> {
    const res = await http.get<UserRecord[]>("/api/users");
    const arr = Array.isArray(res.data) ? res.data : [];
    return arr.map(u => ({
      ...u,
      id: String(u.id),
      email: String(u.email),
      username: String((u as any).username ?? (u as any).name ?? ""),
      role: (u as any).role,
      createdAt: (u as any).createdAt,
      name: (u as any).name,
    }));
  },

  // Create employee or superadmin
  async createAdminUser(payload: { email: string; username: string; password: string; role: string }): Promise<{ message?: string }> {
    const res = await http.post<{ message?: string }>("/api/admin/auth", payload);
    return res.data;
  },

  // Legacy update (kept if needed by other code)
  async updateUser(id: string | number, payload: UpdateUserRequest): Promise<UserRecord> {
    const response = await http.put<UserRecord>(`/api/users/${id}`, payload);
    return response.data;
  },

  roleLabel,
};