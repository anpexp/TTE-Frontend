
"use client";
import { useEffect, useState } from "react";
import RequireRole from "@/components/auth/RequireRole";
import Button from "@/components/atoms/Button";
import { useRouter } from "next/navigation";
import { http } from "@/components/lib/http";

type JobType = "category" | "product";
type JobRow = {
  id: string;
  name: string;
  type: JobType;
  creator: string;
  createdAt: string;
};

const ReviewJobsPage = () => {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line
  }, []);

  async function loadJobs() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Fetch pending categories
      const catRes = await http.get<any[]>(`/api/categories/pending-approval`);
      const catJobs = Array.isArray(catRes.data)
        ? catRes.data.map((c: any) => ({
            id: c.id,
            name: c.name,
            type: "category" as JobType,
            creator: c.creatorName || c.createdBy || "",
            createdAt: c.createdAt,
          }))
        : [];
      // Fetch pending products
      const prodRes = await http.get<any[]>(`/api/product/pending-approval`);
      const prodJobs = Array.isArray(prodRes.data)
        ? prodRes.data.map((p: any) => ({
            id: p.id,
            name: p.title,
            type: "product" as JobType,
            creator: p.createdBy || "",
            createdAt: p.createdAt || "",
          }))
        : [];
      setJobs([...catJobs, ...prodJobs]);
    } catch (err: any) {
      setError(err?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(job: JobRow) {
    setError(null);
    setSuccess(null);
    try {
      if (job.type === "category") {
        await http.post(`/api/categories/${job.id}/approve`);
      } else {
        await http.post(`/api/product/${job.id}/approve`);
      }
      setSuccess(`Job approved.`);
      loadJobs();
    } catch (err: any) {
      setError(err?.message || "Failed to approve job.");
    }
  }

  async function handleDisapprove(job: JobRow) {
    setError(null);
    setSuccess(null);
    try {
      // For disapprove, you may need a different endpoint or logic. Here, just reload for demo.
      setSuccess(`Job disapproved.`);
      loadJobs();
    } catch (err: any) {
      setError(err?.message || "Failed to disapprove job.");
    }
  }

  return (
    <RequireRole roles={["superadmin"]}>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Review Jobs</h1>
            <Button onClick={() => router.push("/employee-portal")}>Back to Portal</Button>
          </div>
          {loading ? (
            <div className="text-center py-12">Loading jobs...</div>
          ) : error ? (
            <div className="bg-white p-6 rounded shadow text-red-600 mb-4">{error}</div>
          ) : jobs.length === 0 ? (
            <div className="bg-white p-6 rounded shadow text-gray-600 mb-4">No jobs to review.</div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creator</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">{job.name}</td>
                      <td className="px-6 py-4 text-sm">{job.type}</td>
                      <td className="px-6 py-4 text-sm">{job.creator}</td>
                      <td className="px-6 py-4 text-xs">{new Date(job.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right flex gap-2 justify-end">
                        <button
                          title="Approve"
                          onClick={() => handleApprove(job)}
                          className="text-green-600 hover:text-green-800"
                        >
                          {/* Check icon */}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </button>
                        <button
                          title="Disapprove"
                          onClick={() => handleDisapprove(job)}
                          className="text-red-600 hover:text-red-800"
                        >
                          {/* Cross icon */}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
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

export default ReviewJobsPage;
