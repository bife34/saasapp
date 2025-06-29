
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Task } from '@/lib/types';
import { Bell, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

interface TasksCardProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  className?: string;
}

export function TasksCard({ tasks, onToggleTask, className }: TasksCardProps) {
  const todoTasks = tasks.filter(t => !t.is_completed).slice(0, 5); // Show up to 5 tasks

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Today's Tasks</CardTitle>
        <CardDescription>
          You have {tasks.filter(t => !t.is_completed).length} pending task(s).
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {todoTasks.length > 0 ? todoTasks.map(task => (
            <div key={task.id} className="flex items-center space-x-3">
                <Checkbox id={`dashboard-task-${task.id}`} checked={task.is_completed} onCheckedChange={() => onToggleTask(task.id)} />
                <div className="flex flex-col">
                    <Label htmlFor={`dashboard-task-${task.id}`} className="text-sm font-medium peer-data-[state=checked]:line-through peer-data-[state=checked]:text-muted-foreground">
                        {task.description}
                    </Label>
                    {(task.due_time || task.has_alert) && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            {task.due_time && <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {task.due_time}</div>}
                            {task.has_alert && <Bell className="h-3 w-3 text-primary" />}
                        </div>
                    )}
                </div>
            </div>
        )) : (
            <p className="text-sm text-muted-foreground text-center py-4">No pending tasks. Great job!</p>
        )}
      </CardContent>
       <CardFooter>
          <Button asChild variant="link" className="w-full">
              <Link href="/tasks">Manage All Tasks</Link>
          </Button>
      </CardFooter>
    </Card>
  );
}
