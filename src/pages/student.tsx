import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Award, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const navigate = useNavigate();
  
  const stats = [
    {
      title: 'Enrolled Courses',
      value: '5',
      description: '3 in progress',
      icon: BookOpen,
      color: 'text-primary',
    },
    {
      title: 'Study Hours',
      value: '24.5',
      description: 'This week',
      icon: Clock,
      color: 'text-success',
    },
    {
      title: 'Certificates',
      value: '2',
      description: 'Earned this year',
      icon: Award,
      color: 'text-accent',
    },
    {
      title: 'Average Score',
      value: '87%',
      description: '+5% from last month',
      icon: TrendingUp,
      color: 'text-warning',
    },
  ];

  const courses = [
    { id: '1', title: 'Web Development Fundamentals', progress: 75, color: 'bg-primary' },
    { id: '2', title: 'Data Structures & Algorithms', progress: 45, color: 'bg-success' },
    { id: '3', title: 'UI/UX Design Principles', progress: 90, color: 'bg-accent' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Continue your learning journey
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

        <Card className="shadow-custom-sm">
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
            <CardDescription>Pick up where you left off</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {courses.map((course) => (
              <div 
                key={course.id} 
                className="space-y-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate(`/student/courses/${course.id}`)}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{course.title}</h4>
                  <span className="text-sm text-muted-foreground">
                    {course.progress}%
                  </span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>
            ))}
            <Button 
              className="w-full mt-4"
              onClick={() => navigate('/student/courses')}
            >
              View All Courses
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="shadow-custom-sm hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/student/certificates')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Certificates</CardTitle>
                <Award className="h-8 w-8 text-primary" />
              </div>
              <CardDescription>View your earned certificates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">2</div>
              <p className="text-sm text-muted-foreground">
                Certificates earned this year
              </p>
              <Button variant="outline" className="w-full mt-4" onClick={(e) => {
                e.stopPropagation();
                navigate('/student/certificates');
              }}>
                View Certificates
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-custom-sm">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your learning progress</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Completed Module 3 in Web Development</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Earned certificate in UI/UX Design</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Scored 94% on JavaScript Quiz</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button size="lg" className="gap-2" onClick={() => navigate('/student/courses')}>
            <BookOpen className="h-5 w-5" />
            Browse All Courses
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
