import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/tables/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  course_count: number;
  status: 'active' | 'inactive';
  created_at: string;
}

// Mock data
const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Web Development',
    description: 'Learn modern web development technologies including HTML, CSS, JavaScript, and frameworks',
    slug: 'web-development',
    course_count: 24,
    status: 'active',
    created_at: '2024-01-15',
  },
  {
    id: '2',
    name: 'Data Science',
    description: 'Master data analysis, machine learning, and AI technologies',
    slug: 'data-science',
    course_count: 18,
    status: 'active',
    created_at: '2024-01-20',
  },
  {
    id: '3',
    name: 'Mobile Development',
    description: 'Build native and cross-platform mobile applications',
    slug: 'mobile-development',
    course_count: 12,
    status: 'active',
    created_at: '2024-02-05',
  },
  {
    id: '4',
    name: 'UI/UX Design',
    description: 'Create beautiful and user-friendly interfaces',
    slug: 'ui-ux-design',
    course_count: 8,
    status: 'active',
    created_at: '2024-02-10',
  },
  {
    id: '5',
    name: 'Cloud Computing',
    description: 'Learn AWS, Azure, GCP and cloud architecture',
    slug: 'cloud-computing',
    course_count: 0,
    status: 'inactive',
    created_at: '2024-03-01',
  },
];

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [viewCategory, setViewCategory] = useState<Category | null>(null);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    slug: '',
    status: 'active' as 'active' | 'inactive',
  });

  const [addForm, setAddForm] = useState({
    name: '',
    description: '',
    slug: '',
    status: 'active' as 'active' | 'inactive',
  });

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleAddCategory = () => {
    if (!addForm.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    const slug = addForm.slug || generateSlug(addForm.name);

    // Check if slug already exists
    if (categories.some(c => c.slug === slug)) {
      toast.error('A category with this slug already exists');
      return;
    }

    const newCategory: Category = {
      id: String(categories.length + 1),
      name: addForm.name.trim(),
      description: addForm.description.trim(),
      slug,
      course_count: 0,
      status: addForm.status,
      created_at: new Date().toISOString().split('T')[0],
    };

    setCategories([...categories, newCategory]);
    toast.success('Category created successfully!');
    setAddCategoryOpen(false);
    setAddForm({ name: '', description: '', slug: '', status: 'active' });
  };

  const handleEditSubmit = () => {
    if (!editCategory) return;

    if (!editForm.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    const slug = editForm.slug || generateSlug(editForm.name);

    // Check if slug already exists (excluding current category)
    if (categories.some(c => c.slug === slug && c.id !== editCategory.id)) {
      toast.error('A category with this slug already exists');
      return;
    }

    setCategories(categories.map(c =>
      c.id === editCategory.id
        ? {
            ...c,
            name: editForm.name.trim(),
            description: editForm.description.trim(),
            slug,
            status: editForm.status,
          }
        : c
    ));

    toast.success('Category updated successfully!');
    setEditCategory(null);
  };

  const handleDeleteCategory = () => {
    if (!deleteCategoryId) return;

    const category = categories.find(c => c.id === deleteCategoryId);
    if (category && category.course_count > 0) {
      toast.error(`Cannot delete category with ${category.course_count} courses. Please reassign courses first.`);
      setDeleteCategoryId(null);
      return;
    }

    setCategories(categories.filter(c => c.id !== deleteCategoryId));
    toast.success('Category deleted successfully!');
    setDeleteCategoryId(null);
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'slug', label: 'Slug' },
    { key: 'description', label: 'Description' },
    {
      key: 'course_count',
      label: 'Courses',
      render: (value: number) => (
        <Badge variant="secondary">{value} courses</Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge variant={value === 'active' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      ),
    },
    { key: 'created_at', label: 'Created' },
  ];

  const actions = [
    {
      label: 'View',
      onClick: (category: Category) => setViewCategory(category),
    },
    {
      label: 'Edit',
      onClick: (category: Category) => {
        setEditCategory(category);
        setEditForm({
          name: category.name,
          description: category.description,
          slug: category.slug,
          status: category.status,
        });
      },
    },
    {
      label: 'Delete',
      onClick: (category: Category) => setDeleteCategoryId(category.id),
      variant: 'destructive' as const,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Category Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage course categories and organize your content
            </p>
          </div>
          <Button onClick={() => setAddCategoryOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

        <DataTable 
          columns={columns} 
          data={categories} 
          actions={actions}
          searchKeys={['name', 'slug', 'description']}
          searchPlaceholder="Search categories..."
          filters={[
            {
              key: 'status',
              label: 'Status',
              options: [
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ],
            },
          ]}
        />

        {/* View Category Dialog */}
        <Dialog open={!!viewCategory} onOpenChange={() => setViewCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Category Details</DialogTitle>
              <DialogDescription>View category information</DialogDescription>
            </DialogHeader>
            {viewCategory && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-sm font-semibold">{viewCategory.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Slug</p>
                  <p className="text-sm">{viewCategory.slug}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm">{viewCategory.description || 'No description'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Number of Courses</p>
                  <Badge variant="secondary">{viewCategory.course_count} courses</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={viewCategory.status === 'active' ? 'default' : 'secondary'}>
                    {viewCategory.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p className="text-sm">{viewCategory.created_at}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Category Dialog */}
        <Dialog open={addCategoryOpen} onOpenChange={setAddCategoryOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>Create a new course category</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="add_name">Name*</Label>
                <Input
                  id="add_name"
                  value={addForm.name}
                  onChange={(e) => {
                    setAddForm({ 
                      ...addForm, 
                      name: e.target.value,
                      slug: addForm.slug || generateSlug(e.target.value)
                    });
                  }}
                  placeholder="e.g., Web Development"
                />
              </div>
              <div>
                <Label htmlFor="add_slug">Slug*</Label>
                <Input
                  id="add_slug"
                  value={addForm.slug}
                  onChange={(e) => setAddForm({ ...addForm, slug: e.target.value })}
                  placeholder="e.g., web-development"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Auto-generated from name if left empty
                </p>
              </div>
              <div>
                <Label htmlFor="add_description">Description</Label>
                <Textarea
                  id="add_description"
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  placeholder="Brief description of this category"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="add_status">Status</Label>
                <select
                  id="add_status"
                  className="w-full border rounded-md p-2"
                  value={addForm.status}
                  onChange={(e) => setAddForm({ ...addForm, status: e.target.value as 'active' | 'inactive' })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setAddCategoryOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCategory}>Create Category</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog open={!!editCategory} onOpenChange={() => setEditCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>Update category information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_name">Name*</Label>
                <Input
                  id="edit_name"
                  value={editForm.name}
                  onChange={(e) => {
                    setEditForm({ 
                      ...editForm, 
                      name: e.target.value,
                      slug: editForm.slug || generateSlug(e.target.value)
                    });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="edit_slug">Slug*</Label>
                <Input
                  id="edit_slug"
                  value={editForm.slug}
                  onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_description">Description</Label>
                <Textarea
                  id="edit_description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit_status">Status</Label>
                <select
                  id="edit_status"
                  className="w-full border rounded-md p-2"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'active' | 'inactive' })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditCategory(null)}>
                  Cancel
                </Button>
                <Button onClick={handleEditSubmit}>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteCategoryId} onOpenChange={() => setDeleteCategoryId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the category.
                {categories.find(c => c.id === deleteCategoryId)?.course_count! > 0 && (
                  <span className="block mt-2 text-destructive font-medium">
                    Warning: This category has associated courses. Please reassign them first.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteCategory}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
