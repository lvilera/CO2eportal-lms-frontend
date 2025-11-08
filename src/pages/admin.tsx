import { AlertCircle, BookOpen, TrendingUp, Users } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "2,543",
      change: "+12.5%",
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Active Courses",
      value: "147",
      change: "+8.2%",
      icon: BookOpen,
      color: "text-success",
    },
    {
      title: "Completion Rate",
      value: "73.5%",
      change: "+5.1%",
      icon: TrendingUp,
      color: "text-accent",
    },
    {
      title: "Pending Reviews",
      value: "23",
      change: "-2.3%",
      icon: AlertCircle,
      color: "text-warning",
    },
  ];

  return <></>;
}
