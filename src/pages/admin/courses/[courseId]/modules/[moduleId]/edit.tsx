// pages/admin/modules/[id]/edit.tsx

import AdminLayout from "@/components/admin/layout/AdminLayout";
import apiRequest from "@/lib/axios";
import { Toastr } from "@/lib/toastr";
import { Loader2, Save } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

type ModuleFormState = {
  title: string;
  description: string;
  position: number;
};

export default function EditModule() {
  const router = useRouter();
  const { moduleId, courseId } = router.query; // moduleId

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<ModuleFormState>({
    title: "",
    description: "",
    position: 0,
  });

  // Load existing module
  useEffect(() => {
    const moduleIdFilterd = Array.isArray(moduleId) ? moduleId[0] : moduleId;
    if (!moduleIdFilterd) return;

    const fetchModule = async () => {
      try {
        setLoading(true);
        const res = await apiRequest.get(`/modules/${moduleIdFilterd}`);
        const data = res.data;

        setForm({
          title: data.title || "",
          description: data.description || "",
          position: typeof data.position === "number" ? data.position : 0,
        });

        // courseId may be under courseId or course._id depending on your API
        const cid =
          data.courseId ||
          (data.course && (data.course._id || data.course.id)) ||
          null;
        Toastr.success("Saved successfully!");
      } catch (err: any) {
        Toastr.error(err?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [moduleId]);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "position" ? Number(value) : value,
    }));
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const moduleIdFilterd = Array.isArray(moduleId) ? moduleId[0] : moduleId;
    if (!moduleIdFilterd) return;

    setSaving(true);
    try {
      await apiRequest.put(`/modules/${moduleIdFilterd}`, {
        title: form.title,
        description: form.description || "",
        position: Number(form.position) || 0,
      });

      // Prefer redirecting back to that course’s modules, if we know it
      if (courseId) {
        router.push(`/admin/courses/${courseId}/modules`);
      } else {
        router.push(`/admin/courses/`);
      }
      Toastr.success("Saved successfully!");
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
      router.push(`/admin/courses/`);
    }
  };

  return (
    <>
      <Head>
        <title>Edit Module · Admin</title>
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
            <h1 className="text-lg font-semibold mb-2">Edit Module</h1>

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
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Position */}
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
                  Used for ordering modules within the course.
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={5}
                value={form.description}
                onChange={onChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
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
