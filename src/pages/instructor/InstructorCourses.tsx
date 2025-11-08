import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreVertical, Edit, Eye, Users, BarChart } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  enrollments: number;
  status: 'draft' | 'published';
  lessons: number;
  rating: number;
  revenue: number;
  thumbnail: string;
  lastUpdated: string;
}

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Web Development Fundamentals',
    subtitle: 'Learn HTML, CSS, and JavaScript from scratch',
    category: 'Web Development',
    enrollments: 342,
    status: 'published',
    lessons: 24,
    rating: 4.8,
    revenue: 17100,
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400',
    lastUpdated: '2024-03-10',
  },
  {
    id: '2',
    title: 'Advanced React Patterns',
    subtitle: 'Master modern React development',
    category: 'Web Development',
    enrollments: 156,
    status: 'published',
    lessons: 32,
    rating: 4.9,
    revenue: 7800,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
    lastUpdated: '2024-03-08',
  },
  {
    id: '3',
    title: 'UI/UX Design Principles',
    subtitle: 'Create beautiful and user-friendly interfaces',
    category: 'Design',
    enrollments: 89,
    status: 'draft',
    lessons: 18,
    rating: 0,
    revenue: 0,
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
    lastUpdated: '2024-03-15',
  },
];

export default function InstructorCourses() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');

  const filteredCourses = mockCourses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalCourses: mockCourses.length,
    published: mockCourses.filter((c) => c.status === 'published').length,
    totalStudents: mockCourses.reduce((sum, c) => sum + c.enrollments, 0),
    totalRevenue: mockCourses.reduce((sum, c) => sum + c.revenue, 0),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Courses</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track your course performance
            </p>
          </div>
          <Button onClick={() => navigate('/instructor/courses/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Courses</CardDescription>
              <CardTitle className="text-3xl">{stats.totalCourses}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {stats.published} published
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Students</CardDescription>
              <CardTitle className="text-3xl">{stats.totalStudents}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Across all courses
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Revenue</CardDescription>
              <CardTitle className="text-3xl">${stats.totalRevenue.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avg Rating</CardDescription>
              <CardTitle className="text-3xl">4.8</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                From 587 reviews
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="published">Published</TabsTrigger>
                  <TabsTrigger value="draft">Draft</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Course List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                    {course.status}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-1 mt-1">
                      {course.subtitle}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/instructor/courses/${course.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Course
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/instructor/courses/${course.id}/students`)}>
                        <Users className="mr-2 h-4 w-4" />
                        View Students
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/instructor/courses/${course.id}/analytics`)}>
                        <BarChart className="mr-2 h-4 w-4" />
                        Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{course.lessons} lessons</span>
                  <span className="text-muted-foreground">{course.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{course.enrollments} students</span>
                  </div>
                  {course.status === 'published' && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">★ {course.rating}</span>
                    </div>
                  )}
                </div>
                {course.status === 'published' && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-lg font-semibold">${course.revenue.toLocaleString()}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/instructor/courses/${course.id}/edit`)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/instructor/courses/${course.id}/students`)}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Students
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No courses found</p>
              <Button className="mt-4" onClick={() => navigate('/instructor/courses/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Course
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
