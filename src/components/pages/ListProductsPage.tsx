"use client";

import { useEffect, useState } from "react";
import { ProductService, ProductDetail } from "../lib/ProductService";
import { useAuth } from "../auth/AuthContext";
import { useRouter } from "next/navigation";

export default function ListProductsPage() {
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "price" | "inventory">("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { user } = useAuth();
  const rawRole = (user?.role ?? "").toLowerCase();
  const isAdmin = rawRole.includes("admin") || rawRole.includes("superadmin");
  const isEmployee = rawRole.includes("employee") && !isAdmin;
  const role: "admin" | "employee" | "" = isAdmin ? "admin" : (isEmployee ? "employee" : "");
  
  // Editing state
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPrice, setEditPrice] = useState<string>("");
  const [editInventory, setEditInventory] = useState<string>("");
  const [editError, setEditError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use /api/product to include approval state
      const data = await ProductService.getAllProductsDetailed();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products
    .filter((product) => {
      const term = searchTerm.toLowerCase();
      return (
        product.title.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.id.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "price":
          aValue = a.price;
          bValue = b.price;
          break;
        case "inventory":
          aValue = a.inventoryAvailable;
          bValue = b.inventoryAvailable;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const getStockBadgeClass = (product: ProductDetail) => {
    if (product.isOutOfStock) return "bg-red-100 text-red-800";
    if (product.isLowStock) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getStockStatus = (product: ProductDetail) => {
    if (product.isOutOfStock) return "Out of Stock";
    if (product.isLowStock) return "Low Stock";
    return "In Stock";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-center mb-2">Error Loading Products</h2>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={loadProducts}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600 mt-1">
                Viewing {filteredProducts.length} of {products.length} products
              </p>
            </div>
            <button
              onClick={() => router.push("/employee-portal")}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Portal
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Products
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search by title, category, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Sort By */}
            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <div className="flex gap-2">
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="title">Title</option>
                  <option value="price">Price</option>
                  <option value="inventory">Inventory</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
                >
                  {sortOrder === "asc" ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Try adjusting your search criteria"
                : "No approved products available"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-12 w-12 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                            <img
                              src={product.image}
                              alt={product.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            {editId === product.id ? (
                              <input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="border rounded px-2 py-1 text-sm w-40"
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                {product.title}
                              </div>
                            )}
                            <div className="text-xs text-gray-500 font-mono">
                              {product.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editId === product.id ? (
                          <input
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="border rounded px-2 py-1 text-sm w-32"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{product.category}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{product.inventoryAvailable} available</div>
                          <div className="text-xs text-gray-500">
                            of {product.inventoryTotal} total
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockBadgeClass(
                            product
                          )}`}
                        >
                          {getStockStatus(product)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs">{product.createdAt ? new Date(product.createdAt).toLocaleString() : ""}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono">{product.createdBy ? product.createdBy.substring(0,8)+"..." : ""}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editId === product.id ? (
                          <>
                            <button
                              onClick={() => {
                                setEditError(null);
                                setActionMsg(null);
                                // Basic validation
                                if (editTitle.trim().length < 2) {
                                  setEditError("Title must be at least 2 characters.");
                                  return;
                                }
                                if (editCategory.trim().length === 0) {
                                  setEditError("Category is required.");
                                  return;
                                }
                                const priceNum = Number(editPrice);
                                if (isNaN(priceNum) || priceNum <= 0) {
                                  setEditError("Price must be > 0.");
                                  return;
                                }
                                const invNum = Number(editInventory);
                                if (isNaN(invNum) || invNum < 0 || !Number.isInteger(invNum)) {
                                  setEditError("Inventory must be an integer >= 0.");
                                  return;
                                }
                                const status = role === "admin" ? "approved" : "unapproved";
                                ProductService.update(product.id, {
                                  title: editTitle.trim(),
                                  category: editCategory.trim(),
                                  price: priceNum,
                                  inventory: invNum,
                                  status,
                                })
                                  .then(() => {
                                    setActionMsg(status === "approved" ? "Product updated and approved." : "Product updated, pending approval.");
                                    setEditId(null);
                                    loadProducts();
                                  })
                                  .catch((e) => setEditError(e?.message || "Update failed"));
                              }}
                              className="text-green-600 hover:text-green-800 mr-3"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditId(null);
                                setEditError(null);
                              }}
                              className="text-gray-600 hover:text-gray-800 mr-3"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => router.push(`/product/${product.id}`)}
                              className="text-orange-600 hover:text-orange-900 mr-3"
                            >
                              View
                            </button>
                            {(role === "admin" || role === "employee") && (
                              <button
                                onClick={() => {
                                  setEditId(product.id);
                                  setEditTitle(product.title);
                                  setEditCategory(product.category);
                                  setEditPrice(String(product.price));
                                  setEditInventory(String(product.inventoryTotal));
                                  setEditError(null);
                                  setActionMsg(null);
                                }}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                Update
                              </button>
                            )}
                            {(role === "admin" || role === "employee") && (
                              <button
                                onClick={() => {
                                  setEditError(null);
                                  setActionMsg(null);
                                  const approved = role === "admin";
                                  ProductService.delete(product.id, approved)
                                    .then(() => {
                                      setActionMsg(approved ? "Product deleted with approved state." : "Product deleted pending approval.");
                                      loadProducts();
                                    })
                                    .catch((e) => setEditError(e?.message || "Delete failed"));
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            )}
                          </>
                        )}
                        {editId === product.id && editError && (
                          <div className="text-red-600 text-xs mt-1">{editError}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {actionMsg && <div className="p-3 text-sm text-green-700">{actionMsg}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
