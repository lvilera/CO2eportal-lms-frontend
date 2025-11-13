import type { NavItem } from "@/components/ui/NavItem";
import {
  BarChart3,
  BookOpen,
  DollarSign,
  Layers,
  LayoutList,
  Settings,
  UserCog,
  Users,
} from "lucide-react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const navItems: NavItem[] = [
  {
    title: "Overview",
    href: "/admin",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    title: "Users",
    icon: <Users className="h-4 w-4" />,
    href: "/admin/users",
    children: [
      { title: "Students", href: "/admin/users/students" },
      { title: "Instructors", href: "/admin/users/instructors" },
      { title: "Admins", href: "/admin/users/admins" },
    ],
  },
  {
    title: "Courses",
    icon: <Layers className="h-4 w-4" />,
    href: "/admin/courses",
    children: [
      { title: "All Courses", href: "/admin/courses" },
      { title: "Categories", href: "/admin/courses/categories" },
      { title: "Modules/Lessons", href: "/admin/courses/modules" },
    ],
  },
  {
    title: "Enrollments",
    icon: <LayoutList className="h-4 w-4" />,
    href: "/admin/enrollments",
    children: [
      { title: "All Enrollments", href: "/admin/enrollments" },
      { title: "Approvals/Requests", href: "/admin/enrollments/requests" },
    ],
  },
  {
    title: "Payments",
    icon: <DollarSign className="h-4 w-4" />,
    href: "/admin/payments",
    children: [
      { title: "Transactions", href: "/admin/payments/transactions" },
      { title: "Payouts", href: "/admin/payments/payouts" },
      { title: "Coupons", href: "/admin/payments/coupons" },
    ],
  },
  {
    title: "Reports",
    icon: <BarChart3 className="h-4 w-4" />,
    href: "/admin/reports",
    children: [
      { title: "Revenue", href: "/admin/reports/revenue" },
      { title: "Engagement", href: "/admin/reports/engagement" },
      { title: "Course Performance", href: "/admin/reports/courses" },
    ],
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: <Settings className="h-4 w-4" />,
  },
  {
    title: "Roles",
    href: "/admin/roles",
    icon: <UserCog className="h-4 w-4" />,
  },
];

export default function AdminLayout({
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
