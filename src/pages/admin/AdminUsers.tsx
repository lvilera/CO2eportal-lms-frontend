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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';

type UserRole = 'admin' | 'instructor' | 'student';

interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  date_of_birth: string;
  role: UserRole;
  status: string;
  created_at: string;
}

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@edulearn.com',
    username: 'admin',
    first_name: 'John',
    last_name: 'Admin',
    full_name: 'John Admin',
    date_of_birth: '1985-05-15',
    role: 'admin',
    status: 'active',
    created_at: '2024-01-15',
  },
  {
    id: '2',
    email: 'instructor@edulearn.com',
    username: 'instructor1',
    first_name: 'Sarah',
    last_name: 'Teacher',
    full_name: 'Sarah Teacher',
    date_of_birth: '1990-08-22',
    role: 'instructor',
    status: 'active',
    created_at: '2024-02-10',
  },
  {
    id: '3',
    email: 'student@edulearn.com',
    username: 'student1',
    first_name: 'Mike',
    last_name: 'Student',
    full_name: 'Mike Student',
    date_of_birth: '2000-03-10',
    role: 'student',
    status: 'active',
    created_at: '2024-03-05',
  },
];

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [addUserOpen, setAddUserOpen] = useState(false);
  
  const [editForm, setEditForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    full_name: '',
    date_of_birth: '',
    role: 'student' as UserRole,
  });

  const [addUserForm, setAddUserForm] = useState({
    email: '',
    password: '',
    username: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    role: 'student' as UserRole,
  });

  const handleAddUser = () => {
    if (!addUserForm.email || !addUserForm.password || !addUserForm.username || 
        !addUserForm.first_name || !addUserForm.last_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newUser: User = {
      id: String(users.length + 1),
      email: addUserForm.email,
      username: addUserForm.username,
      first_name: addUserForm.first_name,
      last_name: addUserForm.last_name,
      full_name: `${addUserForm.first_name} ${addUserForm.last_name}`,
      date_of_birth: addUserForm.date_of_birth,
      role: addUserForm.role,
      status: 'active',
      created_at: new Date().toISOString().split('T')[0],
    };

    setUsers([...users, newUser]);
    toast.success('User created successfully!');
    setAddUserOpen(false);
    setAddUserForm({
      email: '',
      password: '',
      username: '',
      first_name: '',
      last_name: '',
      date_of_birth: '',
      role: 'student',
    });
  };

  const handleEditSubmit = () => {
    if (!editUser) return;

    if (!editForm.username || !editForm.first_name || !editForm.last_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    const fullName = `${editForm.first_name} ${editForm.last_name}`;

    setUsers(users.map(u => 
      u.id === editUser.id 
        ? {
            ...u,
            username: editForm.username,
            first_name: editForm.first_name,
            last_name: editForm.last_name,
            full_name: fullName,
            date_of_birth: editForm.date_of_birth,
            role: editForm.role,
          }
        : u
    ));

    toast.success('User updated successfully!');
    setEditUser(null);
  };

  const handleDeleteUser = () => {
    if (!deleteUserId) return;
    
    setUsers(users.filter(u => u.id !== deleteUserId));
    toast.success('User deleted successfully!');
    setDeleteUserId(null);
  };

  const columns = [
    { key: 'username', label: 'Username' },
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (value: string) => (
        <Badge variant={
          value === 'admin' ? 'default' : 
          value === 'instructor' ? 'secondary' : 
          'outline'
        }>
          {value}
        </Badge>
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
      onClick: (user: User) => setViewUser(user),
    },
    {
      label: 'Edit',
      onClick: (user: User) => {
        setEditUser(user);
        setEditForm({
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          full_name: user.full_name,
          date_of_birth: user.date_of_birth,
          role: user.role,
        });
      },
    },
    {
      label: 'Delete',
      onClick: (user: User) => setDeleteUserId(user.id),
      variant: 'destructive' as const,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage system users and their roles
            </p>
          </div>
          <Button onClick={() => setAddUserOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        <DataTable columns={columns} data={users} actions={actions} />

        {/* View User Dialog */}
        <Dialog open={!!viewUser} onOpenChange={() => setViewUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>View user information</DialogDescription>
            </DialogHeader>
            {viewUser && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{viewUser.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Username</p>
                  <p className="text-sm">{viewUser.username}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="text-sm">{viewUser.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">First Name</p>
                  <p className="text-sm">{viewUser.first_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Name</p>
                  <p className="text-sm">{viewUser.last_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                  <p className="text-sm">{viewUser.date_of_birth || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Role</p>
                  <Badge>{viewUser.role}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={viewUser.status === 'active' ? 'default' : 'secondary'}>
                    {viewUser.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p className="text-sm">{viewUser.created_at}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add User Dialog */}
        <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="add_email">Email*</Label>
                <Input
                  id="add_email"
                  type="email"
                  value={addUserForm.email}
                  onChange={(e) => setAddUserForm({ ...addUserForm, email: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <Label htmlFor="add_password">Password*</Label>
                <Input
                  id="add_password"
                  type="password"
                  value={addUserForm.password}
                  onChange={(e) => setAddUserForm({ ...addUserForm, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              <div>
                <Label htmlFor="add_username">Username*</Label>
                <Input
                  id="add_username"
                  value={addUserForm.username}
                  onChange={(e) => setAddUserForm({ ...addUserForm, username: e.target.value })}
                  placeholder="username"
                />
              </div>
              <div>
                <Label htmlFor="add_first_name">First Name*</Label>
                <Input
                  id="add_first_name"
                  value={addUserForm.first_name}
                  onChange={(e) => setAddUserForm({ ...addUserForm, first_name: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="add_last_name">Last Name*</Label>
                <Input
                  id="add_last_name"
                  value={addUserForm.last_name}
                  onChange={(e) => setAddUserForm({ ...addUserForm, last_name: e.target.value })}
                  placeholder="Doe"
                />
              </div>
              <div>
                <Label htmlFor="add_date_of_birth">Date of Birth</Label>
                <Input
                  id="add_date_of_birth"
                  type="date"
                  value={addUserForm.date_of_birth}
                  onChange={(e) => setAddUserForm({ ...addUserForm, date_of_birth: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="add_role">Role*</Label>
                <Select
                  value={addUserForm.role}
                  onValueChange={(value: UserRole) => setAddUserForm({ ...addUserForm, role: value })}
                >
                  <SelectTrigger id="add_role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setAddUserOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUser}>Create User</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_username">Username*</Label>
                <Input
                  id="edit_username"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_first_name">First Name*</Label>
                <Input
                  id="edit_first_name"
                  value={editForm.first_name}
                  onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_last_name">Last Name*</Label>
                <Input
                  id="edit_last_name"
                  value={editForm.last_name}
                  onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_full_name">Full Name</Label>
                <Input
                  id="edit_full_name"
                  value={`${editForm.first_name} ${editForm.last_name}`}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="edit_date_of_birth">Date of Birth</Label>
                <Input
                  id="edit_date_of_birth"
                  type="date"
                  value={editForm.date_of_birth}
                  onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_role">Role*</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(value: UserRole) => setEditForm({ ...editForm, role: value })}
                >
                  <SelectTrigger id="edit_role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditUser(null)}>
                  Cancel
                </Button>
                <Button onClick={handleEditSubmit}>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
