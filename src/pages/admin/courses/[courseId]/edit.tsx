import AdminLayout from "@/components/admin/layout/AdminLayout";
import { FileUploader } from "@/components/ui/FileUploader";
import apiRequest from "@/lib/axios";
import { Toastr } from "@/lib/toastr";
import { Loader2, Save } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type CourseCategory = {
  _id: string;
  title: string;
  slug?: string;
};

type Instructor = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
};

type Course = {
  _id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  thumbnailUrl?: string;
  categoryId?: string | { _id: string; title?: string };
  tags?: string[];
  level: "beginner" | "intermediate" | "advanced";
  language?: string;
  price?: number;
  durationMinutes?: number;
  isPublished?: boolean;
  instructorId?: string | { _id: string; email?: string };
};

export default function EditCourse() {
  const router = useRouter();
  const { courseId } = router.query;

  const [saving, setSaving] = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(true);

  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loadingInstructors, setLoadingInstructors] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    thumbnailUrl: "",
    categoryId: "",
    tags: "" as string, // comma separated input
    level: "beginner",
    language: "en",
    price: 0,
    durationMinutes: 0,
    isPublished: false,
    instructorId: "",
  });

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.title.trim().toLowerCase().replace(/\s+/g, "-"),
        subtitle: form.subtitle || undefined,
        description: form.description || undefined,
        thumbnailUrl: form.thumbnailUrl || undefined,
        categoryId: form.categoryId || undefined,
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        level: form.level as "beginner" | "intermediate" | "advanced",
        language: form.language || "en",
        price: Number(form.price) || 0,
        durationMinutes: Number(form.durationMinutes) || 0,
        isPublished: form.isPublished,
        instructorId: form.instructorId || undefined,
      };

      await apiRequest.put(`/courses/${courseId}`, payload);
      Toastr.success("Updated successfully!");
      router.push("/admin/courses");
    } catch (err: any) {
      Toastr.error(err?.message);
    } finally {
      setSaving(false);
    }
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await apiRequest.get<CourseCategory[]>(
          "/course-category?page=-1"
        );
        setCategories(res.data || []);
      } catch (err) {
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch instructors (role = instructor)
  useEffect(() => {
    const fetchInstructors = async () => {
      setLoadingInstructors(true);
      try {
        const res = await apiRequest.get<Instructor[]>(
          "/users?role=instructor&page=-1"
        );
        setInstructors(res.data || []);
      } catch (err) {
        setInstructors([]);
      } finally {
        setLoadingInstructors(false);
      }
    };

    fetchInstructors();
  }, []);

  // Fetch course details
  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      setLoadingCourse(true);
      try {
        const res = await apiRequest.get<Course>(`/courses/${courseId}`);
        const course = res.data;

        setForm({
          title: course.title || "",
          slug: course.slug || "",
          subtitle: course.subtitle || "",
          description: course.description || "",
          thumbnailUrl: course.thumbnailUrl || "",
          categoryId:
            typeof course.categoryId === "string"
              ? course.categoryId
              : course.categoryId?._id || "",
          tags: course.tags?.join(", ") || "",
          level: course.level || "beginner",
          language: course.language || "en",
          price: course.price ?? 0,
          durationMinutes: course.durationMinutes ?? 0,
          isPublished: course.isPublished ?? false,
          instructorId:
            typeof course.instructorId === "string"
              ? course.instructorId
              : (course.instructorId as any)?._id || "",
        });
      } catch (err: any) {
        Toastr.error(err?.message);
      } finally {
        setLoadingCourse(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  return (
    <>
      <Head>
        <title>Edit Course · Admin</title>
      </Head>
      <AdminLayout>
        {loadingCourse ? (
          <div className="max-w-3xl mx-auto flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="max-w-3xl mx-auto space-y-6 bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6"
          >
            <h1 className="text-lg font-semibold mb-2">Edit Course</h1>

            {/* TITLE + SUBTITLE */}
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

            {/* CATEGORY + PRICE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                  Category
                </label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={onChange}
                  disabled={loadingCategories || categories.length === 0}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">
                    {loadingCategories
                      ? "Loading categories..."
                      : "Select a category"}
                  </option>
                  {categories?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.title}
                    </option>
                  ))}
                </select>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                  Duration Minutes
                </label>
                <input
                  name="durationMinutes"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.durationMinutes}
                  onChange={onChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {/* LEVEL + LANGUAGE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                  Level
                </label>
                <select
                  name="level"
                  value={form.level}
                  onChange={onChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                  Language
                </label>
                <input
                  name="language"
                  value={form.language}
                  onChange={onChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {/* TAGS */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                Tags (comma separated)
              </label>
              <input
                name="tags"
                value={form.tags}
                onChange={onChange}
                placeholder="react, node, backend"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* THUMBNAIL UPLOAD + URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <FileUploader
                label="Thumbnail Image"
                name="thumbnailUrl"
                value={form.thumbnailUrl}
                onUrlChange={(url) =>
                  setForm((f) => ({
                    ...f,
                    thumbnailUrl: (url as string) ?? "",
                  }))
                }
                endpoint="/files/image"
                fileType="image"
                accept="image/*"
                helperText="Supported: JPG, PNG, WEBP. Max 15MB."
              />
            </div>

            {/* DESCRIPTION */}
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

            {/* INSTRUCTOR SELECT */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-neutral-400 mb-1">
                Instructor<span className="text-red-500">*</span>
              </label>
              <select
                name="instructorId"
                value={form.instructorId}
                onChange={onChange}
                disabled={loadingInstructors || instructors.length === 0}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">
                  {loadingInstructors
                    ? "Loading instructors..."
                    : "Select an instructor"}
                </option>
                {instructors.map((ins) => (
                  <option key={ins._id} value={ins._id}>
                    {ins.firstName || ins.lastName
                      ? `${ins.firstName ?? ""} ${ins.lastName ?? ""}`.trim()
                      : ins.email}
                  </option>
                ))}
              </select>
            </div>

            {/* PUBLISHED */}
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

            {/* ACTIONS */}
            <div className="flex items-center justify-end gap-3 pt-4">
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
