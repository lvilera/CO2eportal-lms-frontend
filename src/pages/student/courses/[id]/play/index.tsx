// pages/student/courses/[id].tsx
import StudentLayout from "@/components/student/layout/StudentLayout";
import apiRequest from "@/lib/axios";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  PlayCircle,
  Video,
} from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

type Lesson = {
  id: string;
  title: string;
  durationMinutes?: number;
  isPreview?: boolean;
  isCompleted?: boolean;
  videoUrl?: string;
  type?: string; // "quiz" | "video" | etc.
};

type Module = {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
};

type CourseDetail = {
  id: string;
  title: string;
  category: string;
  level: string;
  instructor: string;
  totalHours: number;
  progress: number; // 0-100
  description: string;
  modules: Module[];
};

// --- API types based on your responses ---
type ApiCourse = {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  thumbnailUrl?: string;
  categoryId?:
    | {
        _id: string;
        title: string;
        slug: string;
        subtitle?: string;
      }
    | string;
  level?: string;
  language?: string;
  durationMinutes?: number;
  instructorId?:
    | {
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
      }
    | string;
};

type ApiModule = {
  _id: string;
  courseId: string | ApiCourse;
  title: string;
  description?: string;
  position?: number;
};

type ApiLesson = {
  id: string;
  title: string;
  createdAt: string;
  courseId: string;
  moduleId: string;
  type: string; // "quiz" | "video" | etc.
  // durationMinutes?: number;
  // videoUrl?: string;
};

export default function StudentCourseDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);

  // Fetch course + modules + lessons
  useEffect(() => {
    if (!router.isReady || !id) return;
    if (Array.isArray(id)) return;

    const courseId = id as string;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [courseRes, modulesRes, lessonsRes] = await Promise.all([
          apiRequest.get(`/courses/${courseId}`),
          apiRequest.get("/modules", { params: { courseId } }),
          apiRequest.get("/lessons/with-quiz", { params: { courseId } }),
        ]);

        const apiCourse: ApiCourse = courseRes.data;
        const apiModules: ApiModule[] = Array.isArray(modulesRes.data.items)
          ? modulesRes.data.items
          : [];
        const apiLessons: ApiLesson[] = Array.isArray(lessonsRes.data?.items)
          ? lessonsRes.data.items
          : [];

        // Group lessons by moduleId
        const lessonsByModule = new Map<string, Lesson[]>();
        for (const l of apiLessons) {
          const lesson: Lesson = {
            id: l.id,
            title: l.title,
            type: l.type,
            // durationMinutes: l.durationMinutes,
            // videoUrl: l.videoUrl,
            isPreview: false,
            isCompleted: false,
          };

          const existing = lessonsByModule.get(l.moduleId) ?? [];
          existing.push(lesson);
          lessonsByModule.set(l.moduleId, existing);
        }

        // Map modules with attached lessons
        const modules: Module[] = apiModules.map((m) => ({
          id: m._id,
          title: m.title,
          position: m.position ?? 0,
          lessons: lessonsByModule.get(m._id) ?? [],
        }));

        // Category
        const categoryTitle =
          typeof apiCourse.categoryId === "object" && apiCourse.categoryId
            ? apiCourse.categoryId.title
            : "Uncategorized";

        // Instructor
        let instructorName = "Unknown Instructor";
        if (
          apiCourse.instructorId &&
          typeof apiCourse.instructorId === "object"
        ) {
          const first = apiCourse.instructorId.firstName ?? "";
          const last = apiCourse.instructorId.lastName ?? "";
          const full = `${first} ${last}`.trim();
          instructorName =
            full || apiCourse.instructorId.email || "Unknown Instructor";
        }

        const totalMinutes = apiCourse.durationMinutes ?? 0;
        const totalHours =
          totalMinutes > 0 ? Math.max(1, Math.round(totalMinutes / 60)) : 0;

        const mappedCourse: CourseDetail = {
          id: apiCourse._id,
          title: apiCourse.title,
          category: categoryTitle,
          level: apiCourse.level ?? "Beginner",
          instructor: instructorName,
          totalHours,
          progress: 0, // TODO: replace with real progress
          description: apiCourse.description ?? "",
          modules,
        };

        setCourse(mappedCourse);
      } catch (err) {
        console.error("Failed to load course detail", err);
        setError("Failed to load course. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router.isReady]);

  const flatLessons: Lesson[] = useMemo(
    () => (course ? course.modules.flatMap((m) => m.lessons) : []),
    [course]
  );

  // Initialize current lesson when lessons change
  useEffect(() => {
    if (!currentLessonId && flatLessons.length > 0) {
      setCurrentLessonId(flatLessons[0].id);
    }
  }, [flatLessons, currentLessonId]);

  const currentLesson =
    flatLessons.find((l) => l.id === currentLessonId) ?? flatLessons[0];

  const handleLessonClick = (lessonId: string) => {
    setCurrentLessonId(lessonId);
  };

  return (
    <>
      <Head>
        <title>
          {course ? `${course.title} · Continue Course` : "Course · Continue"}
        </title>
      </Head>
      <StudentLayout>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white py-10 text-center text-sm text-slate-500">
              Loading course…
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 py-10 text-center text-sm text-red-600">
              {error}
            </div>
          ) : !course ? (
            <div className="rounded-xl border border-slate-200 bg-white py-10 text-center text-sm text-slate-500">
              Course not found.
            </div>
          ) : (
            <>
              {/* Breadcrumb + heading */}
              <div className="space-y-1">
                <button
                  onClick={() => router.push("/student/courses/active")}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  ← Back to Active Courses
                </button>
                <h1 className="text-2xl font-semibold text-slate-900">
                  {course.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {course.category}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5">
                    {course.level}
                  </span>
                  <span>Instructor: {course.instructor}</span>
                  <span>• {course.totalHours} hrs total</span>
                </div>
              </div>

              {/* Main layout: player + syllabus */}
              <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-6">
                {/* LEFT: Player + current lesson info */}
                <div className="space-y-4">
                  {/* Player card */}
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    <div className="aspect-video bg-slate-900 flex items-center justify-center">
                      {currentLesson?.videoUrl &&
                      currentLesson.type !== "quiz" ? (
                        <video
                          key={currentLesson.id}
                          src={currentLesson.videoUrl}
                          controls
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-slate-100 gap-2">
                          <Video className="h-10 w-10" />
                          <span className="text-xs text-slate-300">
                            {currentLesson?.type === "quiz"
                              ? "This is a quiz lesson. Open the quiz from the sidebar."
                              : "No video available for this lesson"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 border-t border-slate-100 space-y-2">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Current lesson
                      </p>
                      <h2 className="text-sm font-semibold text-slate-900">
                        {currentLesson?.title ?? "Select a lesson"}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        {currentLesson?.durationMinutes !== undefined && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {currentLesson.durationMinutes} min
                          </span>
                        )}
                        {currentLesson?.isPreview && (
                          <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-[10px]">
                            Preview
                          </span>
                        )}
                        {currentLesson?.isCompleted && (
                          <span className="inline-flex items-center gap-1 text-emerald-600">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                          </span>
                        )}
                      </div>

                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Course progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-slate-900"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        {currentLesson?.type === "quiz" ? (
                          <Link
                            href={`/student/courses/${course.id}/quiz/${currentLesson.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800"
                          >
                            <FileText className="h-4 w-4" />
                            Take Quiz
                          </Link>
                        ) : (
                          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800">
                            <PlayCircle className="h-4 w-4" />
                            Continue Lesson
                          </button>
                        )}
                        <button className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900">
                          <FileText className="h-3 w-3" />
                          View Resources
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Course overview */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">
                      Course Overview
                    </h3>
                    <p className="text-sm text-slate-600 whitespace-pre-line">
                      {course.description || "No description available."}
                    </p>
                  </div>
                </div>

                {/* RIGHT: Modules & lessons */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 max-h-[700px] overflow-y-auto">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Course Content
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {course.modules.length} modules • {flatLessons.length}{" "}
                      lessons
                    </p>
                  </div>

                  <div className="space-y-3">
                    {course.modules
                      .slice()
                      .sort((a, b) => a.position - b.position)
                      .map((mod) => (
                        <div
                          key={mod.id}
                          className="rounded-xl border border-slate-100 bg-slate-50/60"
                        >
                          <div className="px-3 py-2.5 flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-[11px] uppercase tracking-wide text-slate-400">
                                Module {mod.position}
                              </span>
                              <span className="text-xs font-semibold text-slate-900">
                                {mod.title}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {mod.lessons.length} lessons
                            </span>
                          </div>

                          <div className="border-t border-slate-100 divide-y divide-slate-100">
                            {mod.lessons.map((lesson, index) => {
                              const isActive = lesson.id === currentLessonId;
                              const isQuiz = lesson.type === "quiz";

                              return (
                                <button
                                  key={lesson.id}
                                  type="button"
                                  onClick={() => handleLessonClick(lesson.id)}
                                  className={`w-full px-3 py-2 flex items-center justify-between text-left text-xs ${
                                    isActive
                                      ? "bg-white"
                                      : "bg-transparent hover:bg-white/70"
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <div className="mt-0.5 text-[10px] text-slate-400 w-4 text-right">
                                      {index + 1}.
                                    </div>
                                    <div>
                                      <div
                                        className={`flex items-center gap-2 ${
                                          isActive
                                            ? "text-slate-900 font-semibold"
                                            : "text-slate-700"
                                        }`}
                                      >
                                        <span className="line-clamp-2">
                                          {lesson.title}
                                        </span>
                                        {lesson.isPreview && (
                                          <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 px-1.5 py-0.5 text-[9px]">
                                            Preview
                                          </span>
                                        )}
                                      </div>
                                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                                        {lesson.durationMinutes !==
                                          undefined && (
                                          <span>
                                            {lesson.durationMinutes} min
                                          </span>
                                        )}
                                        {lesson.isCompleted && (
                                          <span className="inline-flex items-center gap-1 text-emerald-600">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Done
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="ml-3 flex items-center">
                                    {isQuiz ? (
                                      <Link
                                        href={`/student/courses/${course.id}/quiz/${currentLesson.id}`}
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900 text-white text-[11px]"
                                      >
                                        <FileText className="h-3 w-3" />
                                        Take Quiz
                                      </Link>
                                    ) : isActive ? (
                                      <PlayCircle className="h-4 w-4 text-slate-900" />
                                    ) : lesson.isCompleted ? (
                                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                      <PlayCircle className="h-4 w-4 text-slate-400" />
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </StudentLayout>
    </>
  );
}
