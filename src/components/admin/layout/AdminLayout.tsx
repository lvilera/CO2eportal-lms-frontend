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
    href: "/dashboard",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    title: "Users",
    icon: <Users className="h-4 w-4" />,
    href: "/dashboard/users",
    children: [
      { title: "Students", href: "/dashboard/users/students" },
      { title: "Instructors", href: "/dashboard/users/instructors" },
      { title: "Admins", href: "/dashboard/users/admins" },
    ],
  },
  {
    title: "Courses",
    icon: <Layers className="h-4 w-4" />,
    href: "/dashboard/courses",
    children: [
      { title: "All Courses", href: "/dashboard/courses" },
      { title: "Categories", href: "/dashboard/courses/categories" },
      { title: "Modules/Lessons", href: "/dashboard/courses/modules" },
    ],
  },
  {
    title: "Enrollments",
    icon: <LayoutList className="h-4 w-4" />,
    href: "/dashboard/enrollments",
    children: [
      { title: "All Enrollments", href: "/dashboard/enrollments" },
      { title: "Approvals/Requests", href: "/dashboard/enrollments/requests" },
    ],
  },
  {
    title: "Payments",
    icon: <DollarSign className="h-4 w-4" />,
    href: "/dashboard/payments",
    children: [
      { title: "Transactions", href: "/dashboard/payments/transactions" },
      { title: "Payouts", href: "/dashboard/payments/payouts" },
      { title: "Coupons", href: "/dashboard/payments/coupons" },
    ],
  },
  {
    title: "Reports",
    icon: <BarChart3 className="h-4 w-4" />,
    href: "/dashboard/reports",
    children: [
      { title: "Revenue", href: "/dashboard/reports/revenue" },
      { title: "Engagement", href: "/dashboard/reports/engagement" },
      { title: "Course Performance", href: "/dashboard/reports/courses" },
    ],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="h-4 w-4" />,
  },
  {
    title: "Roles",
    href: "/dashboard/roles",
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
