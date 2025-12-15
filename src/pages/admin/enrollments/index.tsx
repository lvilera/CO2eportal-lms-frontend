// pages/admin/enrollments/index.tsx
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { useConfirm } from "@/components/ui/ConfirmDialogProvider";
import apiRequest from "@/lib/axios";
import { Toastr } from "@/lib/toastr";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  GraduationCap,
  Loader2,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type EnrollmentStatus = "active" | "completed" | "cancelled" | "paused";

type User = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isActive?: boolean;
};

type Course = {
  _id: string;
  title?: string;
  thumbnailUrl?: string;
  price?: number;
  isPublished?: boolean;
  level?: string;
  language?: string;
};

type Enrollment = {
  _id: string;
  userId?: User;
  courseId?: Course;
  enrollmentDate?: string;
  status?: EnrollmentStatus;
  completionDate?: string | null;
  progress?: number;
  lastAccessed?: string;
};

type ApiResp = {
  items: Enrollment[];
  total: number;
  page: number;
  limit: number;
};

function fmt(dt?: string | null) {
  if (!dt) return "-";
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return "-";
  }
}

function pct(n?: number) {
  const v = typeof n === "number" ? Math.max(0, Math.min(100, n)) : 0;
  return v;
}

export default function AdminEnrollmentsIndex() {
  const { confirm } = useConfirm();

  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<EnrollmentStatus | "all">("all");

  const [rows, setRows] = useState<Enrollment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const totalPages = useMemo(() => {
    const pages = Math.ceil((total || 0) / (limit || 20));
    return pages > 0 ? pages : 1;
  }, [total, limit]);

  const queryParams = useMemo(() => {
    const params: any = { page, limit };
    if (q.trim()) params.q = q.trim();
    if (status !== "all") params.status = status;
    return params;
  }, [q, status, page, limit]);

  const handleDelete = async (enrollment: Enrollment) => {
    const ok = await confirm({
      title: "Delete Enrollment?",
      message: "You are about to delete this enrollment permanently.",
      confirmText: "Yes, delete",
      cancelText: "Cancel",
    });

    if (!ok) return;

    try {
      await apiRequest.delete(`/enrollments/${enrollment._id}`);
      setRows((prev) => prev.filter((x) => x._id !== enrollment._id));
      setTotal((t) => Math.max(0, t - 1));
      Toastr.success("Enrollment deleted!");
    } catch (e: any) {
      Toastr.error(e?.response?.data?.message || "Failed to delete enrollment");
    }
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const { data } = await apiRequest.get<ApiResp>("/enrollments", {
          params: queryParams,
        });

        if (!mounted) return;
        setRows(data.items || []);
        setTotal(data.total || 0);
        setPage(data.page || 1);
        setLimit(data.limit || 20);
      } catch (e: any) {
        if (!mounted) return;
        setRows([]);
        setTotal(0);
        Toastr.error(
          e?.response?.data?.message || "Failed to load enrollments"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [queryParams]);

  // When filters change, reset to page 1 (keeps UX clean)
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status]);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Enrollments</h1>
          <p className="text-sm text-gray-500">
            Track who enrolled in which course, progress, and completion.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-sm text-gray-500">
          <span className="px-2 py-1 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
            Total:{" "}
            <span className="font-medium text-gray-900 dark:text-neutral-100">
              {total}
            </span>
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="relative w-full md:max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by student name/email or course title…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value, 10))}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-neutral-900 text-gray-500">
            <tr>
              <th className="text-left p-3">Student</th>
              <th className="text-left p-3">Course</th>
              <th className="text-left p-3">Progress</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Last Accessed</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center">
                  <Loader2 className="h-5 w-5 animate-spin inline-block" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No enrollments found.
                </td>
              </tr>
            ) : (
              rows.map((en) => {
                const user = en.userId;
                const course = en.courseId;
                const p = pct(en.progress);

                const badge =
                  en.status === "completed"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : en.status === "active"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : en.status === "paused"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";

                return (
                  <tr
                    key={en._id}
                    className="border-t border-gray-100 dark:border-neutral-800"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                          <GraduationCap className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-neutral-100">
                            {user?.firstName || user?.lastName
                              ? `${user?.firstName || ""} ${
                                  user?.lastName || ""
                                }`.trim()
                              : "Unknown Student"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user?.email || "-"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {course?.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={course.thumbnailUrl}
                            alt={course.title || "Course"}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900 dark:text-neutral-100">
                            {course?.title || "Unknown Course"}
                          </div>
                          <div className="text-xs text-gray-500">
                            Enrolled: {fmt(en.enrollmentDate)}
                            {en.completionDate
                              ? ` · Completed: ${fmt(en.completionDate)}`
                              : ""}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-28 h-2 rounded-full bg-gray-100 dark:bg-neutral-800 overflow-hidden">
                          <div
                            className="h-full bg-neutral-900 dark:bg-white"
                            style={{ width: `${p}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-600 dark:text-neutral-300 w-10 text-right">
                          {p}%
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${badge}`}>
                        {en.status || "unknown"}
                      </span>
                    </td>

                    <td className="p-3 text-gray-600 dark:text-neutral-300">
                      {fmt(en.lastAccessed)}
                    </td>

                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/enrollments/${en._id}`}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        <button
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-red-600"
                          title="Delete"
                          onClick={() => handleDelete(en)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-3 py-3 border-t border-gray-100 dark:border-neutral-800 text-sm">
          <div className="text-gray-500">
            Page{" "}
            <span className="text-gray-900 dark:text-neutral-100 font-medium">
              {page}
            </span>{" "}
            of{" "}
            <span className="text-gray-900 dark:text-neutral-100 font-medium">
              {totalPages}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-neutral-900"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>

            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-neutral-900"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
