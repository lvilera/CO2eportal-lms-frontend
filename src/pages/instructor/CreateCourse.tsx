import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Plus, Trash2, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  duration: number;
  content?: string;
}

export default function CreateCourse() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  
  const [courseData, setCourseData] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: '',
    price: '',
    isFree: false,
    thumbnail: null as File | null,
  });

  const [modules, setModules] = useState<Module[]>([
    {
      id: '1',
      title: 'Introduction',
      description: 'Getting started with the course',
      lessons: [],
    },
  ]);

  const [currentModule, setCurrentModule] = useState(0);

  const addModule = () => {
    setModules([
      ...modules,
      {
        id: String(modules.length + 1),
        title: `Module ${modules.length + 1}`,
        description: '',
        lessons: [],
      },
    ]);
  };

  const removeModule = (index: number) => {
    if (modules.length === 1) {
      toast.error('Course must have at least one module');
      return;
    }
    setModules(modules.filter((_, i) => i !== index));
    if (currentModule >= modules.length - 1) {
      setCurrentModule(Math.max(0, modules.length - 2));
    }
  };

  const updateModule = (index: number, field: keyof Module, value: string) => {
    const newModules = [...modules];
    newModules[index] = { ...newModules[index], [field]: value };
    setModules(newModules);
  };

  const addLesson = () => {
    const newModules = [...modules];
    newModules[currentModule].lessons.push({
      id: String(Date.now()),
      title: `Lesson ${newModules[currentModule].lessons.length + 1}`,
      type: 'video',
      duration: 10,
    });
    setModules(newModules);
  };

  const removeLesson = (lessonIndex: number) => {
    const newModules = [...modules];
    newModules[currentModule].lessons = newModules[currentModule].lessons.filter(
      (_, i) => i !== lessonIndex
    );
    setModules(newModules);
  };

  const updateLesson = (lessonIndex: number, field: keyof Lesson, value: any) => {
    const newModules = [...modules];
    newModules[currentModule].lessons[lessonIndex] = {
      ...newModules[currentModule].lessons[lessonIndex],
      [field]: value,
    };
    setModules(newModules);
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setCourseData({ ...courseData, thumbnail: file });
      toast.success('Thumbnail uploaded successfully');
    }
  };

  const handleSaveDraft = () => {
    if (!courseData.title.trim()) {
      toast.error('Please enter a course title');
      return;
    }
    toast.success('Course saved as draft');
  };

  const handlePublish = () => {
    if (!courseData.title.trim() || !courseData.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (modules.length === 0) {
      toast.error('Please add at least one module');
      return;
    }
    toast.success('Course published successfully!');
    navigate('/instructor/courses');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/instructor/courses')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Create New Course</h1>
              <p className="text-muted-foreground mt-1">
                Build an engaging learning experience
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveDraft}>
              Save Draft
            </Button>
            <Button onClick={handlePublish}>
              Publish Course
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="content">Course Content</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
                <CardDescription>Provide basic information about your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Course Title*</Label>
                  <Input
                    id="title"
                    value={courseData.title}
                    onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                    placeholder="e.g., Complete Web Development Bootcamp"
                  />
                </div>
                <div>
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={courseData.subtitle}
                    onChange={(e) => setCourseData({ ...courseData, subtitle: e.target.value })}
                    placeholder="A short tagline for your course"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={courseData.description}
                    onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                    placeholder="What will students learn in this course?"
                    rows={6}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category*</Label>
                  <select
                    id="category"
                    className="w-full border rounded-md p-2"
                    value={courseData.category}
                    onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}
                  >
                    <option value="">Select a category</option>
                    <option value="web-development">Web Development</option>
                    <option value="data-science">Data Science</option>
                    <option value="mobile-development">Mobile Development</option>
                    <option value="ui-ux-design">UI/UX Design</option>
                    <option value="cloud-computing">Cloud Computing</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="thumbnail">Course Thumbnail</Label>
                  <div className="mt-2">
                    <label htmlFor="thumbnail" className="cursor-pointer">
                      <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          {courseData.thumbnail
                            ? courseData.thumbnail.name
                            : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    </label>
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleThumbnailUpload}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Course Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Course Structure</CardTitle>
                    <CardDescription>Organize your course into modules and lessons</CardDescription>
                  </div>
                  <Button onClick={addModule} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Module
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-12 gap-6">
                  {/* Module List */}
                  <div className="col-span-4 space-y-2">
                    {modules.map((module, index) => (
                      <div
                        key={module.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          currentModule === index
                            ? 'bg-primary/10 border-primary'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setCurrentModule(index)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              <h4 className="font-medium">{module.title}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {module.lessons.length} lessons
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeModule(index);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Module Details */}
                  <div className="col-span-8 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Module Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Module Title</Label>
                          <Input
                            value={modules[currentModule]?.title || ''}
                            onChange={(e) =>
                              updateModule(currentModule, 'title', e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={modules[currentModule]?.description || ''}
                            onChange={(e) =>
                              updateModule(currentModule, 'description', e.target.value)
                            }
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Lessons</CardTitle>
                          <Button onClick={addLesson} size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Lesson
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {modules[currentModule]?.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className="p-4 rounded-lg border bg-card space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1">
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  <Input
                                    value={lesson.title}
                                    onChange={(e) =>
                                      updateLesson(lessonIndex, 'title', e.target.value)
                                    }
                                    className="flex-1"
                                  />
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeLesson(lessonIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs">Type</Label>
                                  <select
                                    className="w-full border rounded-md p-2 text-sm"
                                    value={lesson.type}
                                    onChange={(e) =>
                                      updateLesson(
                                        lessonIndex,
                                        'type',
                                        e.target.value as Lesson['type']
                                      )
                                    }
                                  >
                                    <option value="video">Video</option>
                                    <option value="text">Text</option>
                                    <option value="quiz">Quiz</option>
                                    <option value="assignment">Assignment</option>
                                  </select>
                                </div>
                                <div>
                                  <Label className="text-xs">Duration (min)</Label>
                                  <Input
                                    type="number"
                                    value={lesson.duration}
                                    onChange={(e) =>
                                      updateLesson(
                                        lessonIndex,
                                        'duration',
                                        parseInt(e.target.value)
                                      )
                                    }
                                    className="text-sm"
                                  />
                                </div>
                              </div>
                              {lesson.type === 'video' && (
                                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                                  <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                                  <p className="text-xs text-muted-foreground">
                                    Upload video file
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                          {modules[currentModule]?.lessons.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              <p>No lessons yet. Click "Add Lesson" to get started.</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Pricing</CardTitle>
                <CardDescription>Set the price for your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    id="isFree"
                    checked={courseData.isFree}
                    onChange={(e) =>
                      setCourseData({ ...courseData, isFree: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isFree">Make this course free</Label>
                </div>
                {!courseData.isFree && (
                  <div>
                    <Label htmlFor="price">Price (USD)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={courseData.price}
                      onChange={(e) => setCourseData({ ...courseData, price: e.target.value })}
                      placeholder="49.99"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Settings</CardTitle>
                <CardDescription>Configure additional course options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Course Status</Label>
                  <select className="w-full border rounded-md p-2">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div>
                  <Label>Enrollment Limit</Label>
                  <Input type="number" placeholder="Leave empty for unlimited" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <input type="checkbox" id="certificate" className="h-4 w-4" />
                    <Label htmlFor="certificate">Award certificate upon completion</Label>
                  </div>
                  <div className="flex items-center gap-4">
                    <input type="checkbox" id="comments" className="h-4 w-4" defaultChecked />
                    <Label htmlFor="comments">Enable student comments</Label>
                  </div>
                  <div className="flex items-center gap-4">
                    <input type="checkbox" id="qa" className="h-4 w-4" defaultChecked />
                    <Label htmlFor="qa">Enable Q&A section</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
