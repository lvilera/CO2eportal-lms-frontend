import AdminLayout from "@/components/admin/layout/AdminLayout";
import apiRequest from "@/lib/axios";
import {
  Edit3,
  GraduationCap,
  Loader2,
  PlusCircle,
  Search,
  UserPlus,
} from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type Company = {
  _id: string;
  name: string;
  desc?: string;
  seat?: number;
  courses?: any[];
};

export default function CompaniesListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await apiRequest.get<any>("/companies", {
        params: {
          page: -1,
          q: search || undefined,
        },
      });
      const items: Company[] = res.data?.items || res.data || [];
      setCompanies(items);
    } catch {
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCompanies();
  };

  const goCreate = () => router.push("/admin/companies/new");

  const goEdit = (id: string) => router.push(`/admin/companies/${id}/edit`);

  const goUsers = (id: string) =>
    router.push(`/admin/companies/${id}/add-user`);
  const goCourse = (id: string) =>
    router.push(`/admin/companies/${id}/courses`);

  return (
    <>
      <Head>
        <title>Companies · Admin</title>
      </Head>
      <AdminLayout>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                Companies
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage organizations that use your LMS, including seats and
                assigned courses.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <form onSubmit={onSearchSubmit} className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search companies..."
                  className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </form>

              <button
                type="button"
                onClick={goCreate}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-black border border-slate-200 dark:border-slate-700 text-sm font-medium hover:opacity-90"
              >
                <PlusCircle className="h-4 w-4" />
                New Company
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 md:p-5">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : companies.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                No companies found.
              </div>
            ) : (
              <div className="overflow-x-auto text-xs">
                <table className="min-w-full">
                  <thead>
                    <tr className="text-left text-[12px] uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      <th className="py-2 pr-3">Company</th>
                      <th className="py-2 px-3">Seats</th>
                      <th className="py-2 px-3">Courses</th>
                      <th className="py-2 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {companies.map((c) => (
                      <tr key={c._id}>
                        <td className="py-3 pr-3 align-top">
                          <div className="flex flex-col">
                            <span className="text-[14px] font-medium text-slate-900 dark:text-slate-50">
                              {c.name}
                            </span>
                            {c.desc && (
                              <span className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2">
                                {c.desc}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-[12px] text-slate-600 dark:text-slate-300">
                          {c.seat ?? "—"}
                        </td>
                        <td className="py-3 px-3 text-[12px] text-slate-600 dark:text-slate-300">
                          {c.courses && c.courses.length > 0
                            ? c.courses?.map((course) => course.title + ", ")
                            : "—"}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => goCourse(c._id)}
                              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[12px] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
                            >
                              <GraduationCap className="h-4 w-4" />
                              Course
                            </button>
                            <button
                              type="button"
                              onClick={() => goUsers(c._id)}
                              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[12px] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
                            >
                              <UserPlus className="h-4 w-4" />
                              Users
                            </button>
                            <button
                              type="button"
                              onClick={() => goEdit(c._id)}
                              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[12px] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
                            >
                              <Edit3 className="h-3 w-3" />
                              Edit
                            </button>
                          </div>
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
