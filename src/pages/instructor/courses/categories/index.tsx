import InstructorLayout from "@/components/instructor/layout/InstructorLayout";
import apiRequest from "@/lib/axios";
import {
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type CourseCategory = {
  _id: string;
  title: string;
  slug?: string;
  isPublished?: boolean;
  thumbnailUrl?: string;
  updatedAt?: string;
};

export default function CourseCategoryIndex() {
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<CourseCategory[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await apiRequest.get<{ items: CourseCategory[] }>(
          "/course-category",
          {
            params: q ? { q } : {},
          }
        );
        if (mounted) setRows(data.items || []);
      } catch (e) {
        // TODO: toast
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [q]);

  return (
    <>
      <InstructorLayout>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Courses</h1>
          <Link
            href="/instructor/courses/categories/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Create Course Category
          </Link>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-full max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search courses…"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <Link
            href="/instructor/courses/category/new"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Course
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-neutral-900 text-gray-500">
              <tr>
                <th className="text-left p-3">Info</th>
                <th className="text-left p-3">Slug</th>
                <th className="text-center p-3">Is Published</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center">
                    <Loader2 className="h-5 w-5 animate-spin inline-block" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    No courses found.
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr
                    key={c._id}
                    className="border-t border-gray-100 dark:border-neutral-800"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {c.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.thumbnailUrl}
                            alt={c.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-neutral-800" />
                        )}
                        <div>
                          <div className="font-medium text-gray-900 dark:text-neutral-100">
                            {c.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {c.updatedAt
                              ? new Date(c.updatedAt).toLocaleString()
                              : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{c.slug || "-"}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          c.isPublished
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                        }`}
                      >
                        {c.isPublished ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/instructor/courses/categories/${c._id}`}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-red-600"
                          title="Delete"
                          onClick={async () => {
                            if (!confirm("Delete this course?")) return;
                            await apiRequest.delete(
                              `/course-category/${c._id}`
                            );
                            // Refresh list
                            setRows((prev) =>
                              prev.filter((x) => x._id !== c._id)
                            );
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </InstructorLayout>
    </>
  );
}
