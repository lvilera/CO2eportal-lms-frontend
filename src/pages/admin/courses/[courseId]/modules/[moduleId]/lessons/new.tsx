import AdminLayout from "@/components/admin/layout/AdminLayout";
import apiRequest from "@/lib/axios";
import { Toastr } from "@/lib/toastr";
import { Loader2, Save } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

export default function NewLessonPage() {
  const router = useRouter();
  const { courseId, moduleId } = router.query;

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    content: "",
    videoUrl: "",
    videoDurationSeconds: 0,
    videoTranscript: "",
    resourceTitle: "",
    resourceUrl: "",
    isPreview: false,
    position: 0,
  });

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((f) => ({
      ...f,
      [name]:
        type === "checkbox"
          ? checked
          : name === "videoDurationSeconds" || name === "position"
          ? Number(value)
          : value,
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !courseId) return;

    setSaving(true);
    try {
      const slug = form.title
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

      await apiRequest.post(`/lessons`, {
        ...payload,
        courseId,
        moduleId,
      });

      Toastr.success("Saved successfully!");
      // Redirect – adjust to your flow (module detail / modules list)
      router.push(`/admin/courses/${courseId}/modules`);
    } catch (err: any) {
      Toastr.error(err?.message);
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
        <title>New Lesson · Admin</title>
      </Head>
      <AdminLayout>
        <form
          onSubmit={submit}
          className="max-w-3xl mx-auto space-y-6 bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6"
        >
          <h1 className="text-lg font-semibold mb-2">Create Lesson</h1>

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
              Slug will be generated from the title.
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
              If you fill either title or URL, a single resource object will be
              sent in the <code>resources</code> array.
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
              Save Lesson
            </button>
          </div>
        </form>
      </AdminLayout>
    </>
  );
}
