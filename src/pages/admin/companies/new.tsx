import AdminLayout from "@/components/admin/layout/AdminLayout";
import apiRequest from "@/lib/axios";
import { Loader2, Save } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

export default function NewCompanyPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    desc: "",
    seat: 0,
    coursesText: "", // textarea -> array
  });

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        desc: form.desc || undefined,
        seat: Number(form.seat) || 0,
        courses: form.coursesText
          .split("\n")
          .map((c) => c.trim())
          .filter(Boolean),
      };

      await apiRequest.post("/companies", payload);
      router.push("/admin/companies");
    } catch (err) {
      // TODO: toast error
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>New Company · Admin</title>
      </Head>
      <AdminLayout>
        <form
          onSubmit={submit}
          className="max-w-3xl mx-auto space-y-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6"
        >
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Create Company
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
              <p className="mt-1 text-[11px] text-slate-400">
                Total number of learner seats allocated to this company.
              </p>
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

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Courses
            </label>
            <textarea
              name="coursesText"
              rows={4}
              placeholder={"React Fundamentals\nNestJS Advanced"}
              value={form.coursesText}
              onChange={onChange}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              One course per line. These are the courses assigned to this
              company.
            </p>
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
              Save
            </button>
          </div>
        </form>
      </AdminLayout>
    </>
  );
}
