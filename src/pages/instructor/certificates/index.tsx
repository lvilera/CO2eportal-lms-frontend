import InstructorLayout from "@/components/instructor/layout/InstructorLayout";
import apiRequest from "@/lib/axios";
import { Toastr } from "@/lib/toastr";
import {
  Award,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileDown,
  Loader2,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CertificateStatus = "issued" | "processing" | "revoked";

type User = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

type Course = {
  _id: string;
  title?: string;
  thumbnailUrl?: string;
};

type Certificate = {
  _id: string;

  certificateNumber?: string;

  userId?: User; // populated
  courseId?: Course; // populated

  category?: string;
  instructor?: string;

  hours?: number;
  grade?: string;

  issuedAt?: string;
  status?: CertificateStatus;

  pdfUrl?: string;
  shareUrl?: string;

  createdAt?: string;
  updatedAt?: string;
};

type ApiResp = {
  items: Certificate[];
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

function initials(u?: User) {
  const a = (u?.firstName || "").trim();
  const b = (u?.lastName || "").trim();
  const s = `${a} ${b}`.trim();
  if (!s) return "U";
  return s
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase())
    .join("");
}

export default function AdminCertificatesIndex() {
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<CertificateStatus | "all">("all");

  const [rows, setRows] = useState<Certificate[]>([]);
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

    // If your backend supports populate flags:
    // params.populate = "userId,courseId";
    return params;
  }, [page, limit, q, status]);

  // reset page when filters change
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const { data } = await apiRequest.get<ApiResp>("/certificates", {
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
          e?.response?.data?.message || "Failed to load certificates"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [queryParams]);

  const badgeClass = (s?: CertificateStatus) => {
    if (s === "issued")
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    if (s === "processing")
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    if (s === "revoked")
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    return "bg-gray-100 text-gray-700 dark:bg-neutral-900 dark:text-neutral-300";
  };

  return (
    <InstructorLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Issued Certificates</h1>
          <p className="text-sm text-gray-500">
            View issued, processing, and revoked certificates across the
            platform.
          </p>
        </div>

        <span className="px-2 py-1 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm text-gray-500">
          Total:{" "}
          <span className="font-medium text-gray-900 dark:text-neutral-100">
            {total}
          </span>
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
        <div className="relative w-full lg:max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by student email/name, course, certificate #…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-end">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All status</option>
            <option value="issued">Issued</option>
            <option value="processing">Processing</option>
            <option value="revoked">Revoked</option>
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

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-neutral-900 text-gray-500">
            <tr>
              <th className="text-left p-3">Student</th>
              <th className="text-left p-3">Course</th>
              <th className="text-left p-3">Certificate</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Issued</th>
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
                  No certificates found.
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr
                  key={c._id}
                  className="border-t border-gray-100 dark:border-neutral-800"
                >
                  {/* Student */}
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-neutral-200">
                        {initials(c.userId)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 dark:text-neutral-100 truncate">
                          {c.userId?.firstName || c.userId?.lastName
                            ? `${c.userId?.firstName || ""} ${
                                c.userId?.lastName || ""
                              }`.trim()
                            : "Unknown Student"}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {c.userId?.email || "-"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Course */}
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {c.courseId?.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.courseId.thumbnailUrl}
                          alt={c.courseId?.title || "Course"}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                          <Award className="h-4 w-4 text-gray-500" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 dark:text-neutral-100 truncate">
                          {c.courseId?.title || "-"}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {c.category ? c.category : ""}
                          {c.category && c.instructor ? " · " : ""}
                          {c.instructor ? c.instructor : ""}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Certificate */}
                  <td className="p-3">
                    <div className="font-medium text-gray-900 dark:text-neutral-100">
                      {c.certificateNumber || "—"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {typeof c.hours === "number" ? `${c.hours} hrs` : ""}
                      {typeof c.hours === "number" && c.grade ? " · " : ""}
                      {c.grade ? `Grade: ${c.grade}` : ""}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${badgeClass(
                        c.status
                      )}`}
                    >
                      {c.status || "unknown"}
                    </span>
                  </td>

                  {/* Issued */}
                  <td className="p-3 text-gray-600 dark:text-neutral-300">
                    {fmt(c.issuedAt || c.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/certificates/${c._id}`}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>

                      {c.pdfUrl ? (
                        <a
                          href={c.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
                          title="Download PDF"
                        >
                          <FileDown className="h-4 w-4" />
                        </a>
                      ) : (
                        <span
                          className="p-2 rounded-lg opacity-40 cursor-not-allowed"
                          title="No PDF"
                        >
                          <FileDown className="h-4 w-4" />
                        </span>
                      )}

                      {c.shareUrl ? (
                        <a
                          href={c.shareUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
                          title="Open Share Link"
                        >
                          <BadgeCheck className="h-4 w-4" />
                        </a>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
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
              {Math.ceil((total || 0) / (limit || 20)) || 1}
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
              disabled={
                page >= Math.ceil((total || 0) / (limit || 20)) || loading
              }
              onClick={() =>
                setPage((p) =>
                  Math.min(Math.ceil((total || 0) / (limit || 20)) || 1, p + 1)
                )
              }
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-neutral-900"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
}
