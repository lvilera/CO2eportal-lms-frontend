import { useAuth } from "@/context/AuthContext";

export default function Student() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">LMS Dashboard</h1>
          <button
            onClick={logout}
            className="rounded-lg bg-slate-900 text-white px-4 py-2 hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
        <div className="mt-6 rounded-xl border p-6 bg-white">
          <p className="text-slate-700">
            Signed in as{" "}
            <span className="font-medium">
              {user?.firstName} {user?.lastName}
            </span>{" "}
            ({user?.email})
          </p>
        </div>
      </div>
    </div>
  );
}
