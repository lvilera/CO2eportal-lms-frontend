import AdminLayout from "@/components/admin/layout/AdminLayout";
import apiRequest from "@/lib/axios";
import {
  BookOpen,
  GraduationCap,
  Loader2,
  PlusCircle,
  Trash2,
} from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

type Company = {
  _id: string;
  name: string;
};

type Course = {
  _id: string;
  title: string;
  categoryId?: any;
  level?: string;
  instructorId?: any;
};

export default function CompanyCoursesPage() {
  const router = useRouter();
  const { companyId } = router.query;

  const [company, setCompany] = useState<Company | null>(null);

  const [assignedCourses, setAssignedCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [filter, setFilter] = useState("");

  const goBack = () => router.push("/admin/companies");

  const fetchData = async () => {
    if (!companyId) return;

    setLoading(true);
    try {
      const [companyRes, assignedRes, allRes] = await Promise.all([
        apiRequest.get<Company>(`/companies/${companyId}`),
        apiRequest.get<any>(`/companies/${companyId}/courses`),
        apiRequest.get<any>("/courses", {
          params: { page: -1 },
        }),
      ]);

      setCompany(companyRes.data);

      const assigned: Course[] =
        assignedRes.data?.items || assignedRes.data || [];
      const all: Course[] = allRes.data?.items || allRes.data || [];

      setAssignedCourses(assigned);
      setAllCourses(all);
    } catch (err) {
      setCompany(null);
      setAssignedCourses([]);
      setAllCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const availableCourses = useMemo(() => {
    const assignedIds = new Set(assignedCourses.map((c) => c._id));
    let list = allCourses.filter((c) => !assignedIds.has(c._id));

    if (filter.trim()) {
      const q = filter.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.categoryId || "").toLowerCase().includes(q) ||
          (c.instructorId || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [allCourses, assignedCourses, filter]);

  const addCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !selectedCourseId) return;

    setSaving(true);
    try {
      await apiRequest.post(`/companies/${companyId}/courses`, {
        courseId: selectedCourseId,
      });
      setSelectedCourseId("");
      await fetchData();
    } catch (err) {
      // TODO: toast
    } finally {
      setSaving(false);
    }
  };

  const removeCourse = async (courseId: string) => {
    if (!companyId) return;

    setSaving(true);
    try {
      await apiRequest.delete(`/companies/${companyId}/courses/${courseId}`);
      await fetchData();
    } catch (err) {
      // TODO: toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>Company Courses · Admin</title>
      </Head>
      <AdminLayout>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <button
                onClick={goBack}
                className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                ← Back to companies
              </button>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                Company Courses
              </h1>
              {company && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Assign and manage LMS courses for{" "}
                  <span className="font-medium text-slate-900 dark:text-slate-50">
                    {company.name}
                  </span>
                  .
                </p>
              )}
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <BookOpen className="h-4 w-4" />
              {assignedCourses.length} assigned course
              {assignedCourses.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Add course form */}
          <form
            onSubmit={addCourse}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-3"
          >
            <div className="flex flex-col md:flex-row md:items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Select course to assign
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Choose a course…</option>
                  {availableCourses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}{" "}
                      {c.instructorId.firstName
                        ? ` · ${c.instructorId.firstName}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-56">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Filter available courses
                </label>
                <input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Search title, category, instructor…"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <button
                type="submit"
                disabled={saving || !selectedCourseId}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-black text-sm font-medium border border-slate-200 dark:border-slate-700 hover:opacity-90 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PlusCircle className="h-4 w-4" />
                )}
                Add Course
              </button>
            </div>

            <p className="text-[12px] text-slate-400">
              Only courses not already assigned to this company are shown in the
              dropdown.
            </p>
          </form>

          {/* Assigned courses list */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : assignedCourses.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No courses assigned to this company yet.
              </div>
            ) : (
              <div className="overflow-x-auto text-xs">
                <table className="min-w-full">
                  <thead>
                    <tr className="text-left text-[12px] uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      <th className="py-2 pr-3">Course</th>
                      <th className="py-2 px-3">Category / Level</th>
                      <th className="py-2 px-3">Instructor</th>
                      <th className="py-2 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {assignedCourses.map((c) => (
                      <tr key={c._id}>
                        <td className="py-3 pr-3">
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5">
                              <GraduationCap className="h-4 w-4 text-slate-400" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[14px] font-medium text-slate-900 dark:text-slate-50">
                                {c.title}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-[12px] text-slate-600 dark:text-slate-300">
                          {c.categoryId?.title || "—"}
                          {c.level ? ` · ${c.level}` : ""}
                        </td>
                        <td className="py-3 px-3 text-[12px] text-slate-600 dark:text-slate-300">
                          {c.instructorId.firstName +
                            " " +
                            c.instructorId.lastName || "—"}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => removeCourse(c._id)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[12px] text-rose-600 dark:text-rose-400 hover:bg-rose-50/60 dark:hover:bg-rose-900/20 disabled:opacity-60"
                          >
                            <Trash2 className="h-3 w-3" />
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
