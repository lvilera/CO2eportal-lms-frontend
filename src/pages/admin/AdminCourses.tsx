import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CourseCard } from '@/components/course/CourseCard';
import { Button } from '@/components/ui/button';
import { getCourses, Course } from '@/lib/mockApi';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getCourses().then((data) => {
      setCourses(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Course Management</h1>
            <p className="text-muted-foreground">
              Manage all courses across the platform
            </p>
          </div>
          <Button
            onClick={() => navigate('/instructor/courses/new')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Course
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onAction={(c) => {
                if (c.status === 'published') {
                  toast.info(`Unpublishing: ${c.title}`);
                } else {
                  toast.success(`Publishing: ${c.title}`);
                }
              }}
              actionLabel={course.status === 'published' ? 'Unpublish' : 'Publish'}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
