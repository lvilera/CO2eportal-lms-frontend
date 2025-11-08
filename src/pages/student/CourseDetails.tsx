import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LessonList } from '@/components/course/LessonList';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getCourseById, getCourseModules, Course, Module } from '@/lib/mockApi';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle2, PlayCircle, FileText, User } from 'lucide-react';

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentLessonId, setCurrentLessonId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCourseById(id || ''),
      getCourseModules(id || ''),
    ]).then(([courseData, modulesData]) => {
      setCourse(courseData);
      setModules(modulesData);
      setCurrentLessonId(modulesData[0]?.lessons[0]?.id || '');
      setLoading(false);
    });
  }, [id]);

  const currentLesson = modules
    .flatMap((m) => m.lessons)
    .find((l) => l.id === currentLessonId);

  const handleMarkComplete = () => {
    toast.success('Lesson marked as complete!');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-full" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-96 lg:col-span-2" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-muted-foreground mb-4">Course not found</p>
          <Button onClick={() => navigate('/student')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/student')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          <div>
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span className="text-sm">{course.instructor}</span>
              </div>
              <Badge variant="outline">{course.category}</Badge>
              {course.rating && <span className="text-sm">⭐ {course.rating}</span>}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your Progress</span>
              <span className="font-medium">{course.progress || 0}%</span>
            </div>
            <Progress value={course.progress || 0} className="h-2" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-0">
                {/* Lesson Viewer */}
                <div className="aspect-video bg-muted flex items-center justify-center relative">
                  {currentLesson?.type === 'video' && (
                    <>
                      <PlayCircle className="h-20 w-20 text-primary/40" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg">
                          <p className="font-medium">{currentLesson.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Video · {currentLesson.duration} minutes
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  {currentLesson?.type === 'pdf' && (
                    <>
                      <FileText className="h-20 w-20 text-primary/40" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg">
                          <p className="font-medium">{currentLesson.title}</p>
                          <p className="text-sm text-muted-foreground">
                            PDF Document · {currentLesson.duration} min read
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  {currentLesson?.type === 'text' && (
                    <>
                      <FileText className="h-20 w-20 text-primary/40" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg">
                          <p className="font-medium">{currentLesson.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Reading · {currentLesson.duration} min
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  {!currentLesson && (
                    <p className="text-muted-foreground">Select a lesson to begin</p>
                  )}
                </div>

                {/* Lesson Actions */}
                {currentLesson && (
                  <div className="p-6 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{currentLesson.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {currentLesson.type.charAt(0).toUpperCase() + currentLesson.type.slice(1)} ·{' '}
                          {currentLesson.duration} minutes
                        </p>
                      </div>
                      <Button onClick={handleMarkComplete} className="gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        {currentLesson.completed ? 'Completed' : 'Mark Complete'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Course Description */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">About this course</h3>
                <p className="text-muted-foreground">
                  {course.subtitle ||
                    'This course will help you master the concepts and skills needed to succeed in this field.'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Lesson List */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Course Content</h3>
                <LessonList
                  modules={modules}
                  currentLessonId={currentLessonId}
                  onLessonClick={setCurrentLessonId}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
