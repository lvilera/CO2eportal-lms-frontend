import type { NavItem } from "@/components/ui/NavItem";
import { BookOpen, LayoutList, Settings, Trophy } from "lucide-react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/student",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    title: "My Courses",
    icon: <LayoutList className="h-4 w-4" />,
    href: "/student/courses",
    children: [
      { title: "Active Courses", href: "/student/courses/active" },
      { title: "Completed Courses", href: "/student/courses/completed" },
      { title: "All Courses", href: "/student/courses" },
    ],
  },

  {
    title: "Enrollments",
    icon: <LayoutList className="h-4 w-4" />,
    href: "/student/enrollments",
    children: [
      { title: "My Enrollments", href: "/student/enrollments" },
      /* { title: "Pending Requests", href: "/student/enrollments/requests" }, */
    ],
  },
  // {
  //   title: "Billing & Payments",
  //   icon: <DollarSign className="h-4 w-4" />,
  //   href: "/student/billing",
  //   children: [
  //     { title: "Invoices", href: "/student/billing/invoices" },
  //     { title: "Payment Methods", href: "/student/billing/methods" },
  //     { title: "Subscriptions", href: "/student/billing/subscriptions" },
  //   ],
  // },
  {
    title: "Certificates & Achievements",
    icon: <Trophy className="h-4 w-4" />,
    href: "/student/certificates",
    children: [
      { title: "Certificates", href: "/student/certificates" },
      /* { title: "Badges", href: "/student/certificates/badges" }, */
    ],
  },
  {
    title: "Settings",
    href: "/student/settings",
    icon: <Settings className="h-4 w-4" />,
  },
];

export default function StudentLayout({
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
