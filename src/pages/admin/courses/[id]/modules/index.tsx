import AdminLayout from "@/components/admin/layout/AdminLayout";
import apiRequest from "@/lib/axios";
import { Loader2, Pencil, PlusCircle, Trash2 } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type CourseCategory = {
  _id: string;
  title: string;
};

type Course = {
  _id: string;
  title: string;
  category?: CourseCategory | string;
};

type Module = {
  _id: string;
  title: string;
  description?: string;
  position?: number;
};

type LessonVideo = {
  url?: string;
  durationSeconds?: number;
};

type Lesson = {
  _id: string;
  title: string;
  slug?: string;
  position?: number;
  isPreview?: boolean;
  type?: string; // e.g. "video", "quiz" etc if your API returns it
  video?: LessonVideo;
};

export default function CourseModulesPage() {
  const router = useRouter();
  const { id } = router.query; // courseId from /admin/courses/[id]/modules

  const courseId = Array.isArray(id) ? id[0] : id;

  const [course, setCourse] = useState<Course | null>(null);

  const [loadingModules, setLoadingModules] = useState(true);
  const [modules, setModules] = useState<Module[]>([]);

  const [loadingLessons, setLoadingLessons] = useState(false);
  const [lessonsByModule, setLessonsByModule] = useState<
    Record<string, Lesson[]>
  >({});

  const [deletingModuleId, setDeletingModuleId] = useState<string | null>(null);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchModulesAndLessons = async () => {
      setLoadingModules(true);
      try {
        // Fetch course (for title + category)
        const [courseRes, modulesRes] = await Promise.all([
          apiRequest.get<Course>(`/courses/${courseId}`),
          apiRequest.get<any>("/modules", {
            params: {
              courseId,
              page: -1,
            },
          }),
        ]);

        setCourse(courseRes.data);

        const items: Module[] = modulesRes.data?.items || modulesRes.data || [];
        setModules(items);

        // Fetch lessons for each module
        if (items.length > 0) {
          setLoadingLessons(true);
          const lessonsMap: Record<string, Lesson[]> = {};

          await Promise.all(
            items.map(async (mod) => {
              try {
                const lr = await apiRequest.get<any>("/lessons", {
                  params: {
                    courseId,
                    moduleId: mod._id,
                    page: -1,
                    limit: 50,
                  },
                });
                const lessons: Lesson[] = lr.data?.items || lr.data || [];
                lessonsMap[mod._id] = lessons;
              } catch {
                lessonsMap[mod._id] = [];
              }
            })
          );

          setLessonsByModule(lessonsMap);
        } else {
          setLessonsByModule({});
        }
      } catch (err) {
        setCourse(null);
        setModules([]);
        setLessonsByModule({});
      } finally {
        setLoadingModules(false);
        setLoadingLessons(false);
      }
    };

    fetchModulesAndLessons();
  }, [courseId]);

  const goBack = () => {
    router.push("/admin/courses");
  };

  const goCreateModule = () => {
    if (!courseId) return;
    router.push(`/admin/courses/${courseId}/modules/new`);
  };

  const goEditModule = (moduleId: string) => {
    if (!courseId) return;
    router.push(`/admin/courses/${courseId}/modules/${moduleId}/edit`);
  };

  const deleteModule = async (moduleId: string) => {
    if (!window.confirm("Are you sure you want to delete this module?")) return;

    try {
      setDeletingModuleId(moduleId);
      await apiRequest.delete(`/modules/${moduleId}`);

      setModules((prev) => prev.filter((m) => m._id !== moduleId));
      setLessonsByModule((prev) => {
        const copy = { ...prev };
        delete copy[moduleId];
        return copy;
      });
    } catch (err) {
      // TODO: toast
    } finally {
      setDeletingModuleId(null);
    }
  };

  const goCreateLesson = (moduleId: string) => {
    if (!courseId) return;
    router.push(`/admin/courses/${courseId}/modules/${moduleId}/lessons/new`);
  };

  const goEditLesson = (moduleId: string, lessonId: string) => {
    if (!courseId) return;
    router.push(
      `/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/edit`
    );
  };

  const deleteLesson = async (moduleId: string, lessonId: string) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;

    try {
      setDeletingLessonId(lessonId);
      await apiRequest.delete(`/lessons/${lessonId}`);

      setLessonsByModule((prev) => ({
        ...prev,
        [moduleId]: (prev[moduleId] || []).filter((l) => l._id !== lessonId),
      }));
    } catch (err) {
      // TODO: toast
    } finally {
      setDeletingLessonId(null);
    }
  };

  const renderCourseMeta = () => {
    if (!course) return null;

    let categoryLabel = "";
    if (typeof course.category === "string") {
      categoryLabel = course.category;
    } else if (course.category?.title) {
      categoryLabel = course.category.title;
    }

    return (
      <div className="mt-1 text-sm text-gray-600 dark:text-neutral-300">
        <span className="font-medium">{course.title}</span>
        {categoryLabel && (
          <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 px-2 py-0.5 text-xs">
            {categoryLabel}
          </span>
        )}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Modules · Admin</title>
      </Head>
      <AdminLayout>
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <button
                onClick={goBack}
                className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ← Back to Courses
              </button>
              <h1 className="mt-2 text-2xl font-semibold">Course Modules</h1>
              {renderCourseMeta()}
            </div>
            <button
              onClick={goCreateModule}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary border border-gray-200 dark:border-neutral-700 text-black hover:opacity-90"
            >
              <PlusCircle className="h-4 w-4" />
              New Module
            </button>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4">
            {loadingModules ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : modules.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-neutral-400">
                No modules found for this course.
              </p>
            ) : (
              <ul className="space-y-3">
                {modules
                  .slice()
                  .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                  .map((mod) => {
                    const lessons = lessonsByModule[mod._id] || [];
                    const isDeletingThisModule = deletingModuleId === mod._id;

                    return (
                      <li
                        key={mod._id}
                        className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 px-4 py-3"
                      >
                        {/* Module header */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h2 className="text-sm font-semibold">
                              {mod.title}
                            </h2>
                            {mod.description && (
                              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1 whitespace-pre-line">
                                {mod.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {mod.position !== undefined && (
                              <span className="text-xs text-gray-500 dark:text-neutral-400 mr-2">
                                #{mod.position}
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => goCreateLesson(mod._id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-primary/90 text-black hover:opacity-90"
                            >
                              <PlusCircle className="h-3 w-3" />
                              Lesson
                            </button>

                            <button
                              type="button"
                              onClick={() => goEditModule(mod._id)}
                              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700"
                            >
                              <Pencil className="h-3 w-3" />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteModule(mod._id)}
                              disabled={isDeletingThisModule}
                              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/40 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900 disabled:opacity-60"
                            >
                              {isDeletingThisModule ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Lessons list */}
                        <div className="mt-3 border-t border-gray-200 dark:border-neutral-800 pt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-600 dark:text-neutral-300">
                              Lessons
                            </span>
                            {loadingLessons && (
                              <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                            )}
                          </div>

                          {lessons.length === 0 ? (
                            <p className="text-xs text-gray-500 dark:text-neutral-400">
                              No lessons for this module.
                            </p>
                          ) : (
                            <ul className="space-y-1">
                              {lessons
                                .slice()
                                .sort(
                                  (a, b) =>
                                    (a.position ?? 0) - (b.position ?? 0)
                                )
                                .map((lesson) => {
                                  const isDeletingThisLesson =
                                    deletingLessonId === lesson._id;

                                  const typeLabel =
                                    lesson.type ||
                                    (lesson.video?.url ? "Video" : undefined);

                                  const duration =
                                    lesson.video?.durationSeconds;

                                  return (
                                    <li
                                      key={lesson._id}
                                      className="flex items-center justify-between text-xs rounded-lg bg-white/70 dark:bg-neutral-800 px-3 py-2"
                                    >
                                      <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">
                                            {lesson.title}
                                          </span>
                                          {lesson.isPreview && (
                                            <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200 px-2 py-0.5 text-[10px]">
                                              Preview
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500 dark:text-neutral-400">
                                          {lesson.slug && (
                                            <span>Slug: {lesson.slug}</span>
                                          )}
                                          {typeLabel && (
                                            <span>Type: {typeLabel}</span>
                                          )}
                                          {duration !== undefined &&
                                            duration > 0 && (
                                              <span>Duration: {duration}s</span>
                                            )}
                                          {lesson.position !== undefined && (
                                            <span>Pos: #{lesson.position}</span>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            goEditLesson(mod._id, lesson._id)
                                          }
                                          className="inline-flex items-center justify-center rounded-md border border-gray-200 dark:border-neutral-700 bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-700 h-6 w-6"
                                        >
                                          <Pencil className="h-3 w-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            deleteLesson(mod._id, lesson._id)
                                          }
                                          disabled={isDeletingThisLesson}
                                          className="inline-flex items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/40 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900 h-6 w-6 disabled:opacity-60"
                                        >
                                          {isDeletingThisLesson ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                          ) : (
                                            <Trash2 className="h-3 w-3" />
                                          )}
                                        </button>
                                      </div>
                                    </li>
                                  );
                                })}
                            </ul>
                          )}
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
