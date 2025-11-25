// pages/student/certificates/index.tsx
import StudentLayout from "@/components/student/layout/StudentLayout";
import {
  Award,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Download,
  ExternalLink,
  Search,
  Share2,
} from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

type CertificateStatus = "issued" | "processing" | "revoked";

type Certificate = {
  id: string;
  certificateNumber: string;
  courseId: string;
  courseTitle: string;
  category: string;
  instructor: string;
  issuedAt: string; // ISO string
  grade?: string; // e.g. "95%", "A", "Completed"
  hours: number;
  status: CertificateStatus;
  pdfUrl?: string;
  shareUrl?: string;
};

const MOCK_CERTIFICATES: Certificate[] = [
  {
    id: "c1",
    certificateNumber: "CERT-2025-0001",
    courseId: "course-1",
    courseTitle: "Net Zero Carbon Strategy for Business",
    category: "Sustainability · Intermediate",
    instructor: "Dr. Emma Collins",
    issuedAt: "2025-02-18",
    grade: "A (94%)",
    hours: 20,
    status: "issued",
    pdfUrl: "/api/certificates/c1/pdf",
    shareUrl: "/student/certificates/c1",
  },
  {
    id: "c2",
    certificateNumber: "CERT-2024-0124",
    courseId: "course-3",
    courseTitle: "Data Analytics for Business Leaders",
    category: "Analytics · Intermediate",
    instructor: "Sarah Khan",
    issuedAt: "2024-12-05",
    grade: "Completed",
    hours: 18,
    status: "issued",
    pdfUrl: "/api/certificates/c2/pdf",
    shareUrl: "/student/certificates/c2",
  },
  {
    id: "c3",
    certificateNumber: "CERT-2024-0099",
    courseId: "course-5",
    courseTitle: "Modern React & TypeScript Fundamentals",
    category: "Development · Beginner",
    instructor: "John Miller",
    issuedAt: "2024-09-21",
    grade: "B+ (88%)",
    hours: 15,
    status: "issued",
    pdfUrl: "/api/certificates/c3/pdf",
    shareUrl: "/student/certificates/c3",
  },
];

function formatDate(val: string) {
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return val;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusBadge(status: CertificateStatus) {
  switch (status) {
    case "issued":
      return "bg-emerald-50 text-emerald-700";
    case "processing":
      return "bg-amber-50 text-amber-700";
    case "revoked":
      return "bg-rose-50 text-rose-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function StudentCertificatesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CertificateStatus>(
    "all"
  );

  const filtered = useMemo(() => {
    let list = [...MOCK_CERTIFICATES];

    if (statusFilter !== "all") {
      list = list.filter((c) => c.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.courseTitle.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.instructor.toLowerCase().includes(q) ||
          c.certificateNumber.toLowerCase().includes(q)
      );
    }

    // newest issued first
    list.sort(
      (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
    );

    return list;
  }, [search, statusFilter]);

  const totalCertificates = MOCK_CERTIFICATES.length;
  const totalHours = MOCK_CERTIFICATES.reduce((sum, c) => sum + c.hours, 0);
  const latest = [...MOCK_CERTIFICATES].sort(
    (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
  )[0];

  // --- helpers for actions (no design change) ---
  const handleView = (c: Certificate) => {
    router.push(`/student/certificates/${c.id}`);
  };

  const handleDownloadPdf = (c: Certificate) => {
    if (typeof window === "undefined") return;
    if (c.pdfUrl) {
      window.open(c.pdfUrl, "_blank");
    } else {
      // later replace with toast
      alert("PDF download is not configured yet.");
    }
  };

  const handleShare = async (c: Certificate) => {
    if (typeof window === "undefined") return;
    const base =
      window.location.origin ||
      (typeof location !== "undefined" ? location.origin : "");
    const url = c.shareUrl
      ? `${base}${c.shareUrl.startsWith("/") ? c.shareUrl : `/${c.shareUrl}`}`
      : `${base}/student/certificates/${c.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: c.courseTitle,
          text: `Certificate: ${c.courseTitle}`,
          url,
        });
      } catch {
        // user cancelled; ignore
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        alert("Share link copied to clipboard.");
      } catch {
        alert(url);
      }
    } else {
      alert(url);
    }
  };

  return (
    <>
      <Head>
        <title>Certificates · Student</title>
      </Head>
      <StudentLayout>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Certificates
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                View and download certificates from your completed courses.
                Share them with employers or on your professional profiles.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by course, instructor, or ID..."
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
                <p className="text-xs text-slate-500">Total Certificates</p>
                <p className="mt-1 text-xl font-semibold">
                  {totalCertificates}
                </p>
              </div>
              <Award className="h-6 w-6 text-slate-400" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">
                  Certified Learning Hours
                </p>
                <p className="mt-1 text-xl font-semibold">{totalHours} hrs</p>
              </div>
              <BookOpen className="h-6 w-6 text-slate-400" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Latest Certificate</p>
                <p className="mt-1 text-xs font-medium text-slate-900 line-clamp-2">
                  {latest ? latest.courseTitle : "—"}
                </p>
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
                  { key: "issued", label: "Issued" },
                  { key: "processing", label: "Processing" },
                  { key: "revoked", label: "Revoked" },
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
                Showing {filtered.length} of {MOCK_CERTIFICATES.length}{" "}
                certificates
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">
                No certificates found for the selected filters.
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                        <th className="py-2 pr-3">Course</th>
                        <th className="py-2 px-3">Certificate ID</th>
                        <th className="py-2 px-3">Issued On</th>
                        <th className="py-2 px-3">Hours</th>
                        <th className="py-2 px-3">Grade</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 pl-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filtered.map((c) => (
                        <tr key={c.id}>
                          <td className="py-3 pr-3">
                            <div className="flex flex-col">
                              <span className="text-[13px] font-medium text-slate-900">
                                {c.courseTitle}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {c.category} • {c.instructor}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-[11px] text-slate-600">
                            {c.certificateNumber}
                          </td>
                          <td className="py-3 px-3 text-[11px] text-slate-600">
                            {formatDate(c.issuedAt)}
                          </td>
                          <td className="py-3 px-3 text-[11px] text-slate-600">
                            {c.hours} hrs
                          </td>
                          <td className="py-3 px-3 text-[11px] text-slate-600">
                            {c.grade || "—"}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusBadge(
                                c.status
                              )}`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3 pl-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 text-[11px] text-slate-700 hover:bg-slate-50"
                                onClick={() => handleView(c)}
                              >
                                <ExternalLink className="h-3 w-3" />
                                View
                              </button>
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 text-[11px] text-slate-700 hover:bg-slate-50"
                                onClick={() => handleDownloadPdf(c)}
                              >
                                <Download className="h-3 w-3" />
                                PDF
                              </button>
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 text-[11px] text-slate-700 hover:bg-slate-50"
                                onClick={() => handleShare(c)}
                              >
                                <Share2 className="h-3 w-3" />
                                Share
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                  {filtered.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[11px] text-slate-500">
                            {c.category}
                          </p>
                          <p className="text-[13px] font-medium text-slate-900">
                            {c.courseTitle}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {c.instructor}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusBadge(
                              c.status
                            )}`}
                          >
                            {c.status}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                            <CalendarDays className="h-3 w-3" />
                            {formatDate(c.issuedAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>ID: {c.certificateNumber}</span>
                        <span>
                          {c.hours} hrs • {c.grade || "Completed"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <div className="flex items-center gap-1">
                          <button
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            onClick={() => handleView(c)}
                          >
                            <ExternalLink className="h-3 w-3" />
                            View
                          </button>
                          <button
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            onClick={() => handleDownloadPdf(c)}
                          >
                            <Download className="h-3 w-3" />
                            PDF
                          </button>
                        </div>
                        <button
                          className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900"
                          onClick={() => handleShare(c)}
                        >
                          <Share2 className="h-3 w-3" />
                          Share
                        </button>
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
