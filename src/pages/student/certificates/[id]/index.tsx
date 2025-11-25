// pages/student/certificates/[id].tsx
import StudentLayout from "@/components/student/layout/StudentLayout";
import {
  Award,
  BookOpen,
  CalendarDays,
  Download,
  ExternalLink,
  Share2,
  ShieldCheck,
  User2,
} from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo } from "react";

// Keep this in sync with your certificates index page
type CertificateStatus = "issued" | "processing" | "revoked";

type Certificate = {
  id: string;
  certificateNumber: string;
  courseId: string;
  courseTitle: string;
  category: string;
  instructor: string;
  issuedAt: string;
  grade?: string;
  hours: number;
  status: CertificateStatus;
  // optional links when you wire backend
  pdfUrl?: string;
  verifyUrl?: string;
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
    verifyUrl: "/verify/CERT-2025-0001",
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
    verifyUrl: "/verify/CERT-2024-0124",
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

export default function CertificateDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const certificate = useMemo(() => {
    if (!id) return null;
    const cid = Array.isArray(id) ? id[0] : id;
    // later: fetch from API by id
    return MOCK_CERTIFICATES.find((c) => c.id === cid) ?? null;
  }, [id]);

  if (!certificate) {
    return (
      <>
        <Head>
          <title>Certificate · Student</title>
        </Head>
        <StudentLayout>
          <div className="max-w-4xl mx-auto px-4 py-10">
            <button
              onClick={() => router.push("/student/certificates")}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              ← Back to Certificates
            </button>
            <p className="mt-6 text-sm text-slate-500">
              Certificate not found or still processing.
            </p>
          </div>
        </StudentLayout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{certificate.courseTitle} · Certificate</title>
      </Head>
      <StudentLayout>
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          {/* Header + actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <button
                onClick={() => router.push("/student/certificates")}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                ← Back to Certificates
              </button>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">
                Certificate of Completion
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {certificate.courseTitle}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Certificate ID:{" "}
                <span className="font-medium text-slate-600">
                  {certificate.certificateNumber}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
                // onClick={() => window.open(certificate.verifyUrl, "_blank")}
              >
                <ShieldCheck className="h-4 w-4" />
                Verify
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
                // onClick={() => window.open(certificate.pdfUrl, "_blank")}
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>

          {/* Layout: certificate preview + metadata */}
          <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-6">
            {/* Certificate preview */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-6 md:px-10 md:py-10 relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full border border-dashed border-slate-200 opacity-60" />
                <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full border border-dashed border-slate-200 opacity-40" />
              </div>

              <div className="relative flex flex-col items-center text-center space-y-4">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-slate-900 text-white">
                  <Award className="h-6 w-6" />
                </div>
                <p className="text-[11px] tracking-[0.2em] uppercase text-slate-400">
                  Certificate of Completion
                </p>
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
                  {certificate.courseTitle}
                </h2>

                <p className="mt-1 max-w-xl text-xs md:text-sm text-slate-500">
                  This certifies that{" "}
                  <span className="font-semibold text-slate-900">
                    {/* Later: currentUser.name */}
                    Belayet Riad
                  </span>{" "}
                  has successfully completed the course and demonstrated the
                  required competencies.
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left text-xs">
                  <div>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                      Issued To
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900 flex items-center gap-1.5">
                      <User2 className="h-4 w-4 text-slate-400" />
                      Belayet Riad
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                      Issued On
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900 flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-slate-400" />
                      {formatDate(certificate.issuedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                      Learning Hours
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900 flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-slate-400" />
                      {certificate.hours} hours
                    </p>
                  </div>
                </div>

                <div className="mt-4 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs">
                  <div>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                      Instructor
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {certificate.instructor}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {certificate.category}
                    </p>
                  </div>
                  <div className="text-right sm:text-left">
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                      Performance
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {certificate.grade || "Completed"}
                    </p>
                    <p className="mt-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusBadge(
                          certificate.status
                        )}`}
                      >
                        {certificate.status === "issued" && "Issued"}
                        {certificate.status === "processing" && "Processing"}
                        {certificate.status === "revoked" && "Revoked"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Signature row (placeholder) */}
                <div className="mt-8 w-full grid grid-cols-2 gap-6 text-[11px] text-slate-500">
                  <div className="flex flex-col items-start">
                    <div className="h-px w-40 bg-slate-300" />
                    <p className="mt-2 font-medium text-slate-800">
                      {certificate.instructor}
                    </p>
                    <p>Course Instructor</p>
                  </div>
                  <div className="flex flex-col items-start">
                    <div className="h-px w-40 bg-slate-300" />
                    <p className="mt-2 font-medium text-slate-800">
                      LMS Program Director
                    </p>
                    <p>Program Director</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata / side panel */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Certificate Information
                </h3>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Certificate ID</span>
                    <span className="font-medium">
                      {certificate.certificateNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Course</span>
                    <span className="font-medium max-w-[60%] text-right">
                      {certificate.courseTitle}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Category</span>
                    <span className="font-medium max-w-[60%] text-right">
                      {certificate.category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Issued On</span>
                    <span className="font-medium">
                      {formatDate(certificate.issuedAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hours</span>
                    <span className="font-medium">{certificate.hours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusBadge(
                        certificate.status
                      )}`}
                    >
                      {certificate.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Quick Actions
                </h3>
                <div className="flex flex-col gap-2 text-xs">
                  <button
                    type="button"
                    className="inline-flex items-center justify-between gap-2 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                  >
                    <span className="inline-flex items-center gap-2 text-slate-800">
                      <Download className="h-4 w-4" />
                      Download PDF
                    </span>
                    <span className="text-[10px] text-slate-400">
                      High resolution
                    </span>
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-between gap-2 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                  >
                    <span className="inline-flex items-center gap-2 text-slate-800">
                      <ExternalLink className="h-4 w-4" />
                      Open in new tab
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Shareable link
                    </span>
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-between gap-2 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                  >
                    <span className="inline-flex items-center gap-2 text-slate-800">
                      <Share2 className="h-4 w-4" />
                      Share on LinkedIn
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Coming soon
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </StudentLayout>
    </>
  );
}
