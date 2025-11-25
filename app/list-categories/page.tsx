
"use client";

import { useEffect, useState } from "react";
import RequireRole from "@/components/auth/RequireRole";
import { CategoryService } from "@/components/lib/CategoryService";
import { http } from "@/components/lib/http";
import { useAuth } from "@/components/auth/AuthContext";
import { useRouter } from "next/navigation";
import Button from "@/components/atoms/Button";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  state: string;
  createdBy: string;
  approvedBy: string;
  createdAt: string;
  updatedAt: string;
  approvedAt: string;
  creatorName: string;
  approverName: string;
  productCount: number;
};

const ListCategoriesPage = () => {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editError, setEditError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const isAdmin = user?.role?.toLowerCase() === "superadmin";
  const isEmployee = user?.role?.toLowerCase() === "employee";

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line
  }, []);

  async function loadCategories() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await http.get<any[]>("/api/categories/all");
      const rows = Array.isArray(res.data)
        ? res.data.map((c) => ({
            id: String(c.id),
            name: String(c.name),
            slug: String(c.slug),
            state: String(c.state),
            createdBy: String(c.createdBy),
            approvedBy: String(c.approvedBy || ""),
            createdAt: String(c.createdAt),
            updatedAt: String(c.updatedAt || ""),
            approvedAt: String(c.approvedAt || ""),
            creatorName: String(c.creatorName || ""),
            approverName: String(c.approverName || ""),
            productCount: Number(c.productCount ?? 0),
          }))
        : [];
      setCategories(rows);
    } catch (err: any) {
      setError(err?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(id: string, name: string) {
    setEditId(id);
    setEditName(name);
    setEditError(null);
  }

  function cancelEdit() {
    setEditId(null);
    setEditName("");
    setEditError(null);
  }

  async function handleUpdate() {
    if (!editName.trim()) {
      setEditError("Name is required.");
      return;
    }
    try {
      setEditError(null);
      setSuccess(null);
      // PUT /api/categories
      await CategoryService.updateCategory({
        id: editId!,
        name: editName.trim(),
        slug: editName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
        approved: isAdmin,
      });
      setSuccess(isAdmin ? "Category updated and approved." : "Category updated, pending approval.");
      setEditId(null);
      setEditName("");
      loadCategories();
    } catch (err: any) {
      setEditError(err?.message || "Failed to update category.");
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setSuccess(null);
    try {
      // DELETE /api/categories
      await CategoryService.deleteCategory({ id, approved: isAdmin });
      setSuccess(isAdmin ? "Category deleted and approved." : "Category deleted, pending approval.");
      loadCategories();
    } catch (err: any) {
      setError(err?.message || "Failed to delete category.");
    }
  }

  return (
    <RequireRole roles={["employee", "superadmin"]}>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
            <Button onClick={() => router.push("/employee-portal")}>Back to Portal</Button>
          </div>
          {loading ? (
            <div className="text-center py-12">Loading categories...</div>
          ) : error ? (
            <div className="bg-white p-6 rounded shadow text-red-600 mb-4">{error}</div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50">
                  <tr className="[&>th]:px-3 [&>th]:py-2">
                    <th className="text-left font-medium text-gray-600 uppercase">ID</th>
                    <th className="text-left font-medium text-gray-600 uppercase">Name</th>
                    <th className="text-left font-medium text-gray-600 uppercase">Slug</th>
                    <th className="text-left font-medium text-gray-600 uppercase">State</th>
                    <th className="text-left font-medium text-gray-600 uppercase">Creator Name</th>
                    <th className="text-left font-medium text-gray-600 uppercase">Created By</th>
                    <th className="text-left font-medium text-gray-600 uppercase">Created At</th>
                    <th className="text-left font-medium text-gray-600 uppercase">Approved By</th>
                    <th className="text-left font-medium text-gray-600 uppercase">Approved At</th>
                    <th className="text-left font-medium text-gray-600 uppercase">Approver Name</th>
                    <th className="text-left font-medium text-gray-600 uppercase">Updated At</th>
                    <th className="text-left font-medium text-gray-600 uppercase">Product Count</th>
                    <th className="text-right font-medium text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50 transition-colors [&>td]:px-3 [&>td]:py-2">
                      <td className="font-mono">{cat.id.substring(0, 8)}...</td>
                      <td>
                        {editId === cat.id ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="border px-2 py-1 rounded w-40"
                          />
                        ) : (
                          <span>{cat.name}</span>
                        )}
                      </td>
                      <td>{cat.slug}</td>
                      <td>{cat.state}</td>
                      <td>{cat.creatorName}</td>
                      <td className="font-mono">{cat.createdBy.substring(0, 8)}...</td>
                      <td>{new Date(cat.createdAt).toLocaleString()}</td>
                      <td className="font-mono">{cat.approvedBy ? cat.approvedBy.substring(0,8)+"..." : ""}</td>
                      <td>{cat.approvedAt ? new Date(cat.approvedAt).toLocaleString() : ""}</td>
                      <td>{cat.approverName}</td>
                      <td>{cat.updatedAt ? new Date(cat.updatedAt).toLocaleString() : ""}</td>
                      <td>{cat.productCount}</td>
                      <td className="text-right">
                        {editId === cat.id ? (
                          <>
                            <Button onClick={handleUpdate} className="mr-2">Save</Button>
                            <Button onClick={cancelEdit} variant="ghost">Cancel</Button>
                            {editError && <div className="text-red-600 text-xs mt-1">{editError}</div>}
                          </>
                        ) : (
                          <>
                            <Button onClick={() => startEdit(cat.id, cat.name)} className="mr-2">Update</Button>
                            <Button onClick={() => handleDelete(cat.id)} variant="ghost">Delete</Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {success && <div className="text-green-700 p-2">{success}</div>}
            </div>
          )}
        </div>
      </div>
    </RequireRole>
  );
};

export default ListCategoriesPage;
