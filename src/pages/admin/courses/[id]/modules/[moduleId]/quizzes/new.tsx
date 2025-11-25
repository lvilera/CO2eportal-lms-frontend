// pages/admin/courses/[id]/modules/[moduleId]/quizzes/index.tsx
import AdminLayout from "@/components/admin/layout/AdminLayout";
import apiRequest from "@/lib/axios";
import { ListChecks, Loader2, Pencil, PlusCircle, Trash2 } from "lucide-react";
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

type Quiz = {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  questionsCount?: number;
  passScore?: number; // e.g. 70 (%)
  position?: number;
  isPublished?: boolean;
};

export default function ModuleQuizzesPage() {
  const router = useRouter();
  const { id, moduleId } = router.query;

  const courseId = Array.isArray(id) ? id[0] : id;
  const currentModuleId = Array.isArray(moduleId) ? moduleId[0] : moduleId;

  const [course, setCourse] = useState<Course | null>(null);
  const [module, setModule] = useState<Module | null>(null);

  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId || !currentModuleId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [courseRes, moduleRes, quizRes] = await Promise.all([
          apiRequest.get<Course>(`/courses/${courseId}`),
          apiRequest.get<Module>(`/modules/${currentModuleId}`),
          apiRequest.get<any>("/quizzes", {
            params: {
              courseId,
              moduleId: currentModuleId,
              page: -1,
              limit: 100,
            },
          }),
        ]);

        setCourse(courseRes.data);
        setModule(moduleRes.data);

        const items: Quiz[] = quizRes.data?.items || quizRes.data || [];
        setQuizzes(items);
      } catch (error) {
        setCourse(null);
        setModule(null);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, currentModuleId]);

  const goBackToModules = () => {
    if (!courseId) return;
    router.push(`/admin/courses/${courseId}/modules`);
  };

  const goCreateQuiz = () => {
    if (!courseId || !currentModuleId) return;
    router.push(
      `/admin/courses/${courseId}/modules/${currentModuleId}/quizzes/new`
    );
  };

  const goEditQuiz = (quizId: string) => {
    if (!courseId || !currentModuleId) return;
    router.push(
      `/admin/courses/${courseId}/modules/${currentModuleId}/quizzes/${quizId}/edit`
    );
  };

  const goManageQuestions = (quizId: string) => {
    if (!courseId || !currentModuleId) return;
    router.push(
      `/admin/courses/${courseId}/modules/${currentModuleId}/quizzes/${quizId}/questions`
    );
  };

  const deleteQuiz = async (quizId: string) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      setDeletingQuizId(quizId);
      await apiRequest.delete(`/quizzes/${quizId}`);
      setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
    } catch (error) {
      // TODO: toast
    } finally {
      setDeletingQuizId(null);
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

  const renderModuleMeta = () => {
    if (!module) return null;
    return (
      <div className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
        <span className="font-medium">Module:</span> <span>{module.title}</span>
        {module.position !== undefined && (
          <span className="ml-2 text-[11px] text-gray-400">
            (Position #{module.position})
          </span>
        )}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Quizzes · Admin</title>
      </Head>
      <AdminLayout>
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <button
                onClick={goBackToModules}
                className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ← Back to Modules
              </button>
              <h1 className="mt-2 text-2xl font-semibold flex items-center gap-2">
                <ListChecks className="h-5 w-5" />
                Module Quizzes
              </h1>
              {renderCourseMeta()}
              {renderModuleMeta()}
            </div>

            <button
              onClick={goCreateQuiz}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary border border-gray-200 dark:border-neutral-700 text-black hover:opacity-90"
            >
              <PlusCircle className="h-4 w-4" />
              New Quiz
            </button>
          </div>

          {/* List card */}
          <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : quizzes.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-neutral-400">
                No quizzes found for this module.
              </p>
            ) : (
              <ul className="space-y-3">
                {quizzes
                  .slice()
                  .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                  .map((quiz) => {
                    const isDeleting = deletingQuizId === quiz._id;

                    return (
                      <li
                        key={quiz._id}
                        className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 px-4 py-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h2 className="text-sm font-semibold">
                                {quiz.title}
                              </h2>
                              {quiz.isPublished && (
                                <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 px-2 py-0.5 text-[10px]">
                                  Published
                                </span>
                              )}
                            </div>

                            {quiz.description && (
                              <p className="text-xs text-gray-500 dark:text-neutral-400 whitespace-pre-line">
                                {quiz.description}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500 dark:text-neutral-400">
                              {quiz.slug && <span>Slug: {quiz.slug}</span>}
                              {quiz.questionsCount !== undefined && (
                                <span>Questions: {quiz.questionsCount}</span>
                              )}
                              {quiz.passScore !== undefined && (
                                <span>Pass score: {quiz.passScore}%</span>
                              )}
                              {quiz.position !== undefined && (
                                <span>Position: #{quiz.position}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => goManageQuestions(quiz._id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-primary/90 text-black hover:opacity-90"
                            >
                              <ListChecks className="h-3 w-3" />
                              Questions
                            </button>

                            <button
                              type="button"
                              onClick={() => goEditQuiz(quiz._id)}
                              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700"
                            >
                              <Pencil className="h-3 w-3" />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteQuiz(quiz._id)}
                              disabled={isDeleting}
                              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/40 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900 disabled:opacity-60"
                            >
                              {isDeleting ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                              Delete
                            </button>
                          </div>
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
