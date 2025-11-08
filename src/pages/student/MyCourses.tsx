import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Play, BookOpen, Clock, Award, TrendingUp } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  subtitle: string;
  instructor: string;
  thumbnail: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  duration: string;
  rating: number;
  category: string;
  enrolled: boolean;
  nextLesson?: string;
  price?: number;
  isFree: boolean;
}

const enrolledCourses: Course[] = [
  {
    id: '1',
    title: 'Web Development Fundamentals',
    subtitle: 'Learn HTML, CSS, and JavaScript from scratch',
    instructor: 'Sarah Teacher',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400',
    progress: 75,
    totalLessons: 24,
    completedLessons: 18,
    duration: '8 hours',
    rating: 4.8,
    category: 'Web Development',
    enrolled: true,
    nextLesson: 'JavaScript Arrays and Objects',
    isFree: false,
  },
  {
    id: '2',
    title: 'UI/UX Design Principles',
    subtitle: 'Create beautiful and user-friendly interfaces',
    instructor: 'Sarah Teacher',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
    progress: 90,
    totalLessons: 18,
    completedLessons: 16,
    duration: '6 hours',
    rating: 4.9,
    category: 'Design',
    enrolled: true,
    nextLesson: 'Prototyping in Figma',
    isFree: true,
  },
  {
    id: '3',
    title: 'Data Structures & Algorithms',
    subtitle: 'Master DSA concepts with practical examples',
    instructor: 'David Lee',
    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400',
    progress: 45,
    totalLessons: 32,
    completedLessons: 14,
    duration: '12 hours',
    rating: 4.5,
    category: 'Computer Science',
    enrolled: true,
    nextLesson: 'Binary Search Trees',
    isFree: false,
  },
];

const availableCourses: Course[] = [
  {
    id: '4',
    title: 'Advanced React Patterns',
    subtitle: 'Master modern React development',
    instructor: 'Sarah Teacher',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
    progress: 0,
    totalLessons: 28,
    completedLessons: 0,
    duration: '10 hours',
    rating: 4.9,
    category: 'Web Development',
    enrolled: false,
    price: 79.99,
    isFree: false,
  },
  {
    id: '5',
    title: 'Python for Beginners',
    subtitle: 'Start your programming journey',
    instructor: 'David Lee',
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400',
    progress: 0,
    totalLessons: 24,
    completedLessons: 0,
    duration: '9 hours',
    rating: 4.7,
    category: 'Programming',
    enrolled: false,
    isFree: true,
  },
  {
    id: '6',
    title: 'Mobile App Development',
    subtitle: 'Build iOS and Android apps',
    instructor: 'Sarah Teacher',
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
    progress: 0,
    totalLessons: 36,
    completedLessons: 0,
    duration: '15 hours',
    rating: 4.8,
    category: 'Mobile Development',
    enrolled: false,
    price: 99.99,
    isFree: false,
  },
];

export default function MyCourses() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('enrolled');

  const courses = activeTab === 'enrolled' ? enrolledCourses : availableCourses;
  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Learning</h1>
          <p className="text-muted-foreground mt-1">
            Track your progress and continue learning
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Enrolled Courses
              </CardDescription>
              <CardTitle className="text-3xl">{enrolledCourses.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                In Progress
              </CardDescription>
              <CardTitle className="text-3xl">
                {enrolledCourses.filter(c => c.progress < 100).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Completed
              </CardDescription>
              <CardTitle className="text-3xl">
                {enrolledCourses.filter(c => c.progress >= 90).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Study Hours
              </CardDescription>
              <CardTitle className="text-3xl">24.5</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Search and Tabs */}
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
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="enrolled">Enrolled</TabsTrigger>
                  <TabsTrigger value="available">Browse</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in"
            >
              <div className="aspect-video relative group">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    size="lg"
                    className="gap-2"
                    onClick={() => navigate(`/student/courses/${course.id}`)}
                  >
                    <Play className="h-5 w-5" />
                    {course.enrolled ? 'Continue Learning' : 'View Course'}
                  </Button>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-black/60 text-white border-0">
                    {course.category}
                  </Badge>
                </div>
                {course.enrolled && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                )}
              </div>

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-1 text-lg">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-1 mt-1">
                      {course.subtitle}
                    </CardDescription>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{course.instructor}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {course.enrolled ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {course.completedLessons} of {course.totalLessons} lessons completed
                      </p>
                    </div>

                    {course.nextLesson && (
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-xs text-muted-foreground mb-1">Next lesson</p>
                        <p className="text-sm font-medium">{course.nextLesson}</p>
                      </div>
                    )}

                    <Button
                      className="w-full gap-2"
                      onClick={() => navigate(`/student/courses/${course.id}`)}
                    >
                      <Play className="h-4 w-4" />
                      Continue Learning
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          {course.totalLessons} lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {course.duration}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">★ {course.rating}</span>
                      </div>
                      {course.isFree ? (
                        <Badge variant="secondary">Free</Badge>
                      ) : (
                        <span className="text-lg font-bold">${course.price}</span>
                      )}
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => navigate(`/student/courses/${course.id}`)}
                    >
                      {course.isFree ? 'Enroll Now' : 'View Details'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No courses found</p>
              {activeTab === 'enrolled' && (
                <Button onClick={() => setActiveTab('available')}>
                  Browse Available Courses
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
