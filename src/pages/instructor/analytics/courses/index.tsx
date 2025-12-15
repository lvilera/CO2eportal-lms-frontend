import InstructorLayout from "@/components/instructor/layout/InstructorLayout";
import {
  BarChart3,
  BookOpen,
  Clock,
  Loader2,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

/* =========================
   Types (API-friendly)
========================= */

type RangeKey = "7d" | "30d" | "90d";

type CourseLite = {
  _id: string;
  title: string;
  thumbnailUrl?: string;
};

type CourseAnalyticsResp = {
  course: CourseLite;

  summary: {
    enrollments: number;
    activeLearners: number;
    completionRatePct: number; // 0-100
    avgProgressPct: number; // 0-100
    minutesWatched: number;
    avgWatchTimeMin: number;
    avgRating: number;
    ratingCount: number;
  };

  byDay: Array<{
    date: string; // YYYY-MM-DD
    activeLearners: number;
    minutesWatched: number;
    lessonsCompleted: number;
  }>;

  topLessons: Array<{
    _id: string;
    moduleTitle: string;
    lessonTitle: string;
    views: number;
    avgWatchPct: number; // 0-100
    avgWatchMin: number;
    dropOffPct: number; // 0-100
  }>;
};

/* =========================
   Demo data (replace later)
========================= */

const DEMO_COURSES: CourseLite[] = [
  {
    _id: "c1",
    title: "Web Development Course 01",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=300&q=80",
  },
  {
    _id: "c2",
    title: "Modern JavaScript Mastery",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=300&q=80",
  },
];

const DEMO_ANALYTICS: Record<string, CourseAnalyticsResp> = {
  c1: {
    course: DEMO_COURSES[0],
    summary: {
      enrollments: 148,
      activeLearners: 63,
      completionRatePct: 14,
      avgProgressPct: 33,
      minutesWatched: 1320,
      avgWatchTimeMin: 37,
      avgRating: 4.6,
      ratingCount: 44,
    },
    byDay: [
      {
        date: "2025-12-10",
        activeLearners: 8,
        minutesWatched: 160,
        lessonsCompleted: 14,
      },
      {
        date: "2025-12-11",
        activeLearners: 11,
        minutesWatched: 240,
        lessonsCompleted: 21,
      },
      {
        date: "2025-12-12",
        activeLearners: 16,
        minutesWatched: 340,
        lessonsCompleted: 30,
      },
      {
        date: "2025-12-13",
        activeLearners: 15,
        minutesWatched: 310,
        lessonsCompleted: 26,
      },
      {
        date: "2025-12-14",
        activeLearners: 13,
        minutesWatched: 270,
        lessonsCompleted: 24,
      },
    ],
    topLessons: [
      {
        _id: "l1",
        moduleTitle: "Module 1",
        lessonTitle: "Lesson 1 · Introduction",
        views: 98,
        avgWatchPct: 74,
        avgWatchMin: 6,
        dropOffPct: 18,
      },
      {
        _id: "l2",
        moduleTitle: "Module 1",
        lessonTitle: "Lesson 2 · HTML Basics",
        views: 86,
        avgWatchPct: 66,
        avgWatchMin: 9,
        dropOffPct: 24,
      },
      {
        _id: "l3",
        moduleTitle: "Module 2",
        lessonTitle: "Lesson 1 · Tailwind Setup",
        views: 71,
        avgWatchPct: 59,
        avgWatchMin: 8,
        dropOffPct: 31,
      },
    ],
  },

  c2: {
    course: DEMO_COURSES[1],
    summary: {
      enrollments: 104,
      activeLearners: 41,
      completionRatePct: 25,
      avgProgressPct: 51,
      minutesWatched: 1185,
      avgWatchTimeMin: 42,
      avgRating: 4.3,
      ratingCount: 31,
    },
    byDay: [
      {
        date: "2025-12-10",
        activeLearners: 6,
        minutesWatched: 130,
        lessonsCompleted: 11,
      },
      {
        date: "2025-12-11",
        activeLearners: 8,
        minutesWatched: 210,
        lessonsCompleted: 17,
      },
      {
        date: "2025-12-12",
        activeLearners: 12,
        minutesWatched: 300,
        lessonsCompleted: 25,
      },
      {
        date: "2025-12-13",
        activeLearners: 9,
        minutesWatched: 260,
        lessonsCompleted: 19,
      },
      {
        date: "2025-12-14",
        activeLearners: 6,
        minutesWatched: 285,
        lessonsCompleted: 22,
      },
    ],
    topLessons: [
      {
        _id: "l11",
        moduleTitle: "Module 1",
        lessonTitle: "Lesson 1 · JS Foundations",
        views: 88,
        avgWatchPct: 71,
        avgWatchMin: 10,
        dropOffPct: 19,
      },
      {
        _id: "l12",
        moduleTitle: "Module 2",
        lessonTitle: "Lesson 3 · Async Patterns",
        views: 64,
        avgWatchPct: 63,
        avgWatchMin: 12,
        dropOffPct: 27,
      },
      {
        _id: "l13",
        moduleTitle: "Module 3",
        lessonTitle: "Lesson 2 · Debugging",
        views: 59,
        avgWatchPct: 58,
        avgWatchMin: 8,
        dropOffPct: 33,
      },
    ],
  },
};

/* =========================
   Helpers
========================= */

const pct = (n: number) => `${Math.max(0, Math.min(100, Math.round(n)))}%`;
const mins = (n: number) => `${n} min`;

function clamp(n: number) {
  return Math.max(0, Math.min(100, n));
}

/* =========================
   Page
========================= */

export default function InstructorCourseAnalyticsPage() {
  const [loading, setLoading] = useState(true);

  const [courseId, setCourseId] = useState<string>(DEMO_COURSES[0]._id);
  const [range, setRange] = useState<RangeKey>("30d");

  // Later (API): const {data} = await apiRequest.get("/instructor/analytics/courses", { params: { courseId, range }})
  const data = useMemo(() => DEMO_ANALYTICS[courseId], [courseId, range]);

  // simulate fetch
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 180);
    return () => clearTimeout(t);
  }, [courseId, range]);

  const rollup = useMemo(() => {
    const totalMinutes = data.byDay.reduce((s, x) => s + x.minutesWatched, 0);
    const totalLessons = data.byDay.reduce((s, x) => s + x.lessonsCompleted, 0);
    const avgDailyActive = Math.round(
      data.byDay.reduce((s, x) => s + x.activeLearners, 0) /
        Math.max(1, data.byDay.length)
    );
    return { totalMinutes, totalLessons, avgDailyActive };
  }, [data.byDay]);

  return (
    <InstructorLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Course Analytics</h1>
          <p className="text-sm text-gray-500">
            Track enrollments, engagement, and lesson performance.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 w-full">
          <div className="w-full lg:max-w-lg">
            <label className="text-xs text-gray-500">Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            >
              {DEMO_COURSES.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="w-44">
            <label className="text-xs text-gray-500">Range</label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as any)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-10 text-center">
          <Loader2 className="h-6 w-6 animate-spin inline-block" />
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <KPI
              title="Enrollments"
              value={data.summary.enrollments.toString()}
              icon={<Users />}
            />
            <KPI
              title="Active Learners"
              value={data.summary.activeLearners.toString()}
              icon={<TrendingUp />}
            />
            <KPI
              title="Completion Rate"
              value={pct(data.summary.completionRatePct)}
              icon={<BarChart3 />}
            />
            <KPI
              title="Watch Time"
              value={mins(data.summary.minutesWatched)}
              icon={<Clock />}
            />
          </div>

          {/* Secondary cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4">
              <div className="text-sm text-gray-500">Avg Progress</div>
              <div className="mt-2 flex items-center gap-3">
                <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 dark:bg-white"
                    style={{ width: `${clamp(data.summary.avgProgressPct)}%` }}
                  />
                </div>
                <div className="font-semibold">
                  {pct(data.summary.avgProgressPct)}
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Avg watch time per learner:{" "}
                <span className="font-medium">
                  {mins(data.summary.avgWatchTimeMin)}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4">
              <div className="text-sm text-gray-500">Rating</div>
              <div className="mt-2 flex items-center gap-2">
                <Star className="h-4 w-4 text-gray-500" />
                <div className="text-xl font-semibold">
                  {data.summary.avgRating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">
                  ({data.summary.ratingCount})
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Higher ratings typically correlate with stronger completion.
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4">
              <div className="font-medium mb-2">Rollup (Range)</div>
              <div className="text-sm flex items-center justify-between">
                <span className="text-gray-500">Total minutes</span>
                <span className="font-medium">{rollup.totalMinutes}</span>
              </div>
              <div className="text-sm flex items-center justify-between mt-2">
                <span className="text-gray-500">Lessons completed</span>
                <span className="font-medium">{rollup.totalLessons}</span>
              </div>
              <div className="text-sm flex items-center justify-between mt-2">
                <span className="text-gray-500">Avg daily active</span>
                <span className="font-medium">{rollup.avgDailyActive}</span>
              </div>
            </div>
          </div>

          {/* Trend table */}
          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-100 dark:border-neutral-800 font-medium">
              Engagement Trend (Daily)
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-neutral-900 text-gray-500">
                <tr>
                  <th className="text-left p-3">Date</th>
                  <th className="text-right p-3">Active</th>
                  <th className="text-right p-3">Minutes Watched</th>
                  <th className="text-right p-3">Lessons Completed</th>
                </tr>
              </thead>
              <tbody>
                {data.byDay.map((d) => (
                  <tr
                    key={d.date}
                    className="border-t border-gray-100 dark:border-neutral-800"
                  >
                    <td className="p-3">{d.date}</td>
                    <td className="p-3 text-right font-medium">
                      {d.activeLearners}
                    </td>
                    <td className="p-3 text-right">{d.minutesWatched}</td>
                    <td className="p-3 text-right">{d.lessonsCompleted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top lessons */}
          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-neutral-800 font-medium">
              Top Lessons
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-neutral-900 text-gray-500">
                <tr>
                  <th className="text-left p-3">Lesson</th>
                  <th className="text-right p-3">Views</th>
                  <th className="text-right p-3">Avg Watch</th>
                  <th className="text-right p-3">Avg Minutes</th>
                  <th className="text-right p-3">Drop-off</th>
                </tr>
              </thead>
              <tbody>
                {data.topLessons.map((l) => (
                  <tr
                    key={l._id}
                    className="border-t border-gray-100 dark:border-neutral-800"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 dark:text-neutral-100 truncate">
                            {l.lessonTitle}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {l.moduleTitle}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 text-right font-medium">{l.views}</td>

                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <div className="w-24 h-2 rounded-full bg-gray-100 dark:bg-neutral-800 overflow-hidden">
                          <div
                            className="h-full bg-neutral-900 dark:bg-white"
                            style={{ width: `${clamp(l.avgWatchPct)}%` }}
                          />
                        </div>
                        <span className="font-medium">
                          {pct(l.avgWatchPct)}
                        </span>
                      </div>
                    </td>

                    <td className="p-3 text-right">{l.avgWatchMin} min</td>
                    <td className="p-3 text-right text-gray-700 dark:text-neutral-200 font-medium">
                      {pct(l.dropOffPct)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* API hint */}
          <div className="mt-4 text-xs text-gray-500">
            API-ready: replace demo data with{" "}
            <span className="font-mono">
              GET /instructor/analytics/courses?courseId=&range=
            </span>
          </div>
        </>
      )}
    </InstructorLayout>
  );
}

/* =========================
   Components
========================= */

function KPI({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className="text-xl font-semibold mt-1">{value}</div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
