// pages/admin/courses/[courseId]/modules/[moduleId]/quizzes/[quizId]/edit.tsx

import AdminLayout from "@/components/admin/layout/AdminLayout";
import apiRequest from "@/lib/axios";
import { Loader2, Save } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type QuizFormState = {
  title: string;
  instructions: string;
  timeLimitMinutes: number;
  attemptsAllowed: number;
  passMarkPercent: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  status: "draft" | "published" | "archived";
  availableFrom: string; // datetime-local
  availableUntil: string; // datetime-local
};

function isoToDatetimeLocal(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  // yyyy-MM-ddTHH:mm
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export default function EditQuiz() {
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

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<QuizFormState>({
    title: "",
    instructions: "",
    timeLimitMinutes: 10,
    attemptsAllowed: 3,
    passMarkPercent: 70,
    shuffleQuestions: true,
    shuffleOptions: true,
    status: "draft",
    availableFrom: "",
    availableUntil: "",
  });

  // -------- Load existing quiz --------
  useEffect(() => {
    if (!quizId) return;

    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const res = await apiRequest.get(`/quizzes/${quizId}`);
        const data = res.data;

        setForm({
          title: data.title || "",
          instructions: data.instructions || "",
          timeLimitMinutes: data.timeLimitSeconds
            ? Math.round(data.timeLimitSeconds / 60)
            : 0,
          attemptsAllowed:
            typeof data.attemptsAllowed === "number" ? data.attemptsAllowed : 0,
          passMarkPercent:
            typeof data.passMarkPercent === "number" ? data.passMarkPercent : 0,
          shuffleQuestions:
            typeof data.shuffleQuestions === "boolean"
              ? data.shuffleQuestions
              : true,
          shuffleOptions:
            typeof data.shuffleOptions === "boolean"
              ? data.shuffleOptions
              : true,
          status:
            data.status === "published" || data.status === "archived"
              ? data.status
              : "draft",
          availableFrom: isoToDatetimeLocal(data.availableFrom),
          availableUntil: isoToDatetimeLocal(data.availableUntil),
        });
      } catch (error) {
        // TODO: toast / error handling
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  // -------- Change handler --------
  const onChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // Checkbox handling
    if (type === "checkbox") {
      const input = e.target as HTMLInputElement;
      setForm((prev) => ({
        ...prev,
        [name]: input.checked,
      }));
      return;
    }

    // Numeric inputs
    if (
      name === "timeLimitMinutes" ||
      name === "attemptsAllowed" ||
      name === "passMarkPercent"
    ) {
      setForm((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
      return;
    }

    // Default text-based handling
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // -------- Submit handler --------
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!courseId || !moduleId || !quizId) {
      // TODO: toast / error message (missing IDs)
      return;
    }

    setSaving(true);
    try {
      await apiRequest.put(`/quizzes/${quizId}`, {
        title: form.title,
        instructions: form.instructions,
        courseId,
        moduleId,
        timeLimitSeconds: (form.timeLimitMinutes || 0) * 60,
        attemptsAllowed: form.attemptsAllowed || 0,
        passMarkPercent: form.passMarkPercent || 0,
        shuffleQuestions: form.shuffleQuestions,
        shuffleOptions: form.shuffleOptions,
        status: form.status,
        availableFrom: form.availableFrom
          ? new Date(form.availableFrom).toISOString()
          : null,
        availableUntil: form.availableUntil
          ? new Date(form.availableUntil).toISOString()
          : null,
      });

      router.push(`/admin/courses/${courseId}/modules`);
    } catch (error) {
      // TODO: toast / error handling
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (courseId && moduleId) {
      router.push(`/admin/courses/${courseId}/modules`);
    } else {
      router.push("/admin/courses");
    }
  };

  return (
    <>
      <Head>
        <title>Edit Quiz · Admin</title>
      </Head>
      <AdminLayout>
        {loading ? (
          <div className="max-w-4xl mx-auto flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="max-w-4xl mx-auto space-y-6 bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <h1 className="text-lg font-semibold">Edit Quiz</h1>
            </div>

            {/* Main fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={onChange}
                  required
                  placeholder="Module 1: Introduction Quiz"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Instructions */}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                  Instructions
                </label>
                <textarea
                  name="instructions"
                  rows={4}
                  value={form.instructions}
                  onChange={onChange}
                  placeholder="Please read each question carefully."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Time limit (minutes) */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  min={0}
                  name="timeLimitMinutes"
                  value={form.timeLimitMinutes}
                  onChange={onChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
                />
                <p className="text-xs text-gray-500 mt-1">
                  0 for no time limit. Stored as seconds on the backend.
                </p>
              </div>

              {/* Attempts allowed */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                  Attempts Allowed
                </label>
                <input
                  type="number"
                  min={0}
                  name="attemptsAllowed"
                  value={form.attemptsAllowed}
                  onChange={onChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
                />
                <p className="text-xs text-gray-500 mt-1">
                  0 can represent unlimited attempts, depending on your logic.
                </p>
              </div>

              {/* Pass mark percent */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                  Pass Mark (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  name="passMarkPercent"
                  value={form.passMarkPercent}
                  onChange={onChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={onChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-neutral-300">
                <input
                  type="checkbox"
                  name="shuffleQuestions"
                  checked={form.shuffleQuestions}
                  onChange={onChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/40"
                />
                Shuffle Questions
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-neutral-300">
                <input
                  type="checkbox"
                  name="shuffleOptions"
                  checked={form.shuffleOptions}
                  onChange={onChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/40"
                />
                Shuffle Options
              </label>
            </div>

            {/* Availability window */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                  Available From
                </label>
                <input
                  type="datetime-local"
                  name="availableFrom"
                  value={form.availableFrom}
                  onChange={onChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                  Available Until
                </label>
                <input
                  type="datetime-local"
                  name="availableUntil"
                  value={form.availableUntil}
                  onChange={onChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary border border-gray-200 dark:border-neutral-700 text-black hover:opacity-90 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </button>
            </div>
          </form>
        )}
      </AdminLayout>
    </>
  );
}
