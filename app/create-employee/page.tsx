"use client";
import { useEffect, useState } from "react";
import RequireRole from "@/components/auth/RequireRole";
import Button from "@/components/atoms/Button";
import { UserService } from "@/components/lib/UserService";
import { useRouter } from "next/navigation";

type FormState = {
  email: string;
  username: string;
  role: string; // "1" employee, "3" superadmin
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CreateEmployeePage() {
  const [form, setForm] = useState<FormState>({ email: "", username: "", role: "1" });
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await UserService.getUsers();
        if (active) setUsers(list);
      } catch {
        if (active) setUsers([]);
      } finally {
        if (active) setLoadingUsers(false);
      }
    })();
    return () => { active = false; };
  }, []);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function validate(): string | null {
    if (!form.email.trim()) return "Email is required.";
    if (!emailRegex.test(form.email.trim())) return "Email format is invalid.";
    if (!form.username.trim()) return "Username is required.";
    if (form.username.trim().length < 3) return "Username must be at least 3 characters.";
    if (!["1", "3"].includes(form.role)) return "Role must be employee (1) or superadmin (3).";
    // Duplicate checks
    const emailLower = form.email.trim().toLowerCase();
    if (users.some(u => String(u.email).toLowerCase() === emailLower)) return "Email already exists.";
    const usernameLower = form.username.trim().toLowerCase();
    if (users.some(u => String(u.username).toLowerCase() === usernameLower)) return "Username already exists.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const v = validate();
    if (v) { setError(v); return; }
    setSubmitting(true);
    try {
      const genericPassword = "ChangeMe123!"; // Provided generic password
      await UserService.createAdminUser({
        email: form.email.trim(),
        username: form.username.trim(),
        password: genericPassword,
        role: form.role,
      });
      setSuccess("User created. Provide temporary password: " + genericPassword);
      setForm({ email: "", username: "", role: "1" });
      // Refresh users for duplicates
      const list = await UserService.getUsers();
      setUsers(list);
    } catch (err: any) {
      setError(err?.message || "Failed to create user.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <RequireRole roles={["superadmin"]}>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Create Employee</h1>
            <Button variant="ghost" onClick={() => router.push("/employee-portal")}>Portal</Button>
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="employee@example.com"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => updateField("username", e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="jane.doe"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => updateField("role", e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="1">Employee</option>
                <option value="3">Superadmin</option>
              </select>
            </div>
            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
            {success && <div className="text-green-700 text-sm mb-2">{success}</div>}
            <Button type="submit" disabled={submitting || loadingUsers} className="w-full">
              {submitting ? "Creating..." : "Create"}
            </Button>
            <p className="text-xs text-gray-500 mt-3">Employee will be prompted to change password on first login.</p>
          </form>
        </div>
      </div>
    </RequireRole>
  );
}
