import StudentLayout from "@/components/student/layout/StudentLayout";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Clock, Trophy } from "lucide-react";

export default function StudentDashboardHome() {
  const { currentUser } = useAuth();

  return (
    <StudentLayout>
      <div className="grid md:grid-cols-3 gap-4">
        {/* Enrolled Courses */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Enrolled Courses</span>
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-semibold">6</div>
        </div>

        {/* Hours Studied */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Hours Studied</span>
            <Clock className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-semibold">42 hrs</div>
        </div>

        {/* Achievements */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Achievements</span>
            <Trophy className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-semibold">12</div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-6">
        <h2 className="text-lg font-semibold">
          Welcome{currentUser ? `, ${currentUser.firstName}` : ""}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Continue learning from your enrolled courses and track your progress
          directly from the dashboard.
        </p>
      </div>
    </StudentLayout>
  );
}
