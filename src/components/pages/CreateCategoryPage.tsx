"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Input, Button } from "@/components/atoms";
import { CategoryService } from "@/components/lib/CategoryService";
import { useAuth } from "@/components/auth/AuthContext";

const schema = z.object({ name: z.string().min(2, "Name is required") });
type FormData = z.infer<typeof schema>;

export default function CreateCategoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitOk, setSubmitOk] = useState<string | null>(null);
  const rawRole = (user?.role ?? "").toLowerCase();
  const isEmployee = rawRole.includes("employee");
  const isAdmin = rawRole.includes("superadmin") || rawRole.includes("admin");
  const role: "employee" | "admin" | "" = isAdmin ? "admin" : isEmployee ? "employee" : "";
  // userId retained only if later metadata is reintroduced; unused now

  useEffect(() => {
    if (!user) return;
    if (role !== "employee" && role !== "admin") router.replace("/");
  }, [router, role, user]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    setSubmitOk(null);
    try {
      await CategoryService.createCategory(data.name);
      setSubmitOk("Category created.");
      reset();
    } catch (err: any) {
      setSubmitError(err?.message || "Could not create the category.");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6 md:p-10">
      <button className="mb-4 text-sm" onClick={() => router.back()}>&lt; Back</button>
      <h1 className="text-3xl md:text-5xl font-bold text-center mb-10">Employee Portal</h1>
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Create Category</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input label="Name" {...register("name")} error={errors.name?.message} />
          {submitError && <div className="text-red-600 mt-2">{submitError}</div>}
          {submitOk && <div className="text-green-700 mt-2">{submitOk}</div>}
          <Button type="submit" disabled={isSubmitting} className="mt-4 w-full">
            {isSubmitting ? "Saving..." : "Add"}
          </Button>
        </form>
      </div>
    </div>
  );
}
