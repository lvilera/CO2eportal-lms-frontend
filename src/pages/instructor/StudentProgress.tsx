import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/tables/DataTable';
import {
  ArrowLeft,
  Search,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  enrolledDate: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastActive: string;
  quizScore: number;
  assignmentScore: number;
  status: 'active' | 'inactive' | 'completed';
}

const mockStudents: Student[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    enrolledDate: '2024-01-15',
    progress: 85,
    completedLessons: 20,
    totalLessons: 24,
    lastActive: '2 hours ago',
    quizScore: 92,
    assignmentScore: 88,
    status: 'active',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    enrolledDate: '2024-01-20',
    progress: 100,
    completedLessons: 24,
    totalLessons: 24,
    lastActive: '1 day ago',
    quizScore: 95,
    assignmentScore: 94,
    status: 'completed',
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    enrolledDate: '2024-02-01',
    progress: 45,
    completedLessons: 11,
    totalLessons: 24,
    lastActive: '5 days ago',
    quizScore: 78,
    assignmentScore: 72,
    status: 'inactive',
  },
];

export default function StudentProgress() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = mockStudents.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalStudents: mockStudents.length,
    activeStudents: mockStudents.filter((s) => s.status === 'active').length,
    completedStudents: mockStudents.filter((s) => s.status === 'completed').length,
    avgProgress: Math.round(
      mockStudents.reduce((sum, s) => sum + s.progress, 0) / mockStudents.length
    ),
    avgQuizScore: Math.round(
      mockStudents.reduce((sum, s) => sum + s.quizScore, 0) / mockStudents.length
    ),
  };

  const columns = [
    {
      key: 'name',
      label: 'Student',
      render: (value: string, row: Student) => (
        <div className="flex items-center gap-3">
          <img src={row.avatar} alt={value} className="w-10 h-10 rounded-full" />
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-sm text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'progress',
      label: 'Progress',
      render: (value: number, row: Student) => (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm">{value}%</span>
            <span className="text-xs text-muted-foreground">
              {row.completedLessons}/{row.totalLessons}
            </span>
          </div>
          <Progress value={value} className="h-2" />
        </div>
      ),
    },
    {
      key: 'quizScore',
      label: 'Quiz Score',
      render: (value: number) => (
        <div className="text-center">
          <span className="text-lg font-semibold">{value}%</span>
        </div>
      ),
    },
    {
      key: 'assignmentScore',
      label: 'Assignment Score',
      render: (value: number) => (
        <div className="text-center">
          <span className="text-lg font-semibold">{value}%</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const variants: Record<string, any> = {
          active: 'default',
          inactive: 'secondary',
          completed: 'default',
        };
        return <Badge variant={variants[value]}>{value}</Badge>;
      },
    },
    {
      key: 'lastActive',
      label: 'Last Active',
      render: (value: string) => <span className="text-sm text-muted-foreground">{value}</span>,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/instructor/courses')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Student Progress</h1>
              <p className="text-muted-foreground mt-1">Web Development Fundamentals</p>
            </div>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Students</CardDescription>
              <CardTitle className="text-3xl">{stats.totalStudents}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Active
              </CardDescription>
              <CardTitle className="text-3xl">{stats.activeStudents}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Completed
              </CardDescription>
              <CardTitle className="text-3xl">{stats.completedStudents}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avg Progress</CardDescription>
              <CardTitle className="text-3xl">{stats.avgProgress}%</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avg Quiz Score</CardDescription>
              <CardTitle className="text-3xl">{stats.avgQuizScore}%</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search students by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Student List */}
        <Card>
          <CardHeader>
            <CardTitle>Student Details</CardTitle>
            <CardDescription>Track individual student progress and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={filteredStudents}
              searchKeys={['name', 'email']}
            />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  student: 'John Smith',
                  action: 'Completed',
                  item: 'Module 3: Advanced Concepts',
                  time: '2 hours ago',
                  icon: CheckCircle,
                  color: 'text-green-500',
                },
                {
                  student: 'Sarah Johnson',
                  action: 'Submitted',
                  item: 'Assignment: Final Project',
                  time: '5 hours ago',
                  icon: Clock,
                  color: 'text-blue-500',
                },
                {
                  student: 'Mike Davis',
                  action: 'Needs Help',
                  item: 'Quiz 2: JavaScript Basics',
                  time: '1 day ago',
                  icon: AlertCircle,
                  color: 'text-orange-500',
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg border">
                  <activity.icon className={`h-5 w-5 ${activity.color} mt-0.5`} />
                  <div className="flex-1">
                    <p className="font-medium">
                      {activity.student} {activity.action.toLowerCase()}{' '}
                      <span className="text-muted-foreground">{activity.item}</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
