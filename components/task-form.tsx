
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Task, User } from '@/lib/types';
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
import { Switch } from './ui/switch';

const taskFormSchema = z.object({
  description: z.string().min(3, 'Task description is required.'),
  technicianId: z.string(),
  due_time: z.string().optional(),
  has_alert: z.boolean().optional(),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  technicians: User[];
  task?: Task | null;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  currentUser: User;
}

export function TaskForm({ technicians, task, onSubmit, onCancel, currentUser }: TaskFormProps) {
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      description: task?.description || '',
      technicianId: task?.technicianId || (currentUser.role === 'Technician' ? currentUser.id : ''),
      due_time: task?.due_time || '',
      has_alert: task?.has_alert || false,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Check filter pressure" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {currentUser.role === 'Admin' && (
          <FormField
            control={form.control}
            name="technicianId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign to Technician</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a technician" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {technicians.map((tech) => (
                      <SelectItem key={tech.id} value={tech.id}>
                        {tech.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="due_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Time (Optional)</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="has_alert"
              render={({ field }) => (
                <FormItem className="flex flex-col pt-2">
                  <FormLabel>Enable Alert</FormLabel>
                   <div className="flex items-center space-x-2 pt-2">
                    <FormControl>
                        <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    <FormDescription>
                        Get a notification.
                    </FormDescription>
                   </div>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Task</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
