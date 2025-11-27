// pages/admin/courses/[courseId]/modules/[moduleId]/quizzes/[quizId]/questions/new.tsx

import AdminLayout from "@/components/admin/layout/AdminLayout";
import apiRequest from "@/lib/axios";
import { Loader2, Save } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";

type QuestionType =
  | "single_choice"
  | "multiple_choice"
  | "true_false"
  | "short_answer";

type Difficulty = "easy" | "medium" | "hard";

type QuestionOption = {
  text: string;
  isCorrect: boolean;
  explanation: string;
};

type QuestionFormState = {
  type: QuestionType;
  text: string;
  explanation: string;
  options: QuestionOption[];
  answerText: string;
  points: number;
  position: number;
  timeLimitSeconds: number;
  difficulty: Difficulty;
};

export default function NewQuestionPage() {
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

  const [form, setForm] = useState<QuestionFormState>({
    type: "single_choice",
    text: "",
    explanation: "",
    options: [
      {
        text: "",
        isCorrect: true,
        explanation: "",
      },
    ],
    answerText: "",
    points: 5,
    position: 1,
    timeLimitSeconds: 60,
    difficulty: "medium",
  });

  // ---------- Generic onChange for non-option fields ----------
  const onChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // Question type change
    if (name === "type") {
      const newType = value as QuestionType;
      setForm((prev) => {
        let options = prev.options;

        // For true/false, auto-setup two options
        if (newType === "true_false") {
          options = [
            { text: "True", isCorrect: true, explanation: "" },
            { text: "False", isCorrect: false, explanation: "" },
          ];
        }

        // For short_answer, options are not needed
        if (newType === "short_answer") {
          options = [];
        }

        // For single/multiple choice and we had no options, create one empty
        if (
          (newType === "single_choice" || newType === "multiple_choice") &&
          options.length === 0
        ) {
          options = [{ text: "", isCorrect: true, explanation: "" }];
        }

        return {
          ...prev,
          type: newType,
          options,
        };
      });
      return;
    }

    // Checkbox fields (none here except options; kept pattern for extensibility)
    if (type === "checkbox") {
      const input = e.target as HTMLInputElement;
      setForm((prev) => ({
        ...prev,
        [name]: input.checked,
      }));
      return;
    }

    // Numeric fields
    if (
      name === "points" ||
      name === "position" ||
      name === "timeLimitSeconds"
    ) {
      setForm((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
      return;
    }

    // Default text fields
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ---------- Options handlers ----------
  const handleOptionChange = (
    index: number,
    field: keyof QuestionOption,
    value: string | boolean
  ) => {
    setForm((prev) => {
      const options = [...prev.options];

      if (field === "isCorrect" && prev.type === "single_choice") {
        // In single_choice, only one option can be correct
        options.forEach((opt, i) => {
          options[i] = {
            ...opt,
            isCorrect: i === index ? Boolean(value) : false,
          };
        });
      } else {
        options[index] = {
          ...options[index],
          [field]: value,
        } as QuestionOption;
      }

      return {
        ...prev,
        options,
      };
    });
  };

  const addOption = () => {
    setForm((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        {
          text: "",
          isCorrect: prev.type === "single_choice" ? false : false,
          explanation: "",
        },
      ],
    }));
  };

  const removeOption = (index: number) => {
    setForm((prev) => {
      const options = [...prev.options];
      options.splice(index, 1);
      return {
        ...prev,
        options,
      };
    });
  };

  // ---------- Submit ----------
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!quizId) {
      // TODO: toast / error message
      return;
    }

    setSaving(true);
    try {
      await apiRequest.post("/quizzes/questions", {
        quizId,
        type: form.type,
        text: form.text,
        explanation: form.explanation,
        options: form.options,
        answerText: form.answerText || null,
        points: form.points || 0,
        position: form.position || 0,
        timeLimitSeconds: form.timeLimitSeconds || 0,
        difficulty: form.difficulty,
      });

      // Redirect after create – adjust to your own questions list route
      router.push(`/admin/courses/${courseId}/modules`);
    } catch (error) {
      // TODO: toast / error handling
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (courseId) {
      router.push(`/admin/courses/${courseId}/modules`);
    } else {
      router.push("/admin/courses");
    }
  };

  return (
    <>
      <Head>
        <title>New Question · Admin</title>
      </Head>
      <AdminLayout>
        <form
          onSubmit={submit}
          className="max-w-4xl mx-auto space-y-6 bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <h1 className="text-lg font-semibold">Create Question</h1>
          </div>

          {/* Core fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Question Type */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                Question Type
              </label>
              <select
                name="type"
                value={form.type}
                onChange={onChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="single_choice">Single Choice</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True / False</option>
                <option value="short_answer">Short Answer</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={form.difficulty}
                onChange={onChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Question Text */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                Question Text <span className="text-red-500">*</span>
              </label>
              <textarea
                name="text"
                rows={3}
                value={form.text}
                onChange={onChange}
                required
                placeholder="Which gas is the main contributor to global warming?"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Explanation */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                Explanation (shown after answering)
              </label>
              <textarea
                name="explanation"
                rows={3}
                value={form.explanation}
                onChange={onChange}
                placeholder="Understanding greenhouse gases helps organizations build effective net-zero strategies."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          {/* Options (for choice questions and true/false) */}
          {(form.type === "single_choice" ||
            form.type === "multiple_choice" ||
            form.type === "true_false") && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-neutral-200">
                  Options
                </h2>
                {form.type !== "true_false" && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="text-xs px-3 py-1 rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800"
                  >
                    + Add Option
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {form.options.map((option, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-[auto,1fr,1fr,auto] gap-2 items-start border border-gray-200 dark:border-neutral-800 rounded-lg p-3"
                  >
                    {/* Correct checkbox */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`opt-correct-${index}`}
                        checked={option.isCorrect}
                        onChange={(e) =>
                          handleOptionChange(
                            index,
                            "isCorrect",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 rounded border-gray-300 dark:border-neutral-700"
                      />
                      <label
                        htmlFor={`opt-correct-${index}`}
                        className="text-xs text-gray-700 dark:text-neutral-300"
                      >
                        Correct
                      </label>
                    </div>

                    {/* Option text */}
                    <div>
                      <input
                        placeholder={`Option ${index + 1} text`}
                        value={option.text}
                        onChange={(e) =>
                          handleOptionChange(index, "text", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                      />
                    </div>

                    {/* Option explanation */}
                    <div>
                      <input
                        placeholder="Explanation (optional)"
                        value={option.explanation}
                        onChange={(e) =>
                          handleOptionChange(
                            index,
                            "explanation",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                      />
                    </div>

                    {/* Remove button */}
                    {form.type !== "true_false" && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Short answer specific */}
          {form.type === "short_answer" && (
            <div>
              <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                Expected Answer (for auto-checking, if applicable)
              </label>
              <input
                name="answerText"
                value={form.answerText}
                onChange={onChange}
                placeholder="Carbon dioxide"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          )}

          {/* Meta: points, position, time limit */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                Points
              </label>
              <input
                type="number"
                min={0}
                name="points"
                value={form.points}
                onChange={onChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                Position
              </label>
              <input
                type="number"
                min={0}
                name="position"
                value={form.position}
                onChange={onChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                Time Limit (seconds)
              </label>
              <input
                type="number"
                min={0}
                name="timeLimitSeconds"
                value={form.timeLimitSeconds}
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
              Create Question
            </button>
          </div>
        </form>
      </AdminLayout>
    </>
  );
}
