
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pool, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DialogFooter } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { ImageUpload } from './image-upload';
import { Checkbox } from './ui/checkbox';

const userFormSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  role: z.enum(['Superadmin', 'Admin', 'Technician', 'Client']),
  status: z.enum(['Active', 'Invited', 'Inactive']),
  avatar: z.string().optional(),
  accessible_pool_ids: z.array(z.string()).optional(),
  password: z.string().optional(),
});

export type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user?: User | null;
  pools: Pick<Pool, 'id' | 'pool_name'>[];
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  currentUserRole?: User['role'];
}

export function UserForm({ user, pools, onSubmit, onCancel, currentUserRole }: UserFormProps) {
  const isNewUser = !user;
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema.refine((data) => !isNewUser || (data.password && data.password.length >= 8), {
        message: 'A temporary password of at least 8 characters is required.',
        path: ['password'],
    })),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || 'Technician',
      status: user ? user.status : 'Active',
      avatar: user?.avatar || '',
      accessible_pool_ids: user?.accessible_pool_ids || [],
      password: '',
    },
  });

  const watchRole = form.watch('role');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ScrollArea className="h-[60vh] pr-6">
          <div className="space-y-6">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g., Alex Johnson" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="alex.j@propools.com" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="avatar" render={({ field }) => (
                <FormItem><FormLabel>Avatar</FormLabel><FormControl><ImageUpload value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
            )} />

            {isNewUser && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temporary Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Set temporary password" {...field} />
                    </FormControl>
                    <FormDescription>
                      The user will be prompted to change this on first login.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="role" render={({ field }) => (
                    <FormItem><FormLabel>Role</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl><SelectContent>
                      {(currentUserRole === 'Superadmin' || currentUserRole === 'Admin') && <SelectItem value="Admin">Admin</SelectItem>}
                      <SelectItem value="Technician">Technician</SelectItem>
                      <SelectItem value="Client">Client</SelectItem>
                      </SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isNewUser}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Invited">Invited</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      {isNewUser && (
                        <FormDescription>
                          New users are automatically set to 'Active'.
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                )} />
            </div>

            {(watchRole === 'Client' || watchRole === 'Technician') && (
              <FormField
                control={form.control}
                name="accessible_pool_ids"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Accessible Pools</FormLabel>
                      <FormDescription>
                        Select the pools this user can access.
                      </FormDescription>
                    </div>
                    <div className="space-y-2 rounded-md border p-4">
                      {pools.map((pool) => (
                         <FormField
                          key={pool.id}
                          control={form.control}
                          name="accessible_pool_ids"
                          render={({ field }) => {
                            return (
                              <FormItem
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(pool.id)}
                                    onCheckedChange={(checked) => {
                                      const currentValue = field.value || [];
                                      return checked
                                        ? field.onChange([...currentValue, pool.id])
                                        : field.onChange(
                                            currentValue.filter(
                                              (value) => value !== pool.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {pool.pool_name}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Save User</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
