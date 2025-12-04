import AdminLayout from "@/components/admin/layout/AdminLayout";
import apiRequest from "@/lib/axios";
import { Loader2, PlusCircle, User, Users } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type Company = {
  _id: string;
  name: string;
};

type CompanyUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
};

export default function CompanyUsersPage() {
  const router = useRouter();
  const { companyId } = router.query;

  const [company, setCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");

  const fetchData = async () => {
    if (!companyId || typeof companyId !== "string") return;

    setLoading(true);
    try {
      // 1) Get company info
      const companyRes = await apiRequest.get<Company>(
        `/companies/${companyId}`
      );

      // 2) Get users already linked to this company
      // Backend: GET /users?companyId=<id> → { data: CompanyUser[] }
      const usersRes = await apiRequest.get<{ data: CompanyUser[] }>("/users", {
        params: { companyId },
      });

      setCompany(companyRes.data);
      setUsers(usersRes.data?.data || []);
    } catch {
      setCompany(null);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || typeof companyId !== "string" || !email.trim()) return;

    setSaving(true);
    try {
      // 1) Find user by email in LMS user DB

      await apiRequest.post(`/users/company`, {
        email,
        companyId,
      });

      setEmail("");
      await fetchData();
    } catch {
      // TODO: toast error
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => router.push("/admin/companies");

  return (
    <>
      <Head>
        <title>Company Users · Admin</title>
      </Head>
      <AdminLayout>
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <button
                onClick={goBack}
                className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                ← Back to companies
              </button>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                Company Users
              </h1>
              {company && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Manage users associated with{" "}
                  <span className="font-medium text-slate-900 dark:text-slate-50">
                    {company.name}
                  </span>
                  .
                </p>
              )}
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Users className="h-4 w-4" />
              {users?.length} user{users?.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Add user form */}
          <form
            onSubmit={addUser}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 flex flex-col md:flex-row md:items-center gap-3"
          >
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Add user by email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@company.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                The user must already exist in your LMS user database. This
                action links them to the company.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-black text-sm font-medium border border-slate-200 dark:border-slate-700 hover:opacity-90 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4" />
              )}
              Add User
            </button>
          </form>

          {/* Users list */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : users.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No users linked to this company yet.
              </div>
            ) : (
              <div className="overflow-x-auto text-xs">
                <table className="min-w-full">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      <th className="py-2 pr-3">User</th>
                      <th className="py-2 px-3">Email</th>
                      <th className="py-2 px-3">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td className="py-3 pr-3">
                          <span className="text-[13px] font-medium text-slate-900 dark:text-slate-50">
                            {u.firstName} {u.lastName}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[11px] text-slate-600 dark:text-slate-300">
                          {u.email}
                        </td>
                        <td className="py-3 px-3 text-[11px] text-slate-600 dark:text-slate-300">
                          {u.role || "Learner"}
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
