import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, GraduationCap, Shield } from "lucide-react";
import { useRouter } from "next/router";

export default function Index() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="text-center space-y-8 max-w-4xl">
        <div className="flex justify-center mb-8">
          <div className="p-4 rounded-full bg-primary/10">
            <BookOpen className="h-16 w-16 text-primary" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Welcome to <span className="text-primary">EduLearn</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The modern learning management system for educators and students
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push("/admin")}
          >
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Shield className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>
                Manage users, courses, and system settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Enter as Admin</Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push("/instructor")}
          >
            <CardHeader>
              <div className="flex justify-center mb-4">
                <GraduationCap className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>Instructor Dashboard</CardTitle>
              <CardDescription>
                Create courses, track progress, and grade assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Enter as Instructor</Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push("/student")}
          >
            <CardHeader>
              <div className="flex justify-center mb-4">
                <BookOpen className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>Student Dashboard</CardTitle>
              <CardDescription>
                Learn, complete courses, and earn certificates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Enter as Student</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
