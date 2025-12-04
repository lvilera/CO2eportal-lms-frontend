import AdminLayout from "@/components/admin/layout/AdminLayout";
import apiRequest from "@/lib/axios";
import { Loader2, Save } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type Company = {
  _id: string;
  name: string;
  desc?: string;
  seat?: number;
  courses?: string[];
};

export default function EditCompanyPage() {
  const router = useRouter();
  const { companyId } = router.query;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    desc: "",
    seat: 0,
  });

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  useEffect(() => {
    if (!companyId) return;

    const fetchCompany = async () => {
      setLoading(true);
      try {
        const res = await apiRequest.get<Company>(`/companies/${companyId}`);
        const c = res.data;
        setForm({
          name: c.name || "",
          desc: c.desc || "",
          seat: c.seat ?? 0,
        });
      } catch {
        // TODO: toast
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        desc: form.desc || undefined,
        seat: Number(form.seat) || 0,
      };

      await apiRequest.put(`/companies/${companyId}`, payload);
      router.push("/admin/companies");
    } catch {
      // TODO: toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>Edit Company · Admin</title>
      </Head>
      <AdminLayout>
        {loading ? (
          <div className="max-w-3xl mx-auto flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="max-w-3xl mx-auto space-y-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6"
          >
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Edit Company
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Seats
                </label>
                <input
                  name="seat"
                  type="number"
                  min={0}
                  value={form.seat}
                  onChange={onChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                name="desc"
                rows={3}
                value={form.desc}
                onChange={onChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push("/admin/companies")}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-black text-sm font-medium border border-slate-200 dark:border-slate-700 hover:opacity-90 disabled:opacity-60"
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
