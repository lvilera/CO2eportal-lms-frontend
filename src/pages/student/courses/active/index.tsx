import StudentLayout from "@/components/student/layout/StudentLayout";
import { BookOpen, Clock, PlayCircle, Search, TrendingUp } from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";

type ActiveCourse = {
  id: string;
  title: string;
  category: string;
  instructor: string;
  progress: number; // 0–100
  hoursStudied: number;
  totalHours: number;
  nextLessonTitle: string;
  thumbnailUrl?: string;
};

const MOCK_ACTIVE_COURSES: ActiveCourse[] = [
  {
    id: "1",
    title: "Net Zero Carbon Strategy for Business",
    category: "Sustainability · Intermediate",
    instructor: "Dr. Emma Collins",
    progress: 72,
    hoursStudied: 14,
    totalHours: 20,
    nextLessonTitle: "Module 4 · Scope 3 Emissions Deep Dive",
    thumbnailUrl: "/images/courses/net-zero.jpg",
  },
  {
    id: "2",
    title: "Modern React & TypeScript Fundamentals",
    category: "Development · Beginner",
    instructor: "John Miller",
    progress: 35,
    hoursStudied: 5,
    totalHours: 15,
    nextLessonTitle: "Hooks Basics & Best Practices",
    thumbnailUrl: "/images/courses/react-ts.jpg",
  },
  {
    id: "3",
    title: "Data Analytics for Business Leaders",
    category: "Analytics · Intermediate",
    instructor: "Sarah Khan",
    progress: 10,
    hoursStudied: 2,
    totalHours: 18,
    nextLessonTitle: "Reading Dashboards & KPIs",
    thumbnailUrl: "/images/courses/data-analytics.jpg",
  },
];

export default function StudentActiveCoursesPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"recent" | "progress">("recent");

  const filteredCourses = useMemo(() => {
    let list = [...MOCK_ACTIVE_COURSES];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.instructor.toLowerCase().includes(q)
      );
    }

    if (sort === "progress") {
      list.sort((a, b) => b.progress - a.progress);
    }

    return list;
  }, [search, sort]);

  return (
    <>
      <Head>
        <title>Active Courses · Student</title>
      </Head>
      <StudentLayout>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Active Courses
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Continue learning from your enrolled courses and track your
                progress in real time.
              </p>
            </div>

            {/* Search + Sort */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-300"
                />
              </div>

              <select
                value={sort}
                onChange={(e) =>
                  setSort(e.target.value as "recent" | "progress")
                }
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-300"
              >
                <option value="recent">Sort by: Recently started</option>
                <option value="progress">Sort by: Highest progress</option>
              </select>
            </div>
          </div>

          {/* Summary strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Active Courses</p>
                <p className="mt-1 text-xl font-semibold">
                  {MOCK_ACTIVE_COURSES.length}
                </p>
              </div>
              <BookOpen className="h-6 w-6 text-slate-400" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Hours Studied</p>
                <p className="mt-1 text-xl font-semibold">
                  {MOCK_ACTIVE_COURSES.reduce(
                    (sum, c) => sum + c.hoursStudied,
                    0
                  )}{" "}
                  hrs
                </p>
              </div>
              <Clock className="h-6 w-6 text-slate-400" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Avg. Completion</p>
                <p className="mt-1 text-xl font-semibold">
                  {Math.round(
                    MOCK_ACTIVE_COURSES.reduce(
                      (sum, c) => sum + c.progress,
                      0
                    ) / MOCK_ACTIVE_COURSES.length
                  )}
                  %
                </p>
              </div>
              <TrendingUp className="h-6 w-6 text-slate-400" />
            </div>
          </div>

          {/* Courses list */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
            {filteredCourses.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">
                No active courses match your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors p-4 flex flex-col gap-3"
                  >
                    <div className="flex gap-3">
                      {course.thumbnailUrl && (
                        <div className="hidden sm:block w-20 h-20 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={course.thumbnailUrl}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-500">
                          {course.category}
                        </p>
                        <h2 className="mt-1 text-sm font-semibold text-slate-900 line-clamp-2">
                          {course.title}
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                          Instructor:{" "}
                          <span className="font-medium">
                            {course.instructor}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Progress + meta */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-slate-900/90"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>
                          {course.hoursStudied} / {course.totalHours} hrs
                        </span>
                        <span className="truncate">
                          Next: {course.nextLessonTitle}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <Link
                        href={"/student/courses/play/123"}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800"
                      >
                        <PlayCircle className="h-4 w-4" />
                        Continue Course
                      </Link>
                      <button className="text-xs text-slate-600 hover:text-slate-900 underline-offset-2 hover:underline">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </StudentLayout>
    </>
  );
}
