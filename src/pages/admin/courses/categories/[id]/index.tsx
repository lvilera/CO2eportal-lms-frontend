import AdminLayout from "@/components/admin/layout/AdminLayout";
import { FileUploader } from "@/components/ui/FileUploader";
import apiRequest from "@/lib/axios";
import { Toastr } from "@/lib/toastr";
import { Loader2, Save } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";

type FormState = {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  thumbnailUrl: string; // URL string per API
  isPublished: boolean;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function EditCourseCategory() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    thumbnailUrl: "",
    isPublished: true,
  });
  const originalRef = useRef<FormState | null>(null);

  // Fetch existing category
  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await apiRequest.get(`/course-category/${id}`);
        // Expecting data to match API fields
        const next: FormState = {
          title: data.title ?? "",
          slug: data.slug ?? "",
          subtitle: data.subtitle ?? "",
          description: data.description ?? "",
          thumbnailUrl: data.thumbnailUrl ?? "",
          isPublished: Boolean(data.isPublished),
        };
        if (mounted) {
          setForm(next);
          originalRef.current = next;
        }
      } catch (err) {
        console.error(err);
        // You can redirect or show an error UI here
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    if (type === "checkbox") {
      setForm((f) => ({ ...f, [name]: checked }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const onTitleBlur = () => {
    if (form.title && !form.slug) {
      setForm((f) => ({ ...f, slug: slugify(f.title) }));
    }
  };

  const regenerateSlug = () => {
    if (!form.title) return;
    setForm((f) => ({ ...f, slug: slugify(f.title) }));
  };

  const resetChanges = () => {
    if (originalRef.current) setForm(originalRef.current);
  };

  const copySlug = async () => {
    try {
      await navigator.clipboard.writeText(form.slug || "");
    } catch {
      /* noop */
    }
  };

  const isDirty = useMemo(() => {
    const base = originalRef.current;
    if (!base) return false;
    return (
      base.title !== form.title ||
      base.slug !== form.slug ||
      base.subtitle !== form.subtitle ||
      base.description !== form.description ||
      base.thumbnailUrl !== form.thumbnailUrl ||
      base.isPublished !== form.isPublished
    );
  }, [form]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        subtitle: form.subtitle,
        description: form.description,
        thumbnailUrl: form.thumbnailUrl,
        isPublished: form.isPublished,
      };

      // Use PUT or PATCH per your controller; keeping PUT here.
      await apiRequest.put(`/course-category/${id}`, payload);
      Toastr.success("Saved successfully!");
      // refresh original snapshot and keep user on page
      originalRef.current = payload;
      setForm(payload);
      router.push("/admin/courses/categories");
    } catch (err: any) {
      Toastr.error(err?.["message"]);
      //console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Edit Course Category · Admin</title>
        </Head>
        <AdminLayout>
          <div className="max-w-3xl mx-auto p-8">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-neutral-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading category…
            </div>
          </div>
        </AdminLayout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Course Category · Admin</title>
      </Head>
      <AdminLayout>
        <form
          onSubmit={submit}
          className="max-w-3xl mx-auto space-y-6 bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Edit Category</h1>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetChanges}
                disabled={!isDirty}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-60"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/courses/categories")}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800"
              >
                Back
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                onBlur={onTitleBlur}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                  Slug
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={regenerateSlug}
                    className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800"
                  >
                    Regenerate
                  </button>
                  <button
                    type="button"
                    onClick={copySlug}
                    className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <input
                name="slug"
                value={form.slug}
                onChange={onChange}
                placeholder="auto-generated on title blur"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
              />
              {form.slug ? (
                <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                  Preview: /courses/categories/{form.slug}
                </p>
              ) : null}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                Subtitle
              </label>
              <input
                name="subtitle"
                value={form.subtitle}
                onChange={onChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
              />
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
            <FileUploader
              label="Thumbnail Image"
              name="thumbnailUrl"
              value={form.thumbnailUrl}
              onUrlChange={(url) =>
                setForm((f) => ({ ...f, thumbnailUrl: (url as string) ?? "" }))
              }
              endpoint="/files/image"
              fileType="image"
              accept="image/*"
              helperText="Supported: JPG, PNG, WEBP. Max 15MB."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isPublished"
              type="checkbox"
              name="isPublished"
              checked={form.isPublished}
              onChange={onChange}
              className="h-4 w-4 rounded border-gray-300 dark:border-neutral-700"
            />
            <label
              htmlFor="isPublished"
              className="text-sm text-gray-700 dark:text-neutral-300"
            >
              Published
            </label>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={saving || !isDirty}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-neutral-700 rounded-lg bg-primary text-black hover:opacity-90 disabled:opacity-60"
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
