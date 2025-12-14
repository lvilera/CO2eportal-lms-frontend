import StudentLayout from "@/components/student/layout/StudentLayout";
import { useAuth } from "@/context/AuthContext";
import apiRequest from "@/lib/axios";
import {
  Award,
  BookOpen,
  Clock,
  PlayCircle,
  Search,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Enrollment = {
  _id: string;
  status?: string; // "active" | "completed" | etc.
  progress?: number; // 0-100
  lastAccessed?: string;
  completionDate?: string | null;

  courseId?:
    | string
    | {
        _id: string;
        title?: string;
        subtitle?: string;
        description?: string;
        thumbnailUrl?: string;
        durationMinutes?: number;
        level?: string;
        categoryId?:
          | {
              _id: string;
              title: string;
            }
          | string;
        instructorId?:
          | {
              _id?: string;
              firstName?: string;
              lastName?: string;
              email?: string;
            }
          | string;
      };

  currentLesson?: { _id?: string; title?: string } | string | null;
  currentModule?: { _id?: string; title?: string } | string | null;
};

type Certificate = {
  _id?: string;
  userId: string;
  courseId:
    | string
    | {
        _id: string;
        title?: string;
      };
  certificateNumber?: string;
  issuedAt?: string;
  verifiableUrl?: string;
};

function safeNumber(n: unknown, fallback = 0) {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : fallback;
}

function clampPercent(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function courseObj(e: Enrollment) {
  return typeof e.courseId === "object" && e.courseId ? e.courseId : null;
}

function pickCourseId(e: Enrollment) {
  const c = courseObj(e);
  return c?._id || (typeof e.courseId === "string" ? e.courseId : "");
}

function pickCourseTitle(e: Enrollment) {
  const c = courseObj(e);
  return c?.title || "Untitled Course";
}

function pickCategory(e: Enrollment) {
  const c = courseObj(e);
  const cat = c?.categoryId;
  if (typeof cat === "object" && cat?.title) return cat.title;
  return "Uncategorized";
}

function pickInstructor(e: Enrollment) {
  const c = courseObj(e);
  const ins = c?.instructorId;
  if (typeof ins === "object" && ins) {
    const name = `${ins.firstName ?? ""} ${ins.lastName ?? ""}`.trim();
    return name || ins.email || "Unknown Instructor";
  }
  return "Unknown Instructor";
}

function pickDurationHours(e: Enrollment) {
  const c = courseObj(e);
  const minutes = safeNumber(c?.durationMinutes, 0);
  if (!minutes) return 0;
  return Math.max(1, Math.round(minutes / 60));
}

function pickThumbnail(e: Enrollment) {
  const c = courseObj(e);
  return c?.thumbnailUrl || "";
}

function pickNextLessonTitle(e: Enrollment) {
  if (typeof e.currentLesson === "object" && e.currentLesson?.title) {
    return e.currentLesson.title;
  }
  return "Continue where you left off";
}

export default function StudentDashboardHome() {
  const { currentUser } = useAuth();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  useEffect(() => {
    const userId = (currentUser as any)?.id || (currentUser as any)?._id;
    if (!userId) return;

    const run = async () => {
      try {
        setLoading(true);

        const [enrollRes, certRes] = await Promise.allSettled([
          apiRequest.get(`/enrollments/user/${userId}`),
          apiRequest.get(`/certificates`, { params: { userId } }),
        ]);

        if (enrollRes.status === "fulfilled") {
          const raw = enrollRes.value?.data;

          const items: Enrollment[] = Array.isArray(raw)
            ? raw
            : Array.isArray(raw?.items)
            ? raw.items
            : [];

          setEnrollments(items);
        } else {
          setEnrollments([]);
          // eslint-disable-next-line no-console
          console.log(enrollRes.reason);
        }

        if (certRes.status === "fulfilled") {
          const raw = certRes.value?.data;
          const items: Certificate[] = Array.isArray(raw)
            ? raw
            : Array.isArray(raw?.items)
            ? raw.items
            : [];
          setCertificates(items);
        } else {
          setCertificates([]);
          // eslint-disable-next-line no-console
          console.log(certRes.reason);
        }
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [(currentUser as any)?.id, (currentUser as any)?._id]);

  // ✅ Active courses = progress 1–99 (your rule)
  const activeEnrollments = useMemo(() => {
    return enrollments
      .filter((e) => {
        const p = safeNumber(e.progress, 0);
        return p >= 1 && p <= 99;
      })
      .sort((a, b) => {
        const at = a.lastAccessed ? new Date(a.lastAccessed).getTime() : 0;
        const bt = b.lastAccessed ? new Date(b.lastAccessed).getTime() : 0;
        return bt - at; // recent first
      });
  }, [enrollments]);

  const filteredActive = useMemo(() => {
    if (!search.trim()) return activeEnrollments;

    const q = search.toLowerCase();
    return activeEnrollments.filter((e) => {
      const title = pickCourseTitle(e).toLowerCase();
      const cat = pickCategory(e).toLowerCase();
      const ins = pickInstructor(e).toLowerCase();
      return title.includes(q) || cat.includes(q) || ins.includes(q);
    });
  }, [activeEnrollments, search]);

  const enrolledCount = activeEnrollments.length;

  // Hours studied derived from active courses: durationMinutes * progress%
  const hoursStudied = useMemo(() => {
    const minutes = activeEnrollments.reduce((sum, e) => {
      const c = courseObj(e);
      const totalMin = safeNumber(c?.durationMinutes, 0);
      const p = clampPercent(safeNumber(e.progress, 0));
      return sum + (totalMin * p) / 100;
    }, 0);

    return Math.max(0, Math.round(minutes / 60));
  }, [activeEnrollments]);

  const avgCompletion = useMemo(() => {
    if (activeEnrollments.length === 0) return 0;
    const total = activeEnrollments.reduce(
      (sum, e) => sum + clampPercent(safeNumber(e.progress, 0)),
      0
    );
    return Math.round(total / activeEnrollments.length);
  }, [activeEnrollments]);

  const certificateCount = certificates.length;

  return (
    <StudentLayout>
      {/* KPI Row */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          href="/student/courses/active"
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4 hover:bg-white dark:hover:bg-slate-900 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Active Courses</span>
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {loading ? "…" : enrolledCount}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {loading ? "Loading…" : "Open your active courses"}
          </p>
        </Link>

        <Link
          href="/student/courses/active"
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4 hover:bg-white dark:hover:bg-slate-900 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Hours Studied</span>
            <Clock className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {loading ? "…" : `${hoursStudied} hrs`}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {loading ? "Loading…" : "Estimated from active progress"}
          </p>
        </Link>

        <Link
          href="/student/certificates"
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4 hover:bg-white dark:hover:bg-slate-900 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Certificates</span>
            <Award className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {loading ? "…" : certificateCount}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {loading ? "Loading…" : "View issued certificates"}
          </p>
        </Link>
      </div>

      {/* Welcome */}
      <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              Welcome{currentUser ? `, ${(currentUser as any).firstName}` : ""}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Continue learning from your active courses and monitor progress
              from a single command center.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
            <TrendingUp className="h-4 w-4" />
            <span>Average progress: </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {loading ? "…" : `${avgCompletion}%`}
            </span>
          </div>
        </div>
      </div>

      {/* Active Courses Section */}
      <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Active Courses
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              These are courses you’re currently progressing through (1–99%).
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search active courses..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-300"
            />
          </div>
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 py-10 text-center text-sm text-slate-500">
              Loading active courses…
            </div>
          ) : filteredActive.length === 0 ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 py-10 text-center text-sm text-slate-500">
              No active courses found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredActive.map((e) => {
                const cid = pickCourseId(e);
                const title = pickCourseTitle(e);
                const category = pickCategory(e);
                const instructor = pickInstructor(e);
                const thumb = pickThumbnail(e);
                const totalHours = pickDurationHours(e);
                const progress = clampPercent(safeNumber(e.progress, 0));
                const hoursStudiedOne = totalHours
                  ? Math.max(0, Math.round((totalHours * progress) / 100))
                  : 0;
                const nextLessonTitle = pickNextLessonTitle(e);

                return (
                  <div
                    key={e._id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/50 overflow-hidden"
                  >
                    <div className="p-4 flex gap-4">
                      {/* Thumbnail */}
                      <div className="hidden sm:block w-24 h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumb}
                            alt={title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-400">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Meta */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-slate-500">
                          {category} • {courseObj(e)?.level || "Beginner"}
                        </p>
                        <h4 className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                          {title}
                        </h4>
                        <p className="mt-1 text-xs text-slate-500">
                          Instructor:{" "}
                          <span className="font-medium text-slate-700 dark:text-slate-200">
                            {instructor}
                          </span>
                        </p>

                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>Progress</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-slate-900 dark:bg-slate-100"
                              style={{ width: `${progress}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                            <span>
                              {hoursStudiedOne} / {totalHours} hrs
                            </span>
                            <span className="truncate">
                              Next: {nextLessonTitle}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-4 pb-4 flex items-center justify-between gap-2">
                      <Link
                        href={`/student/courses/${cid}`}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                      >
                        <PlayCircle className="h-4 w-4" />
                        Continue
                      </Link>

                      <Link
                        href={`/student/courses/${cid}`}
                        className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white underline-offset-2 hover:underline"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {loading ? "…" : filteredActive.length}
            </span>{" "}
            active courses
          </div>

          <Link
            href="/student/courses/active"
            className="text-xs font-semibold text-slate-900 dark:text-slate-100 hover:underline underline-offset-2"
          >
            View all →
          </Link>
        </div>
      </div>
    </StudentLayout>
  );
}
