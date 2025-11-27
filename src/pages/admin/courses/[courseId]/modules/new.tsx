import AdminLayout from "@/components/admin/layout/AdminLayout";
import apiRequest from "@/lib/axios";
import { Toastr } from "@/lib/toastr";
import { Loader2, Save } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

export default function NewModule() {
  const router = useRouter();
  const { id } = router.query; // courseId

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    position: 0,
  });

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "position" ? Number(value) : value,
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const courseId = Array.isArray(id) ? id[0] : id;
    if (!courseId) return;

    setSaving(true);
    try {
      await apiRequest.post(`/modules`, {
        courseId,
        title: form.title,
        description: form.description || "",
        position: Number(form.position) || 0,
      });
      Toastr.success("Saved successfully!");
      // Adjust redirect as needed (e.g. modules list for that course)
      router.push(`/admin/courses/`);
    } catch (err: any) {
      Toastr.error(err?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/admin/courses/`);
  };

  return (
    <>
      <Head>
        <title>New Module · Admin</title>
      </Head>
      <AdminLayout>
        <form
          onSubmit={submit}
          className="max-w-3xl mx-auto space-y-6 bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6"
        >
          <h1 className="text-lg font-semibold mb-2">Create Module</h1>

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
              Save Module
            </button>
          </div>
        </form>
      </AdminLayout>
    </>
  );
}
