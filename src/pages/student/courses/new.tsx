import AdminLayout from "@/components/admin/layout/AdminLayout";
import apiRequest from "@/lib/axios";
import { Loader2, Save } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

export default function NewCourse() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    status: "draft",
    thumbnail: null as File | null,
  });

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((f) => ({ ...f, thumbnail: file }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = new FormData();
      body.append("title", form.title);
      body.append("description", form.description);
      body.append("category", form.category);
      if (form.price) body.append("price", String(Number(form.price)));
      body.append("status", form.status);
      if (form.thumbnail) body.append("thumbnail", form.thumbnail);

      await apiRequest.post("/courses", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      router.push("/admin/courses");
    } catch (e) {
      // TODO: toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>New Course · Admin</title>
      </Head>
      <AdminLayout>
        <form
          onSubmit={submit}
          className="max-w-3xl mx-auto space-y-6 bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                Category
              </label>
              <input
                name="category"
                value={form.category}
                onChange={onChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                Price (USD)
              </label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={onChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

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
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={6}
              value={form.description}
              onChange={onChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
              Thumbnail
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onFile}
              className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-white hover:file:opacity-90"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/courses")}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save
            </button>
          </div>
        </form>
      </AdminLayout>
    </>
  );
}
