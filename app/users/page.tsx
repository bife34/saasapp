
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, PlusCircle, Trash2, Pencil } from 'lucide-react';
import { User } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { UserForm, UserFormData } from '@/components/user-form';
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
import { useToast } from '@/hooks/use-toast';
import { useCurrentUser } from '@/components/app-layout';

export default function UsersPage() {
  const { currentUser, allUsers: users, setUsers, allPools } = useCurrentUser();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { toast } = useToast();

  if (!currentUser) return null;

  const getStatusVariant = (status: User['status']) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Invited':
        return 'secondary';
      case 'Inactive':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getRoleVariant = (role: User['role']) => {
    switch (role) {
      case 'Superadmin':
        return 'destructive';
      case 'Admin':
        return 'destructive';
      case 'Technician':
        return 'default';
      case 'Client':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleNewUser = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (user: User) => {
    setUserToDelete(user);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      setUsers(users.filter((user) => user.id !== userToDelete.id));
      setIsDeleteAlertOpen(false);
      setUserToDelete(null);
    }
  };

  const handleSaveUser = async (data: UserFormData) => {
    if (selectedUser) {
      // Update existing user
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id
            ? { ...u, ...data, password: u.password, forcePasswordChange: u.forcePasswordChange } // Keep old password data
            : u
        )
      );
      toast({
        title: 'User Updated',
        description: `Details for ${data.name} have been updated.`,
      });
    } else {
      // Add new user
      const newUser: User = {
        id: crypto.randomUUID(),
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar,
        accessible_pool_ids: data.accessible_pool_ids,
        status: 'Active',
        last_login: '',
        companyId: currentUser.companyId,
        password: data.password,
        forcePasswordChange: true,
      };
      setUsers([...users, newUser]);

      toast({
        title: 'User Created',
        description: `${data.name} can now log in with their temporary password.`,
      });
    }
    setIsFormOpen(false);
    setSelectedUser(null);
  };
  
  const usersToDisplay = currentUser.role === 'Superadmin' 
    ? users 
    : users.filter(u => u.companyId === currentUser.companyId || u.id === currentUser.id);

  const companyPools = allPools.filter(p => p.companyId === currentUser.companyId);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Manage your team members and their account permissions.
              </CardDescription>
            </div>
            {currentUser.role !== 'Client' && currentUser.role !== 'Technician' && (
              <Button onClick={handleNewUser}>
                <PlusCircle className="mr-2" />
                New User
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersToDisplay.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} data-ai-hint="person" />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.last_login
                      ? `${formatDistanceToNow(new Date(user.last_login))} ago`
                      : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleEditUser(user)} disabled={currentUser.role === 'Client'}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteRequest(user)}
                           disabled={currentUser.role !== 'Superadmin' && currentUser.role !== 'Admin'}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? 'Edit User' : 'Create New User'}
            </DialogTitle>
            <DialogDescription>
              Manage user details, role, and pool access for clients.
            </DialogDescription>
          </DialogHeader>
          <UserForm
            user={selectedUser}
            pools={companyPools}
            onSubmit={handleSaveUser}
            onCancel={() => setIsFormOpen(false)}
            currentUserRole={currentUser.role}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
