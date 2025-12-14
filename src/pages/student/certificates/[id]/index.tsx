// pages/student/certificates/[id].tsx
import StudentLayout from "@/components/student/layout/StudentLayout";
import apiRequest from "@/lib/axios"; // <- you already use this in other pages
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
import { useEffect, useMemo, useState } from "react";

type CertificateStatus = "issued" | "processing" | "revoked";

type ApiCourse = {
  _id: string;
  title: string;
  slug?: string;
  subtitle?: string;
  thumbnailUrl?: string;
  level?: string;
  language?: string;
  durationMinutes?: number;
};

type ApiUser = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

type ApiCertificate = {
  _id: string;
  certificateNumber: string;
  issuedAt: string;
  expiresAt: string | null;
  verifiableUrl?: string | null;
  pdfUrl?: string | null;
  metadata?: {
    enrollmentId?: string;
    [k: string]: any;
  };
  courseId: ApiCourse; // populated object
  userId: ApiUser; // populated object
  createdAt?: string;
  updatedAt?: string;
};

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

function getFullName(u?: ApiUser | null) {
  const first = u?.firstName?.trim() || "";
  const last = u?.lastName?.trim() || "";
  const full = `${first} ${last}`.trim();
  return full || u?.email || "Student";
}

/**
 * Decide status from your real data rules.
 * Right now:
 * - if certificateNumber exists => issued
 * - else => processing
 * You can swap this logic when you add a status field in the DB.
 */
function deriveStatus(cert?: ApiCertificate | null): CertificateStatus {
  if (!cert) return "processing";
  if (cert.certificateNumber) return "issued";
  return "processing";
}

export default function CertificateDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<ApiCertificate | null>(null);

  const certId = useMemo(() => {
    if (!id) return null;
    return Array.isArray(id) ? id[0] : id;
  }, [id]);

  useEffect(() => {
    if (!certId) return;

    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Backend: GET /certificates/:id (should return your exact object)
        const res = await apiRequest.get<ApiCertificate>(
          `/certificates/${certId}`
        );

        if (!mounted) return;
        setCertificate(res.data);
      } catch (e: any) {
        if (!mounted) return;
        setCertificate(null);

        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Failed to load certificate.";
        setError(msg);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [certId]);

  // Map API -> UI fields (single source of truth)
  const view = useMemo(() => {
    if (!certificate) return null;

    const courseTitle = certificate.courseId?.title || "Untitled Course";
    const issuedTo = getFullName(certificate.userId);
    const issuedAt = certificate.issuedAt || certificate.createdAt || "";
    const status = deriveStatus(certificate);

    // Optional: if backend provides verifiableUrl/pdfUrl use it, otherwise build sensible defaults
    const verifyUrl =
      certificate.verifiableUrl ||
      `/verify/${encodeURIComponent(certificate.certificateNumber)}`;

    const pdfUrl = certificate.pdfUrl || `/certificates/${certificate._id}/pdf`; // optional backend route you can add

    // You don't have category/instructor/hours in your current response.
    // Keep placeholders but make them resilient.
    const category = `${certificate.courseId?.level || "Course"} · ${
      certificate.courseId?.language?.toUpperCase() || "EN"
    }`;

    const instructor = "—"; // add instructor to populated course later if you want
    const hours = certificate.courseId?.durationMinutes
      ? Math.max(1, Math.round(certificate.courseId.durationMinutes / 60))
      : 0;

    return {
      courseTitle,
      issuedTo,
      issuedAt,
      status,
      verifyUrl,
      pdfUrl,
      category,
      instructor,
      hours,
      certificateNumber: certificate.certificateNumber,
    };
  }, [certificate]);

  // Loading / Not found states
  if (loading) {
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
            <p className="mt-6 text-sm text-slate-500">Loading certificate…</p>
          </div>
        </StudentLayout>
      </>
    );
  }

  if (error || !view) {
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
              {error || "Certificate not found or still processing."}
            </p>
          </div>
        </StudentLayout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{view.courseTitle} · Certificate</title>
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

              <p className="text-sm text-slate-500 mt-1">{view.courseTitle}</p>

              <p className="text-xs text-slate-400 mt-1">
                Certificate ID:{" "}
                <span className="font-medium text-slate-600">
                  {view.certificateNumber}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => window.open(view.verifyUrl, "_blank")}
              >
                <ShieldCheck className="h-4 w-4" />
                Verify
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => window.open(view.pdfUrl, "_blank")}
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
                onClick={async () => {
                  // lightweight share flow
                  const shareLink = view.verifyUrl;
                  try {
                    if (navigator.share) {
                      await navigator.share({
                        title: `Certificate · ${view.courseTitle}`,
                        text: `Verify my certificate: ${view.certificateNumber}`,
                        url: shareLink,
                      });
                    } else {
                      await navigator.clipboard.writeText(shareLink);
                      alert("Link copied to clipboard.");
                    }
                  } catch {
                    // ignore
                  }
                }}
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
                  {view.courseTitle}
                </h2>

                <p className="mt-1 max-w-xl text-xs md:text-sm text-slate-500">
                  This certifies that{" "}
                  <span className="font-semibold text-slate-900">
                    {view.issuedTo}
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
                      {view.issuedTo}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                      Issued On
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900 flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-slate-400" />
                      {formatDate(view.issuedAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                      Learning Hours
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900 flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-slate-400" />
                      {view.hours ? `${view.hours} hours` : "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs">
                  <div>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                      Course Info
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {view.instructor}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {view.category}
                    </p>
                  </div>

                  <div className="text-right sm:text-left">
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                      Status
                    </p>
                    <p className="mt-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusBadge(
                          view.status
                        )}`}
                      >
                        {view.status === "issued" && "Issued"}
                        {view.status === "processing" && "Processing"}
                        {view.status === "revoked" && "Revoked"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Signature row (placeholder) */}
                <div className="mt-8 w-full grid grid-cols-2 gap-6 text-[11px] text-slate-500">
                  <div className="flex flex-col items-start">
                    <div className="h-px w-40 bg-slate-300" />
                    <p className="mt-2 font-medium text-slate-800">
                      {view.instructor}
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
                      {view.certificateNumber}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Course</span>
                    <span className="font-medium max-w-[60%] text-right">
                      {view.courseTitle}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Issued To</span>
                    <span className="font-medium max-w-[60%] text-right">
                      {view.issuedTo}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Issued On</span>
                    <span className="font-medium">
                      {formatDate(view.issuedAt)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Expires</span>
                    <span className="font-medium">
                      {certificate?.expiresAt
                        ? formatDate(certificate.expiresAt)
                        : "No expiry"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Status</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusBadge(
                        view.status
                      )}`}
                    >
                      {view.status}
                    </span>
                  </div>

                  {certificate?.metadata?.enrollmentId && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Enrollment</span>
                      <span className="font-medium max-w-[60%] text-right">
                        {certificate.metadata.enrollmentId}
                      </span>
                    </div>
                  )}
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
                    onClick={() => window.open(view.pdfUrl, "_blank")}
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
                    onClick={() => window.open(view.verifyUrl, "_blank")}
                  >
                    <span className="inline-flex items-center gap-2 text-slate-800">
                      <ExternalLink className="h-4 w-4" />
                      Open verification
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Shareable link
                    </span>
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center justify-between gap-2 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                    onClick={() =>
                      window.open(
                        "https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME",
                        "_blank"
                      )
                    }
                  >
                    <span className="inline-flex items-center gap-2 text-slate-800">
                      <Share2 className="h-4 w-4" />
                      Share on LinkedIn
                    </span>
                    <span className="text-[10px] text-slate-400">Optional</span>
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
