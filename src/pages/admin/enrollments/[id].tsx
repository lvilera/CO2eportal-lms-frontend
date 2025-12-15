// pages/admin/enrollments/[id].tsx
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { useConfirm } from "@/components/ui/ConfirmDialogProvider";
import apiRequest from "@/lib/axios";
import { Toastr } from "@/lib/toastr";
import {
  Activity,
  ArrowLeft,
  BookOpen,
  Cable,
  CheckCircle2,
  Clock,
  Link as LinkIcon,
  Loader2,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

type EnrollmentStatus = "active" | "completed" | "cancelled" | "paused";

type UserType = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type CourseType = {
  _id: string;
  title?: string;
  slug?: string;
  subtitle?: string;
  thumbnailUrl?: string;
  level?: string;
  language?: string;
  price?: number;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type ModuleType = {
  _id: string;
  title?: string;
  position?: number;
};

type LessonType = {
  _id: string;
  title?: string;
  slug?: string;
  position?: number;
};

type EnrollmentType = {
  _id: string;
  userId?: UserType;
  courseId?: CourseType;
  enrollmentDate?: string;
  status?: EnrollmentStatus;
  completionDate?: string | null;
  progress?: number;
  lastAccessed?: string;
  currentModule?: ModuleType | null;
  currentLesson?: LessonType | null;
  createdAt?: string;
  updatedAt?: string;
};

function fmt(dt?: string | null) {
  if (!dt) return "-";
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return "-";
  }
}

function clampPct(n?: number) {
  const v = typeof n === "number" ? n : 0;
  return Math.max(0, Math.min(100, v));
}

export default function AdminEnrollmentDetailsPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const { confirm } = useConfirm();

  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<EnrollmentType | null>(null);

  const statusBadge = useMemo(() => {
    const s = row?.status;
    if (s === "completed")
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    if (s === "active")
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    if (s === "paused")
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    if (s === "cancelled")
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    return "bg-gray-100 text-gray-700 dark:bg-neutral-900 dark:text-neutral-300";
  }, [row?.status]);

  const progress = clampPct(row?.progress);

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    setLoading(true);
    (async () => {
      try {
        // If your backend returns { item } just adjust below accordingly.
        const { data } = await apiRequest.get<EnrollmentType>(
          `/enrollments/${id}`
        );
        if (!mounted) return;
        setRow(data);
      } catch (e: any) {
        Toastr.error(
          e?.response?.data?.message || "Failed to load enrollment details"
        );
        setRow(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!row?._id) return;

    const ok = await confirm({
      title: "Delete Enrollment?",
      message: "You are about to delete this enrollment permanently.",
      confirmText: "Yes, delete",
      cancelText: "Cancel",
    });

    if (!ok) return;

    try {
      await apiRequest.delete(`/enrollments/${row._id}`);
      Toastr.success("Enrollment deleted!");
      router.push("/admin/enrollments");
    } catch (e: any) {
      Toastr.error(e?.response?.data?.message || "Failed to delete enrollment");
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/enrollments")}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div>
            <h1 className="text-xl font-semibold">Enrollment Details</h1>
            <p className="text-sm text-gray-500">
              Operational view of learner status, progress, and activity.
            </p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:opacity-90"
          disabled={loading || !row?._id}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-10 text-center">
          <Loader2 className="h-6 w-6 animate-spin inline-block" />
        </div>
      ) : !row ? (
        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-10 text-center text-gray-500">
          Enrollment not found.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Main */}
          <div className="lg:col-span-2 space-y-4">
            {/* Summary card */}
            <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${statusBadge}`}
                    >
                      {row.status || "unknown"}
                    </span>
                    {row.status === "completed" && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 dark:text-green-300">
                        <CheckCircle2 className="h-4 w-4" />
                        Completed
                      </span>
                    )}
                  </div>

                  <h2 className="mt-2 text-lg font-semibold text-gray-900 dark:text-neutral-100">
                    {row.courseId?.title || "Unknown Course"}
                  </h2>

                  <div className="mt-1 text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Enrolled: {fmt(row.enrollmentDate)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Activity className="h-4 w-4" />
                      Last Accessed: {fmt(row.lastAccessed)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Completion: {fmt(row.completionDate)}
                    </span>
                  </div>
                </div>

                {row.courseId?.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={row.courseId.thumbnailUrl}
                    alt={row.courseId?.title || "Course"}
                    className="w-20 h-20 rounded-xl object-cover border border-gray-100 dark:border-neutral-800"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Progress */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-700 dark:text-neutral-200 font-medium">
                    Progress
                  </span>
                  <span className="text-gray-600 dark:text-neutral-300">
                    {progress}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 dark:bg-white"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg border border-gray-200 dark:border-neutral-800 p-3">
                    <div className="text-gray-500 text-xs">Current Module</div>
                    <div className="text-gray-900 dark:text-neutral-100 font-medium mt-1">
                      {row.currentModule?.title || "-"}
                    </div>
                    {typeof row.currentModule?.position === "number" && (
                      <div className="text-xs text-gray-500 mt-1">
                        Position: {row.currentModule.position}
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-gray-200 dark:border-neutral-800 p-3">
                    <div className="text-gray-500 text-xs">Current Lesson</div>
                    <div className="text-gray-900 dark:text-neutral-100 font-medium mt-1">
                      {row.currentLesson?.title || "-"}
                    </div>
                    {typeof row.currentLesson?.position === "number" && (
                      <div className="text-xs text-gray-500 mt-1">
                        Position: {row.currentLesson.position}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline / Audit */}
            <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-neutral-100 mb-3">
                Activity Timeline
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-900 dark:text-neutral-100 font-medium">
                      Enrollment created
                    </div>
                    <div className="text-gray-500">
                      {fmt(row.createdAt || row.enrollmentDate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-900 dark:text-neutral-100 font-medium">
                      Last updated
                    </div>
                    <div className="text-gray-500">{fmt(row.updatedAt)}</div>
                  </div>
                </div>

                {row.completionDate ? (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-700 dark:text-green-300" />
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-900 dark:text-neutral-100 font-medium">
                        Marked completed
                      </div>
                      <div className="text-gray-500">
                        {fmt(row.completionDate)}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-4">
            {/* Student card */}
            <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-neutral-100 mb-3">
                Student
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 dark:text-neutral-100 truncate">
                    {row.userId?.firstName || row.userId?.lastName
                      ? `${row.userId?.firstName || ""} ${
                          row.userId?.lastName || ""
                        }`.trim()
                      : "Unknown Student"}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {row.userId?.email || "-"}
                  </div>
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-600 dark:text-neutral-300 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Role</span>
                  <span className="text-gray-900 dark:text-neutral-100">
                    {row.userId?.role || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Active</span>
                  <span className="text-gray-900 dark:text-neutral-100">
                    {typeof row.userId?.isActive === "boolean"
                      ? row.userId.isActive
                        ? "Yes"
                        : "No"
                      : "-"}
                  </span>
                </div>
              </div>

              {/* Optional link if you have admin user page */}
              <div className="mt-4">
                <Link
                  href={
                    row.userId?._id ? `/admin/users/${row.userId._id}` : "#"
                  }
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 text-sm ${
                    row.userId?._id
                      ? "hover:bg-gray-50 dark:hover:bg-neutral-900"
                      : "opacity-50 pointer-events-none"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  View Student
                </Link>
              </div>
            </div>

            {/* Course card */}
            <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-neutral-100 mb-3">
                Course
              </h3>

              <div className="text-sm text-gray-600 dark:text-neutral-300 space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Title</span>
                  <span className="text-gray-900 dark:text-neutral-100 text-right">
                    {row.courseId?.title || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Published</span>
                  <span className="text-gray-900 dark:text-neutral-100">
                    {typeof row.courseId?.isPublished === "boolean"
                      ? row.courseId.isPublished
                        ? "Yes"
                        : "No"
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Price</span>
                  <span className="text-gray-900 dark:text-neutral-100">
                    {typeof row.courseId?.price === "number"
                      ? `$${row.courseId.price}`
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Language</span>
                  <span className="text-gray-900 dark:text-neutral-100">
                    {row.courseId?.language || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Level</span>
                  <span className="text-gray-900 dark:text-neutral-100">
                    {row.courseId?.level || "-"}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={
                    row.courseId?._id
                      ? `/admin/courses/${row.courseId._id}/edit`
                      : "#"
                  }
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 text-sm ${
                    row.courseId?._id
                      ? "hover:bg-gray-50 dark:hover:bg-neutral-900"
                      : "opacity-50 pointer-events-none"
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  Edit Course
                </Link>

                <Link
                  href={
                    row.courseId?._id
                      ? `/admin/courses/${row.courseId._id}/modules`
                      : "#"
                  }
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 text-sm ${
                    row.courseId?._id
                      ? "hover:bg-gray-50 dark:hover:bg-neutral-900"
                      : "opacity-50 pointer-events-none"
                  }`}
                >
                  <Cable className="h-4 w-4" />
                  Modules
                </Link>

                {/* Optional: course public link by slug */}
                <Link
                  href={
                    row.courseId?.slug ? `/courses/${row.courseId.slug}` : "#"
                  }
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 text-sm ${
                    row.courseId?.slug
                      ? "hover:bg-gray-50 dark:hover:bg-neutral-900"
                      : "opacity-50 pointer-events-none"
                  }`}
                >
                  <LinkIcon className="h-4 w-4" />
                  Public Page
                </Link>
              </div>
            </div>

            {/* Raw meta (optional but useful in admin) */}
            <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-neutral-100 mb-3">
                Technical Metadata
              </h3>
              <div className="text-xs text-gray-600 dark:text-neutral-300 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-500">Enrollment ID</span>
                  <span className="font-mono text-gray-900 dark:text-neutral-100 truncate max-w-[180px]">
                    {row._id}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-500">User ID</span>
                  <span className="font-mono text-gray-900 dark:text-neutral-100 truncate max-w-[180px]">
                    {row.userId?._id || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-500">Course ID</span>
                  <span className="font-mono text-gray-900 dark:text-neutral-100 truncate max-w-[180px]">
                    {row.courseId?._id || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
