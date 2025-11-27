// pages/admin/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]/edit.tsx

import AdminLayout from "@/components/admin/layout/AdminLayout";
import apiRequest from "@/lib/axios";
import { Loader2, Save } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

type LessonFormState = {
  title: string;
  content: string;
  videoUrl: string;
  videoDurationSeconds: number;
  videoTranscript: string;
  resourceTitle: string;
  resourceUrl: string;
  isPreview: boolean;
  position: number;
  slug?: string; // keep existing slug if needed
};

export default function EditLessonPage() {
  const router = useRouter();
  const { courseId, moduleId, lessonId } = router.query;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<LessonFormState>({
    title: "",
    content: "",
    videoUrl: "",
    videoDurationSeconds: 0,
    videoTranscript: "",
    resourceTitle: "",
    resourceUrl: "",
    isPreview: false,
    position: 0,
    slug: "",
  });

  // ------- Load existing lesson -------
  useEffect(() => {
    if (!lessonId) return;

    const fetchLesson = async () => {
      try {
        setLoading(true);
        const res = await apiRequest.get(`/lessons/${lessonId}`);
        const data = res.data;

        const video = data.video || {};
        const resources = Array.isArray(data.resources) ? data.resources : [];

        setForm({
          title: data.title || "",
          content: data.content || "",
          videoUrl: video.url || "",
          videoDurationSeconds:
            typeof video.durationSeconds === "number"
              ? video.durationSeconds
              : 0,
          videoTranscript: video.transcript || "",
          resourceTitle: resources[0]?.title || "",
          resourceUrl: resources[0]?.url || "",
          isPreview: !!data.isPreview,
          position: typeof data.position === "number" ? data.position : 0,
          slug: data.slug || "",
        });
      } catch (err) {
        // TODO: toast / error handling
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  // ------- Change handler (type-safe for checkbox) -------
  const onChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // Checkbox
    if (type === "checkbox") {
      const input = e.target as HTMLInputElement;
      setForm((f) => ({
        ...f,
        [name]: input.checked,
      }));
      return;
    }

    // Numeric fields
    if (name === "videoDurationSeconds" || name === "position") {
      setForm((f) => ({
        ...f,
        [name]: Number(value),
      }));
      return;
    }

    // Default text
    setForm((f) => ({
      ...f,
      [name]: value,
    }));
  };

  // ------- Submit handler -------
  const submit = async (e: FormEvent) => {
    e.preventDefault();

    const cId = Array.isArray(courseId) ? courseId[0] : courseId;
    const mId = Array.isArray(moduleId) ? moduleId[0] : moduleId;
    const lId = Array.isArray(lessonId) ? lessonId[0] : lessonId;

    if (!cId || !mId || !lId) return;

    setSaving(true);
    try {
      // Option 1: regenerate slug from title
      const slug =
        form.slug && form.slug.trim().length > 0
          ? form.slug
          : form.title
              .trim()
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "");

      const resources =
        form.resourceTitle || form.resourceUrl
          ? [
              {
                title: form.resourceTitle,
                url: form.resourceUrl,
              },
            ]
          : [];

      const payload = {
        title: form.title,
        slug,
        content: form.content,
        video: {
          url: form.videoUrl,
          durationSeconds: Number(form.videoDurationSeconds) || 0,
          transcript: form.videoTranscript,
        },
        resources,
        isPreview: form.isPreview,
        position: Number(form.position) || 0,
      };

      await apiRequest.patch(`/lessons/${lId}`, {
        ...payload,
        courseId: cId,
        moduleId: mId,
      });

      // Redirect – same as NewLessonPage
      router.push(`/admin/courses/${cId}/modules`);
    } catch (err) {
      // TODO: toast / error handling
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const cId = Array.isArray(courseId) ? courseId[0] : courseId;
    if (cId) {
      router.push(`/admin/courses/${cId}/modules`);
    } else {
      router.push("/admin/courses");
    }
  };

  return (
    <>
      <Head>
        <title>Edit Lesson · Admin</title>
      </Head>
      <AdminLayout>
        {loading ? (
          <div className="max-w-3xl mx-auto flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="max-w-3xl mx-auto space-y-6 bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6"
          >
            <h1 className="text-lg font-semibold mb-2">Edit Lesson</h1>

            {/* Title */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
              />
              <p className="text-xs text-gray-500 mt-1">
                Slug will be kept or regenerated from the title.
              </p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                Content
              </label>
              <textarea
                name="content"
                rows={5}
                value={form.content}
                onChange={onChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Video block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-neutral-200 mb-2">
                  Video
                </h2>
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                  Video URL
                </label>
                <input
                  name="videoUrl"
                  value={form.videoUrl}
                  onChange={onChange}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                  Duration (seconds)
                </label>
                <input
                  name="videoDurationSeconds"
                  type="number"
                  min={0}
                  value={form.videoDurationSeconds}
                  onChange={onChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                  Transcript
                </label>
                <textarea
                  name="videoTranscript"
                  rows={3}
                  value={form.videoTranscript}
                  onChange={onChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {/* Resources */}
            <div>
              <h2 className="text-sm font-semibold text-gray-700 dark:text-neutral-200 mb-2">
                Resources (optional)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                    Resource Title
                  </label>
                  <input
                    name="resourceTitle"
                    value={form.resourceTitle}
                    onChange={onChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                    Resource URL
                  </label>
                  <input
                    name="resourceUrl"
                    value={form.resourceUrl}
                    onChange={onChange}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                If you fill either title or URL, a single resource object will
                be sent in the <code>resources</code> array.
              </p>
            </div>

            {/* Preview + Position */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="flex items-center gap-2">
                <input
                  id="isPreview"
                  type="checkbox"
                  name="isPreview"
                  checked={form.isPreview}
                  onChange={onChange}
                  className="h-4 w-4 rounded border-gray-300 dark:border-neutral-700"
                />
                <label
                  htmlFor="isPreview"
                  className="text-sm text-gray-700 dark:text-neutral-300"
                >
                  Mark as preview lesson
                </label>
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                  Position
                </label>
                <input
                  name="position"
                  type="number"
                  min={0}
                  value={form.position}
                  onChange={onChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used to order lessons inside the module.
                </p>
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
