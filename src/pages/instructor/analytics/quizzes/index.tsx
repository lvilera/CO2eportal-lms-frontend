import InstructorLayout from "@/components/instructor/layout/InstructorLayout";
import {
  BarChart3,
  BookOpen,
  Clock,
  HelpCircle,
  Loader2,
  Target,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

/* =========================
   Types (API-friendly)
========================= */

type RangeKey = "7d" | "30d" | "90d";

type CourseLite = {
  _id: string;
  title: string;
};

type QuizRow = {
  _id: string;
  title: string;
  moduleTitle?: string;

  attempts: number;
  avgScorePct: number; // 0-100
  passRatePct: number; // 0-100
  avgDurationMin: number;

  lastAttemptAt?: string;
};

type HardQuestionRow = {
  _id: string;
  quizId: string;
  quizTitle: string;

  questionText: string;
  correctRatePct: number; // 0-100
  avgTimeSec: number;
  commonWrong?: string;
};

type QuizAnalyticsResp = {
  course: CourseLite;

  summary: {
    attempts: number;
    avgScorePct: number;
    passRatePct: number;
    avgDurationMin: number;
  };

  quizzes: QuizRow[];
  hardestQuestions: HardQuestionRow[];
};

/* =========================
   Demo data (replace later)
========================= */

const DEMO_COURSES: CourseLite[] = [
  { _id: "c1", title: "Web Development Course 01" },
  { _id: "c2", title: "Modern JavaScript Mastery" },
];

const DEMO_QUIZ_ANALYTICS: Record<string, QuizAnalyticsResp> = {
  c1: {
    course: DEMO_COURSES[0],
    summary: {
      attempts: 214,
      avgScorePct: 72,
      passRatePct: 61,
      avgDurationMin: 9,
    },
    quizzes: [
      {
        _id: "q1",
        title: "HTML Basics Quiz",
        moduleTitle: "Module 1",
        attempts: 92,
        avgScorePct: 74,
        passRatePct: 64,
        avgDurationMin: 8,
        lastAttemptAt: "2025-12-14T01:10:00.000Z",
      },
      {
        _id: "q2",
        title: "CSS Layout Quiz",
        moduleTitle: "Module 2",
        attempts: 71,
        avgScorePct: 69,
        passRatePct: 58,
        avgDurationMin: 10,
        lastAttemptAt: "2025-12-13T20:02:00.000Z",
      },
      {
        _id: "q3",
        title: "Tailwind Utility Quiz",
        moduleTitle: "Module 3",
        attempts: 51,
        avgScorePct: 72,
        passRatePct: 60,
        avgDurationMin: 9,
        lastAttemptAt: "2025-12-12T18:45:00.000Z",
      },
    ],
    hardestQuestions: [
      {
        _id: "hq1",
        quizId: "q2",
        quizTitle: "CSS Layout Quiz",
        questionText: "Which CSS property is used to control stacking order?",
        correctRatePct: 41,
        avgTimeSec: 38,
        commonWrong: "display",
      },
      {
        _id: "hq2",
        quizId: "q1",
        quizTitle: "HTML Basics Quiz",
        questionText: "Which tag is semantic for main page navigation?",
        correctRatePct: 46,
        avgTimeSec: 31,
        commonWrong: "<section>",
      },
      {
        _id: "hq3",
        quizId: "q3",
        quizTitle: "Tailwind Utility Quiz",
        questionText: "Which class applies a medium font weight?",
        correctRatePct: 49,
        avgTimeSec: 27,
        commonWrong: "font-semibold",
      },
    ],
  },

  c2: {
    course: DEMO_COURSES[1],
    summary: {
      attempts: 187,
      avgScorePct: 76,
      passRatePct: 67,
      avgDurationMin: 11,
    },
    quizzes: [
      {
        _id: "q11",
        title: "JS Foundations Quiz",
        moduleTitle: "Module 1",
        attempts: 86,
        avgScorePct: 78,
        passRatePct: 70,
        avgDurationMin: 10,
        lastAttemptAt: "2025-12-14T00:40:00.000Z",
      },
      {
        _id: "q12",
        title: "Async & Promises Quiz",
        moduleTitle: "Module 2",
        attempts: 59,
        avgScorePct: 73,
        passRatePct: 63,
        avgDurationMin: 12,
        lastAttemptAt: "2025-12-13T19:33:00.000Z",
      },
      {
        _id: "q13",
        title: "Debugging & Tools Quiz",
        moduleTitle: "Module 3",
        attempts: 42,
        avgScorePct: 76,
        passRatePct: 66,
        avgDurationMin: 11,
        lastAttemptAt: "2025-12-12T15:00:00.000Z",
      },
    ],
    hardestQuestions: [
      {
        _id: "hq11",
        quizId: "q12",
        quizTitle: "Async & Promises Quiz",
        questionText: "What does Promise.all() return if one promise rejects?",
        correctRatePct: 44,
        avgTimeSec: 42,
        commonWrong: "It returns partial results",
      },
      {
        _id: "hq12",
        quizId: "q11",
        quizTitle: "JS Foundations Quiz",
        questionText: "What is the output type of typeof null?",
        correctRatePct: 39,
        avgTimeSec: 35,
        commonWrong: "null",
      },
      {
        _id: "hq13",
        quizId: "q13",
        quizTitle: "Debugging & Tools Quiz",
        questionText:
          "Which tool helps you inspect network requests in the browser?",
        correctRatePct: 52,
        avgTimeSec: 24,
        commonWrong: "Elements tab",
      },
    ],
  },
};

/* =========================
   Helpers
========================= */

const pct = (n: number) => `${Math.max(0, Math.min(100, Math.round(n)))}%`;

function fmt(dt?: string) {
  if (!dt) return "-";
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return "-";
  }
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, n));
}

/* =========================
   Page
========================= */

export default function InstructorQuizPerformancePage() {
  const [loading, setLoading] = useState(true);

  const [courseId, setCourseId] = useState<string>(DEMO_COURSES[0]._id);
  const [range, setRange] = useState<RangeKey>("30d");

  // Later (API): GET /instructor/analytics/quizzes?courseId=&range=
  const data = useMemo(() => DEMO_QUIZ_ANALYTICS[courseId], [courseId, range]);

  // simulate fetch
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 180);
    return () => clearTimeout(t);
  }, [courseId, range]);

  return (
    <InstructorLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Quiz Performance</h1>
          <p className="text-sm text-gray-500">
            Track quiz attempts, pass rate, and identify questions causing
            drop-offs.
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
              title="Total Attempts"
              value={data.summary.attempts.toString()}
              icon={<TrendingUp />}
            />
            <KPI
              title="Avg Score"
              value={pct(data.summary.avgScorePct)}
              icon={<BarChart3 />}
            />
            <KPI
              title="Pass Rate"
              value={pct(data.summary.passRatePct)}
              icon={<Target />}
            />
            <KPI
              title="Avg Duration"
              value={`${data.summary.avgDurationMin} min`}
              icon={<Clock />}
            />
          </div>

          {/* Quizzes table */}
          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-100 dark:border-neutral-800 font-medium">
              Quizzes
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-neutral-900 text-gray-500">
                <tr>
                  <th className="text-left p-3">Quiz</th>
                  <th className="text-right p-3">Attempts</th>
                  <th className="text-right p-3">Avg Score</th>
                  <th className="text-right p-3">Pass Rate</th>
                  <th className="text-right p-3">Avg Duration</th>
                  <th className="text-right p-3">Last Attempt</th>
                </tr>
              </thead>
              <tbody>
                {data.quizzes.map((qz) => (
                  <tr
                    key={qz._id}
                    className="border-t border-gray-100 dark:border-neutral-800"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 dark:text-neutral-100 truncate">
                            {qz.title}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {qz.moduleTitle || "—"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 text-right font-medium">
                      {qz.attempts}
                    </td>

                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <div className="w-24 h-2 rounded-full bg-gray-100 dark:bg-neutral-800 overflow-hidden">
                          <div
                            className="h-full bg-neutral-900 dark:bg-white"
                            style={{ width: `${clamp(qz.avgScorePct)}%` }}
                          />
                        </div>
                        <span className="font-medium">
                          {pct(qz.avgScorePct)}
                        </span>
                      </div>
                    </td>

                    <td className="p-3 text-right font-medium">
                      {pct(qz.passRatePct)}
                    </td>
                    <td className="p-3 text-right">{qz.avgDurationMin} min</td>
                    <td className="p-3 text-right text-gray-600 dark:text-neutral-300">
                      {fmt(qz.lastAttemptAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Hardest Questions */}
          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-neutral-800 font-medium">
              Hardest Questions
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-neutral-900 text-gray-500">
                <tr>
                  <th className="text-left p-3">Question</th>
                  <th className="text-left p-3">Quiz</th>
                  <th className="text-right p-3">Correct Rate</th>
                  <th className="text-right p-3">Avg Time</th>
                  <th className="text-left p-3">Common Wrong</th>
                </tr>
              </thead>
              <tbody>
                {data.hardestQuestions.map((hq) => (
                  <tr
                    key={hq._id}
                    className="border-t border-gray-100 dark:border-neutral-800"
                  >
                    <td className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mt-0.5">
                          <HelpCircle className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 dark:text-neutral-100">
                            {hq.questionText}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 text-gray-700 dark:text-neutral-200">
                      {hq.quizTitle}
                    </td>

                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <div className="w-24 h-2 rounded-full bg-gray-100 dark:bg-neutral-800 overflow-hidden">
                          <div
                            className="h-full bg-neutral-900 dark:bg-white"
                            style={{ width: `${clamp(hq.correctRatePct)}%` }}
                          />
                        </div>
                        <span className="font-medium">
                          {pct(hq.correctRatePct)}
                        </span>
                      </div>
                    </td>

                    <td className="p-3 text-right">{hq.avgTimeSec}s</td>

                    <td className="p-3 text-gray-600 dark:text-neutral-300">
                      {hq.commonWrong || "-"}
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
              GET /instructor/analytics/quizzes?courseId=&range=
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
