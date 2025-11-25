// pages/student/enrollments/index.tsx
import StudentLayout from "@/components/student/layout/StudentLayout";
import { BadgeCheck, BookOpen, Clock, CreditCard, Search } from "lucide-react";
import Head from "next/head";
import { useMemo, useState } from "react";

type EnrollmentStatus = "active" | "pending" | "completed" | "cancelled";
type PaymentStatus = "paid" | "unpaid" | "refunded";

type Enrollment = {
  id: string;
  courseId: string;
  courseTitle: string;
  category: string;
  instructor: string;
  status: EnrollmentStatus;
  paymentStatus: PaymentStatus;
  enrolledAt: string; // ISO or display string
  accessUntil?: string;
  progress: number; // 0–100
  priceUsd: number;
};

const MOCK_ENROLLMENTS: Enrollment[] = [
  {
    id: "1",
    courseId: "course-1",
    courseTitle: "Net Zero Carbon Strategy for Business",
    category: "Sustainability · Intermediate",
    instructor: "Dr. Emma Collins",
    status: "active",
    paymentStatus: "paid",
    enrolledAt: "2025-02-10",
    accessUntil: "2025-08-10",
    progress: 72,
    priceUsd: 249,
  },
  {
    id: "2",
    courseId: "course-2",
    courseTitle: "Modern React & TypeScript Fundamentals",
    category: "Development · Beginner",
    instructor: "John Miller",
    status: "pending",
    paymentStatus: "unpaid",
    enrolledAt: "2025-03-02",
    accessUntil: undefined,
    progress: 0,
    priceUsd: 129,
  },
  {
    id: "3",
    courseId: "course-3",
    courseTitle: "Data Analytics for Business Leaders",
    category: "Analytics · Intermediate",
    instructor: "Sarah Khan",
    status: "completed",
    paymentStatus: "paid",
    enrolledAt: "2024-11-12",
    accessUntil: "Lifetime",
    progress: 100,
    priceUsd: 199,
  },
];

function formatDate(val?: string) {
  if (!val) return "-";
  if (val === "Lifetime") return "Lifetime";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return val;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusBadgeClasses(status: EnrollmentStatus) {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700";
    case "pending":
      return "bg-amber-50 text-amber-700";
    case "completed":
      return "bg-sky-50 text-sky-700";
    case "cancelled":
      return "bg-rose-50 text-rose-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function paymentBadgeClasses(status: PaymentStatus) {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-700";
    case "unpaid":
      return "bg-amber-50 text-amber-700";
    case "refunded":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function StudentEnrollmentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | EnrollmentStatus>(
    "all"
  );

  const filtered = useMemo(() => {
    let list = [...MOCK_ENROLLMENTS];

    if (statusFilter !== "all") {
      list = list.filter((e) => e.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.courseTitle.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.instructor.toLowerCase().includes(q)
      );
    }

    // newest first
    list.sort(
      (a, b) =>
        new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime()
    );

    return list;
  }, [search, statusFilter]);

  const totalActive = MOCK_ENROLLMENTS.filter(
    (e) => e.status === "active"
  ).length;
  const totalCompleted = MOCK_ENROLLMENTS.filter(
    (e) => e.status === "completed"
  ).length;

  const avgProgress =
    MOCK_ENROLLMENTS.length > 0
      ? Math.round(
          MOCK_ENROLLMENTS.reduce((sum, e) => sum + e.progress, 0) /
            MOCK_ENROLLMENTS.length
        )
      : 0;

  return (
    <>
      <Head>
        <title>My Enrollments · Student</title>
      </Head>
      <StudentLayout>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                My Enrollments
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Track all of your course enrollments, payment status, and
                learning progress from one place.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search courses or instructor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-72 pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Total Enrollments</p>
                <p className="mt-1 text-xl font-semibold">
                  {MOCK_ENROLLMENTS.length}
                </p>
              </div>
              <BookOpen className="h-6 w-6 text-slate-400" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Active Courses</p>
                <p className="mt-1 text-xl font-semibold">{totalActive}</p>
              </div>
              <Clock className="h-6 w-6 text-slate-400" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Avg. Progress</p>
                <p className="mt-1 text-xl font-semibold">{avgProgress}%</p>
              </div>
              <BadgeCheck className="h-6 w-6 text-slate-400" />
            </div>
          </div>

          {/* Filters + list */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 space-y-4">
            {/* Status filter */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {(
                [
                  { key: "all", label: "All" },
                  { key: "active", label: "Active" },
                  { key: "pending", label: "Pending" },
                  { key: "completed", label: "Completed" },
                  { key: "cancelled", label: "Cancelled" },
                ] as const
              ).map((tab) => {
                const isActive = statusFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() =>
                      setStatusFilter(tab.key as typeof statusFilter)
                    }
                    className={`px-3 py-1.5 rounded-full border text-xs font-medium ${
                      isActive
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
              <span className="ml-auto text-[11px] text-slate-500">
                Showing {filtered.length} of {MOCK_ENROLLMENTS.length}{" "}
                enrollments
              </span>
            </div>

            {/* Table-style list for desktop, cards for mobile */}
            {filtered.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">
                No enrollments match your filters.
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                        <th className="py-2 pr-3">Course</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">Payment</th>
                        <th className="py-2 px-3">Progress</th>
                        <th className="py-2 px-3">Enrolled</th>
                        <th className="py-2 px-3">Access</th>
                        <th className="py-2 pl-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filtered.map((e) => (
                        <tr key={e.id} className="align-middle">
                          <td className="py-3 pr-3">
                            <div className="flex flex-col">
                              <span className="text-[13px] font-medium text-slate-900">
                                {e.courseTitle}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {e.category} • {e.instructor}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusBadgeClasses(
                                e.status
                              )}`}
                            >
                              {e.status}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${paymentBadgeClasses(
                                e.paymentStatus
                              )}`}
                            >
                              <CreditCard className="h-3 w-3" />
                              {e.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-20 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-slate-900"
                                  style={{ width: `${e.progress}%` }}
                                />
                              </div>
                              <span className="text-[11px] text-slate-600">
                                {e.progress}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-[11px] text-slate-600">
                            {formatDate(e.enrolledAt)}
                          </td>
                          <td className="py-3 px-3 text-[11px] text-slate-600">
                            {formatDate(e.accessUntil)}
                          </td>
                          <td className="py-3 pl-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {(e.status === "active" ||
                                e.status === "completed") && (
                                <button
                                  type="button"
                                  className="text-[11px] text-slate-900 font-medium hover:underline underline-offset-2"
                                  // onClick={() => router.push(`/student/courses/${e.courseId}`)}
                                >
                                  Continue
                                </button>
                              )}
                              {e.paymentStatus === "unpaid" && (
                                <button
                                  type="button"
                                  className="text-[11px] text-emerald-600 font-medium hover:underline underline-offset-2"
                                >
                                  Pay Now
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                  {filtered.map((e) => (
                    <div
                      key={e.id}
                      className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[11px] text-slate-500">
                            {e.category}
                          </p>
                          <p className="text-[13px] font-medium text-slate-900">
                            {e.courseTitle}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {e.instructor}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusBadgeClasses(
                              e.status
                            )}`}
                          >
                            {e.status}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${paymentBadgeClasses(
                              e.paymentStatus
                            )}`}
                          >
                            <CreditCard className="h-3 w-3" />
                            {e.paymentStatus}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Enrolled: {formatDate(e.enrolledAt)}</span>
                        <span>Access: {formatDate(e.accessUntil)}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="h-1.5 flex-1 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-slate-900"
                              style={{ width: `${e.progress}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-slate-600">
                            {e.progress}%
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-slate-700">
                          ${e.priceUsd.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        {(e.status === "active" ||
                          e.status === "completed") && (
                          <button className="text-slate-900 font-medium hover:underline underline-offset-2">
                            Continue
                          </button>
                        )}
                        {e.paymentStatus === "unpaid" && (
                          <button className="text-emerald-600 font-medium hover:underline underline-offset-2">
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </StudentLayout>
    </>
  );
}
