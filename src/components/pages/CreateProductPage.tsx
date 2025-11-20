"use client";
// Next.js adaptation (original Vite + react-router version)
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Button } from "@/components/atoms";
import { CategoryService } from "@/components/lib/CategoryService";
import { ProductService, type ProductDraft } from "@/components/lib/ProductService";

/** Form validation schema */
const productFormSchema = z.object({
  title: z.string().min(2, "Title is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().min(5, "Description is required"),
  image: z.string().url("Image must be a valid URL"),
  inventory: z.coerce.number().int().nonnegative("Inventory must be 0 or more"),
});

type ProductFormData = z.infer<typeof productFormSchema>;

export default function CreateProductPage() {
  const router = useRouter();

  // Local state
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug?: string }>>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitOk, setSubmitOk] = useState<string | null>(null);

  // Use central auth context instead of ad-hoc localStorage values
  const { user } = useAuth();
  const rawRole = (user?.role ?? "").toLowerCase();
  const isEmployee = rawRole.includes("employee");
  const isAdmin = rawRole.includes("superadmin") || rawRole.includes("admin");
  const role: "employee" | "admin" | "" = isAdmin ? "admin" : (isEmployee ? "employee" : "");
  const userId = user?.id || "u1";

  /** Guard: only employee/admin can access this page. Defer until user known. */
  useEffect(() => {
    if (!user) return; // wait for AuthContext
    if (role !== "employee" && role !== "admin") {
      router.replace("/");
    }
  }, [router, role, user]);

  /** Load categories (must exist for a valid product) */
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await CategoryService.getCategories();
        if (!active) return;
        const arr = Array.isArray(list) ? list : [];
        setCategories(arr.map((c: any) => ({ id: String(c.id), name: c.name, slug: c.slug })));
      } catch (err) {
        if (active) setCategories([]);
      }
    })();
    return () => { active = false; };
  }, []);

  // RHF setup
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema) as any,
  });

  // Options for the <select/>
  const categoryOptions = useMemo(
    () => (Array.isArray(categories) ? categories : []).map((c) => ({ value: c.id, label: c.name })),
    [categories]
  );

  /** Submit handler */
  const onSubmit: (data: ProductFormData) => Promise<void> = async (data) => {
    setSubmitError(null);
    setSubmitOk(null);

    // 1) Ensure category really exists and get category name
    const selectedCategory = categories.find((c) => c.id === data.categoryId);
    if (!selectedCategory) {
      setSubmitError("Selected category does not exist.");
      return;
    }

    // 2) Duplicate guard (title + category)
    const duplicated = await ProductService.existsByTitleAndCategory(
      data.title,
      selectedCategory.name
    );
    if (duplicated) {
      setSubmitError("A product with this title already exists in the selected category.");
      return;
    }

    // 3) Status by role: admin -> approved, employee -> unapproved
    const status: "approved" | "unapproved" = role === "admin" ? "approved" : "unapproved";

    // 4) Build draft to match your ProductService contract
    const draft: ProductDraft = {
      title: data.title.trim(),
      price: data.price,
      category: selectedCategory.name, // Use category name for API
      description: data.description.trim(),
      image: data.image.trim(),
      inventory: data.inventory,
      status,
      createdBy: { id: userId, role: role as "employee" | "admin" },
    };

    try {
      await ProductService.create(draft);
      setSubmitOk(
        role === "admin"
          ? "Product created and approved."
          : "Product created and sent for approval."
      );
      reset(); // clear form after success
      // Optionally navigate back to the portal
      // setTimeout(() => router.push("/employee-portal"), 800);
    } catch (err: any) {
      setSubmitError(err?.message || "Could not create the product.");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6 md:p-10">
      <button className="mb-4 text-sm" onClick={() => router.back()}>
        &lt; Back
      </button>

      <h1 className="text-3xl md:text-5xl font-bold text-center mb-10">Employee Portal</h1>

      <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Create Product</h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Title */}
          <Input
            label="Title"
            {...register("title")}
            error={errors.title?.message}
          />

          {/* Price */}
          <Input
            label="Price"
            type="number"
            step="0.01"
            {...register("price")}
            error={errors.price?.message}
          />

          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              className="w-full border rounded px-3 py-2"
              {...register("categoryId")}
              defaultValue=""
            >
              <option value="" disabled>
                Select a category
              </option>
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.categoryId?.message && (
              <p className="text-red-600 text-sm mt-1">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Description (native textarea to avoid typing issues with Input atom) */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              rows={3}
              className="w-full border rounded px-3 py-2"
              {...register("description")}
            />
            {errors.description?.message && (
              <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Image URL (your API expects `image`) */}
          <Input
            label="Image"
            {...register("image")}
            error={errors.image?.message}
          />

          {/* Inventory */}
          <Input
            label="Inventory"
            type="number"
            {...register("inventory")}
            error={errors.inventory?.message}
          />

          {/* Feedback messages */}
          {submitError && <div className="text-red-600 mt-2">{submitError}</div>}
          {submitOk && <div className="text-green-700 mt-2">{submitOk}</div>}

          {/* Submit */}
          <Button type="submit" disabled={isSubmitting} className="mt-4 w-full">
            {isSubmitting ? "Saving..." : "Add"}
          </Button>
        </form>
      </div>
    </div>
  );
}
