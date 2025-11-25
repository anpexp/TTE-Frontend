"use client";
import { useEffect, useState } from "react";
import RequireRole from "@/components/auth/RequireRole";
import Button from "@/components/atoms/Button";
import { UserService, UserRecord } from "@/components/lib/UserService";
import { useRouter } from "next/navigation";

export default function ListUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const list = await UserService.getUsers();
        if (active) setUsers(list);
      } catch (e: any) {
        if (active) setError(e?.message || "Failed to load users");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <RequireRole roles={["superadmin"]}>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <Button variant="ghost" onClick={() => router.push("/employee-portal")}>Portal</Button>
          </div>
          {loading ? (
            <div className="text-center py-12">Loading users...</div>
          ) : error ? (
            <div className="bg-white p-6 rounded shadow text-red-600">{error}</div>
          ) : users.length === 0 ? (
            <div className="bg-white p-6 rounded shadow text-gray-600">No users found.</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr className="[&>th]:px-4 [&>th]:py-2">
                    <th className="text-left font-medium text-gray-600 uppercase text-xs">ID</th>
                    <th className="text-left font-medium text-gray-600 uppercase text-xs">Email</th>
                    <th className="text-left font-medium text-gray-600 uppercase text-xs">Username</th>
                    <th className="text-left font-medium text-gray-600 uppercase text-xs">Role</th>
                    <th className="text-left font-medium text-gray-600 uppercase text-xs">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors [&>td]:px-4 [&>td]:py-2">
                      <td className="font-mono text-xs">{u.id.substring(0,8)}...</td>
                      <td>{u.email}</td>
                      <td>{u.username}</td>
                      <td>{UserService.roleLabel(u.role)}</td>
                      <td className="text-xs">{u.createdAt ? new Date(u.createdAt).toLocaleString() : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-3 text-xs text-gray-500">Total users: {users.length}</div>
            </div>
          )}
        </div>
      </div>
    </RequireRole>
  );
}
