"use client";
// src/pages/CreateProductPage.tsx
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategoryService } from "@/components/lib/CategoryService";
import { useAuth } from "@/components/auth/AuthContext";
import { ProductDraft, ProductService } from "@/components/lib/ProductService";
import { Button, Input } from "@/components/atoms";
import RequireRole from "@/components/auth/RequireRole";

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().min(5, "Description is required"),
  image: z.string().url("Image must be a valid URL"),
  inventory: z.coerce.number().int().nonnegative("Inventory must be 0 or more"),
});

type FormInput = z.input<typeof schema>;
type FormData = z.output<typeof schema>;

export default function CreateProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitOk, setSubmitOk] = useState<string | null>(null);

  const { user } = useAuth();
  const rawRole = (user?.role ?? "").toString().toLowerCase();
  const isEmployee = rawRole.includes("employee");
  const isAdmin = rawRole.includes("superadmin") || rawRole.includes("admin");
  const role: "employee" | "admin" | "" = isAdmin ? "admin" : isEmployee ? "employee" : "";
  const userId = user?.id || "u1";

  // Access protection handled by RequireRole wrapper

  useEffect(() => {
    (async () => {
      try {
        const list = await CategoryService.getCategories();
        const arr = Array.isArray(list) ? list : [];
        setCategories(arr.map((c: any) => ({ id: String(c.id), name: c.name })));
      } catch {
        setCategories([]);
      }
    })();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, any, FormData>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const categoryOptions = useMemo(
    () => (Array.isArray(categories) ? categories : []).map((c) => ({ value: c.id, label: c.name })),
    [categories]
  );

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setSubmitError(null);
    setSubmitOk(null);

    const categoryExists = categories.some((c) => c.id === data.categoryId);
    if (!categoryExists) {
      setSubmitError("Selected category does not exist.");
      return;
    }

    const duplicated = await ProductService.existsByTitleAndCategory(data.title, data.categoryId);
    if (duplicated) {
      setSubmitError("A product with this title already exists in the selected category.");
      return;
    }

    const status: "approved" | "unapproved" = role === "admin" ? "approved" : "unapproved";

    const draft: ProductDraft = {
      title: data.title.trim(),
      price: data.price,
      categoryId: data.categoryId,
      description: data.description.trim(),
      image: data.image.trim(),
      inventory: data.inventory,
      status,
      createdBy: { id: userId, role: role as "employee" | "admin" },
    };

    try {
      await ProductService.create(draft);
      setSubmitOk(role === "admin" ? "Product created and approved." : "Product created and sent for approval.");
      reset();
    } catch (err: any) {
      setSubmitError(err?.message || "Could not create the product.");
    }
  };

  return (
    <RequireRole roles={["employee", "admin", "superadmin"]}>
      <div className="bg-gray-100 min-h-screen p-6 md:p-10">
        <button className="mb-4 text-sm" onClick={() => router.back()}>&lt; Back</button>

        <h1 className="text-3xl md:text-5xl font-bold text-center mb-10">Employee Portal</h1>

        <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Create Product</h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Input label="Title" {...register("title")} error={errors.title?.message} />

            <Input label="Price" type="number" step="0.01" {...register("price", { valueAsNumber: true })} error={errors.price?.message} />

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Category</label>
              <select className="w-full border rounded px-3 py-2" {...register("categoryId")} defaultValue="">
                <option value="" disabled>Select a category</option>
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.categoryId?.message && <p className="text-red-600 text-sm mt-1">{errors.categoryId.message}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea rows={3} className="w-full border rounded px-3 py-2" {...register("description")} />
              {errors.description?.message && <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>}
            </div>

            <Input label="Image" {...register("image")} error={errors.image?.message} />

            <Input label="Inventory" type="number" {...register("inventory", { valueAsNumber: true })} error={errors.inventory?.message} />

            {submitError && <div className="text-red-600 mt-2">{submitError}</div>}
            {submitOk && <div className="text-green-700 mt-2">{submitOk}</div>}

            <Button type="submit" disabled={isSubmitting} className="mt-4 w-full">
              {isSubmitting ? "Saving..." : "Add"}
            </Button>
          </form>
        </div>
      </div>
    </RequireRole>
  );
}
