import { useAuth } from "@/context/AuthContext";
import { getCurrentUser } from "@/utils/token";
import { Lock, LogIn, Mail } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (isAuthenticated) {
      if (currentUser.role == "admin") {
        router.push("/admin");
      } else if (currentUser.role == "instructor") {
        router.push("/instructor");
      } else {
        router.push("/student");
      }
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!form.email || !form.password) {
      setErr("Email and password are required.");
      return;
    }
    setLoading(true);
    try {
      await login(form);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Authentication failed. Please try again.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign in • LMS Admin</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 grid place-items-center">
                  <LogIn className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Welcome back
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Sign in to manage your LMS
                  </p>
                </div>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email
                  </label>
                  <div className="mt-1 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
                      }
                      className="w-full pl-10 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                      placeholder="admin@gmail.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={form.password}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, password: e.target.value }))
                      }
                      className="w-full pl-10 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {err && <p className="text-sm text-rose-600">{err}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-indigo-600 text-white py-2.5 font-medium hover:bg-indigo-700 disabled:opacity-60"
                >
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
