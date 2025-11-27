// pages/admin/courses/[courseId]/modules/[moduleId]/quizzes/[quizId]/questions/index.tsx

import AdminLayout from "@/components/admin/layout/AdminLayout";
import apiRequest from "@/lib/axios";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

type QuestionType =
  | "single_choice"
  | "multiple_choice"
  | "true_false"
  | "short_answer";

type Difficulty = "easy" | "medium" | "hard";

type QuizQuestion = {
  _id?: string;
  id?: string;
  quizId: string;
  type: QuestionType;
  text: string;
  explanation?: string;
  points?: number;
  position?: number;
  timeLimitSeconds?: number;
  difficulty?: Difficulty;
  // ...any other fields from your backend
};
type Quiz = {
  title: string;
  instructions: string;
  timeLimitMinutes: number;
  attemptsAllowed: number;
  passMarkPercent: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  status: string;
  availableFrom: string;
  availableUntil: string;
};
export default function QuizQuestionsListPage() {
  const router = useRouter();
  const {
    courseId: queryCourseId,
    moduleId: queryModuleId,
    quizId: queryQuizId,
  } = router.query;

  const courseId = useMemo(
    () =>
      Array.isArray(queryCourseId) ? queryCourseId[0] : queryCourseId || "",
    [queryCourseId]
  );
  const moduleId = useMemo(
    () =>
      Array.isArray(queryModuleId) ? queryModuleId[0] : queryModuleId || "",
    [queryModuleId]
  );
  const quizId = useMemo(
    () => (Array.isArray(queryQuizId) ? queryQuizId[0] : queryQuizId || ""),
    [queryQuizId]
  );

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quiz, setQuiz] = useState<any>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ------- Load questions -------
  useEffect(() => {
    if (!quizId) return;

    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const res = await apiRequest.get(`/quizzes/${quizId}`);

        setQuiz(res?.data);
      } catch (error) {
        // TODO: toast / error handling
      } finally {
        setLoading(false);
      }
    };
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await apiRequest.get(`/quizzes/${quizId}/questions`);

        const items: QuizQuestion[] = Array.isArray(res.data)
          ? res.data
          : res.data?.items || [];

        // Sort by position ASC, fallback to created order
        items.sort((a, b) => {
          const ap = typeof a.position === "number" ? a.position : 99999;
          const bp = typeof b.position === "number" ? b.position : 99999;
          return ap - bp;
        });

        setQuestions(items);
      } catch (error) {
        // TODO: toast / error handling
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
    fetchQuestions();
  }, [quizId]);

  const getId = (q: QuizQuestion) => q._id || q.id || "";

  // ------- Actions -------
  const handleCreate = () => {
    if (!courseId || !moduleId || !quizId) return;
    router.push(
      `/admin/courses/${courseId}/modules/${moduleId}/quizzes/${quizId}/questions/new`
    );
  };

  const handleEdit = (questionId: string) => {
    if (!courseId || !moduleId || !quizId) return;
    router.push(
      `/admin/courses/${courseId}/modules/${moduleId}/quizzes/${quizId}/questions/${questionId}/edit`
    );
  };

  const handleDelete = async (questionId: string) => {
    if (!questionId) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );
    if (!confirmed) return;

    try {
      setDeletingId(questionId);
      await apiRequest.delete(`/quizzes/questions/${questionId}`);
      setQuestions((prev) => prev.filter((q) => getId(q) !== questionId));
    } catch (error) {
      // TODO: toast / error handling
    } finally {
      setDeletingId(null);
    }
  };

  const handleBackToModules = () => {
    if (courseId) {
      router.push(`/admin/courses/${courseId}/modules`);
    } else {
      router.push("/admin/courses");
    }
  };

  return (
    <>
      <Head>
        <title>Quiz Questions · Admin</title>
      </Head>
      <AdminLayout>
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold">Quiz Questions</h1>
              <p className="text-xs text-gray-500 mt-1">
                Manage questions for this quiz. You can reorder via
                <span className="font-medium"> position</span>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBackToModules}
                className="px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800"
              >
                Back to Modules
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-3 py-2 text-xs rounded-lg bg-primary border border-gray-200 dark:border-neutral-700 text-black hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                New Question
              </button>
            </div>
          </div>

          {/* Meta line */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-600 dark:text-neutral-400">
            <div>
              <span className="block text-[11px] uppercase tracking-wide font-semibold mb-1">
                Course
              </span>
              <div className="px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 truncate">
                {quiz?.courseId?.title || "—"}
              </div>
            </div>
            <div>
              <span className="block text-[11px] uppercase tracking-wide font-semibold mb-1">
                Module
              </span>
              <div className="px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 truncate">
                {quiz?.moduleId?.title || "—"}
              </div>
            </div>
            <div>
              <span className="block text-[11px] uppercase tracking-wide font-semibold mb-1">
                Quiz
              </span>
              <div className="px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 truncate">
                {quiz?.title || "—"}
              </div>
            </div>
          </div>

          {/* Table / list */}
          <div className="bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            ) : questions.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500">
                No questions yet.{" "}
                <button
                  type="button"
                  onClick={handleCreate}
                  className="text-primary underline"
                >
                  Create the first question
                </button>
                .
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/60">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-neutral-400">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-neutral-400">
                        Question
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-neutral-400">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-neutral-400">
                        Difficulty
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-neutral-400">
                        Points
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-neutral-400">
                        Position
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-neutral-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions?.map((q: QuizQuestion, idx) => {
                      const id = getId(q);
                      const difficultyLabel = q.difficulty
                        ? q.difficulty.charAt(0).toUpperCase() +
                          q.difficulty.slice(1)
                        : "—";
                      const typeLabel =
                        q.type === "single_choice"
                          ? "Single choice"
                          : q.type === "multiple_choice"
                          ? "Multiple choice"
                          : q.type === "true_false"
                          ? "True / False"
                          : "Short answer";

                      return (
                        <tr
                          key={id || idx}
                          className="border-t border-gray-100 dark:border-neutral-800 hover:bg-gray-50/60 dark:hover:bg-neutral-900/60"
                        >
                          <td className="px-4 py-3 align-top text-xs text-gray-500">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="text-sm text-gray-900 dark:text-neutral-100 line-clamp-2">
                              {q.text}
                            </div>
                            {q.explanation && (
                              <div className="text-xs text-gray-500 dark:text-neutral-400 mt-1 line-clamp-1">
                                {q.explanation}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 align-top text-xs text-gray-700 dark:text-neutral-300">
                            {typeLabel}
                          </td>
                          <td className="px-4 py-3 align-top text-xs text-gray-700 dark:text-neutral-300">
                            {difficultyLabel}
                          </td>
                          <td className="px-4 py-3 align-top text-xs text-gray-700 dark:text-neutral-300">
                            {typeof q.points === "number" ? q.points : "—"}
                          </td>
                          <td className="px-4 py-3 align-top text-xs text-gray-700 dark:text-neutral-300">
                            {typeof q.position === "number" ? q.position : "—"}
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => id && handleEdit(id)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-gray-200 dark:border-neutral-700 text-xs hover:bg-gray-50 dark:hover:bg-neutral-800"
                              >
                                <Pencil className="h-3 w-3" />
                                Edit
                              </button>
                              <button
                                type="button"
                                disabled={deletingId === id || !id}
                                onClick={() => id && handleDelete(id)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-red-100 text-red-600 hover:bg-red-50 disabled:opacity-60 dark:border-red-900/60 dark:hover:bg-red-950/40"
                              >
                                {deletingId === id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
