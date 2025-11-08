import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function InstructorDashboard() {
  const navigate = useNavigate();
  
  const stats = [
    {
      title: 'My Courses',
      value: '8',
      description: '3 active, 5 published',
      icon: BookOpen,
      color: 'text-primary',
    },
    {
      title: 'Total Students',
      value: '342',
      description: 'Across all courses',
      icon: Users,
      color: 'text-success',
    },
    {
      title: 'Pending Reviews',
      value: '12',
      description: 'Assignments to grade',
      icon: FileText,
      color: 'text-warning',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your courses and engage with students
            </p>
          </div>
          <Button className="gap-2" onClick={() => navigate('/instructor/courses/new')}>
            <Plus className="h-4 w-4" />
            Create Course
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.title} className="shadow-custom-sm transition-base hover:shadow-custom-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="shadow-custom-sm">
            <CardHeader>
              <CardTitle>Coming in Milestone 2</CardTitle>
              <CardDescription>Course Creation & Management</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Create and structure courses</li>
                <li>• Upload videos and materials</li>
                <li>• Design quizzes and assignments</li>
                <li>• Track student progress</li>
                <li>• Manage course settings</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-custom-sm">
            <CardHeader>
              <CardTitle>Coming in Milestone 2</CardTitle>
              <CardDescription>Student Engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• View enrolled students</li>
                <li>• Grade assignments</li>
                <li>• Respond to questions</li>
                <li>• Send announcements</li>
                <li>• Analytics and insights</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-custom-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              Activity feed will be displayed here
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
