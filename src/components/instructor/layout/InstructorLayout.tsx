import type { NavItem } from "@/components/ui/NavItem";
import { BarChart3, BookOpen, LayoutList, Trophy, Users } from "lucide-react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/instructor",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    title: "My Courses",
    icon: <LayoutList className="h-4 w-4" />,
    href: "/instructor/courses",
    children: [
      { title: "All Courses", href: "/instructor/courses" },
      { title: "Create Course", href: "/instructor/courses/new" },
      // { title: "Modules & Lessons", href: "/instructor/courses/modules" },
      // { title: "Assignments", href: "/instructor/courses/assignments" },
    ],
  },
  {
    title: "Students",
    icon: <Users className="h-4 w-4" />,
    href: "/instructor/students",
    children: [
      { title: "Enrolled Students", href: "/instructor/students" },
      { title: "Announcements", href: "/instructor/announcements" },
    ],
  },
  {
    title: "Performance & Analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    href: "/instructor/analytics",
    children: [
      { title: "Course Analytics", href: "/instructor/analytics/courses" },
      { title: "Quiz Performance", href: "/instructor/analytics/quizzes" },
    ],
  },
  // {
  //   title: "Earnings",
  //   icon: <DollarSign className="h-4 w-4" />,
  //   href: "/instructor/earnings",
  //   children: [
  //     { title: "Payouts", href: "/instructor/earnings/payouts" },
  //     { title: "Transactions", href: "/instructor/earnings/transactions" },
  //     { title: "Subscriptions", href: "/instructor/earnings/subscriptions" },
  //   ],
  // },
  {
    title: "Certificates & Achievements",
    icon: <Trophy className="h-4 w-4" />,
    href: "/instructor/certificates",
    children: [
      { title: "Issued Certificates", href: "/instructor/certificates" },
      // { title: "Badges", href: "/instructor/certificates/badges" },
    ],
  },
  // {
  //   title: "Settings",
  //   href: "/instructor/settings",
  //   icon: <Settings className="h-4 w-4" />,
  // },
];

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="flex">
        <Sidebar items={navItems} />
        <main className="flex-1 min-h-screen">
          <Header />
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
