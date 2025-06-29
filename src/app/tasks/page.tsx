

'use client';

import { useState, useMemo } from 'react';
import { useCurrentUser } from '@/components/app-layout';
import { Task, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
import { MoreHorizontal, PlusCircle, Trash2, Pencil, Clock, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { TaskForm, TaskFormData } from '@/components/task-form';

// Main Page Component
export default function TasksPage() {
  const { currentUser, allUsers, allTasks, setTasks } = useCurrentUser();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  if (!currentUser) return null;

  // --- Common Logic ---
  const handleToggleTask = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, is_completed: !task.is_completed } : task
      )
    );
  };
  
  const handleNewTask = () => {
    setSelectedTask(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteAlertOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (taskToDelete) {
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      toast({ title: 'Task Deleted' });
      setIsDeleteAlertOpen(false);
      setTaskToDelete(null);
    }
  };
  
  const handleSaveTask = (data: TaskFormData) => {
    const techId = currentUser.role === 'Admin' ? data.technicianId : currentUser.id;
    const allCompanyUsers = allUsers.filter(u => u.companyId === currentUser.companyId);
    const tech = allCompanyUsers.find(t => t.id === techId);
    if (!tech) return;

    if (selectedTask) {
      // Update
      setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, ...data, technicianId: tech.id, technicianName: tech.name } : t));
      toast({ title: "Task Updated" });
    } else {
      // Create
      const newTask: Task = {
        id: crypto.randomUUID(),
        companyId: currentUser.companyId!,
        created_at: new Date().toISOString(),
        is_completed: false,
        ...data,
        technicianId: tech.id,
        technicianName: tech.name,
      };
      setTasks(prev => [...prev, newTask]);
      toast({ title: "Task Created" });
    }
    setIsFormOpen(false);
    setSelectedTask(null);
  };

  // --- Admin Logic ---
  const companyTechnicians = useMemo(
    () =>
      currentUser.role === 'Admin'
        ? allUsers.filter(
            (u) => u.companyId === currentUser.companyId && u.role === 'Technician'
          )
        : [],
    [allUsers, currentUser]
  );
  
  const tasksByTechnician = useMemo(() => {
    if (currentUser.role !== 'Admin') return {};
    return allTasks
      .filter(t => t.companyId === currentUser.companyId)
      .reduce((acc, task) => {
        (acc[task.technicianId] = acc[task.technicianId] || []).push(task);
        return acc;
      }, {} as Record<string, Task[]>);
  }, [allTasks, currentUser]);

  // --- Technician Logic ---
  const technicianTasks = useMemo(
    () =>
      currentUser.role === 'Technician'
        ? allTasks.filter((t) => t.technicianId === currentUser.id)
        : [],
    [allTasks, currentUser]
  );
  const todoTasks = technicianTasks.filter((t) => !t.is_completed);
  const completedTasks = technicianTasks.filter((t) => t.is_completed);

  // --- Render Logic ---
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Today's Tasks</CardTitle>
              <CardDescription>
                {currentUser.role === 'Admin'
                  ? "Manage and assign tasks to your technicians."
                  : "Your assigned tasks for today."}
              </CardDescription>
            </div>
             {(currentUser.role === 'Admin' || currentUser.role === 'Technician') && (
              <Button onClick={handleNewTask}>
                <PlusCircle className="mr-2" /> New Task
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* ADMIN VIEW */}
          {currentUser.role === 'Admin' && (
            <Accordion type="multiple" className="w-full">
              {companyTechnicians.map((tech) => (
                <AccordionItem key={tech.id} value={`tech-${tech.id}`}>
                  <AccordionTrigger className="text-lg">
                    {tech.name}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {(tasksByTechnician[tech.id] || []).length > 0 ? (
                        (tasksByTechnician[tech.id] || []).map((task) => (
                           <div key={task.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                            <div className="flex flex-col">
                              <Label
                                htmlFor={`task-${task.id}`}
                                className={task.is_completed ? "line-through text-muted-foreground" : ""}
                              >
                                {task.description}
                              </Label>
                                {(task.due_time || task.has_alert) && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                        {task.due_time && <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {task.due_time}</div>}
                                        {task.has_alert && <Bell className="h-3 w-3 text-primary" />}
                                    </div>
                                )}
                            </div>
                             <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                  <Pencil className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteRequest(task)}>
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))
                      ) : (
                        <p className="p-2 text-sm text-muted-foreground">No tasks assigned.</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          {/* TECHNICIAN VIEW */}
          {currentUser.role === 'Technician' && (
            <div className="grid gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">To-Do</h3>
                <div className="space-y-3">
                  {todoTasks.length > 0 ? todoTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border">
                       <div className="flex items-center space-x-3">
                        <Checkbox id={`task-${task.id}`} checked={task.is_completed} onCheckedChange={() => handleToggleTask(task.id)} />
                        <div className="flex flex-col">
                            <Label htmlFor={`task-${task.id}`} className="text-base font-normal">
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleEditTask(task)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteRequest(task)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )) : (
                    <p className="text-muted-foreground">No pending tasks. Great job!</p>
                  )}
                </div>
              </div>
              
              <Separator />

              <div>
                <h3 className="text-xl font-semibold mb-4">Completed</h3>
                 <div className="space-y-3">
                  {completedTasks.length > 0 ? completedTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <Checkbox id={`task-${task.id}`} checked={task.is_completed} onCheckedChange={() => handleToggleTask(task.id)} />
                        <div className="flex flex-col">
                            <Label htmlFor={`task-${task.id}`} className="text-base font-normal text-muted-foreground line-through">
                            {task.description}
                            </Label>
                             {(task.due_time || task.has_alert) && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 line-through">
                                    {task.due_time && <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {task.due_time}</div>}
                                </div>
                            )}
                        </div>
                      </div>
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleEditTask(task)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteRequest(task)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )) : (
                     <p className="text-muted-foreground">No tasks completed yet today.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DIALOGS */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            <DialogDescription>
              {currentUser.role === 'Admin'
                ? (selectedTask ? 'Update the task details.' : 'Assign a new task to a technician.')
                : (selectedTask ? 'Update your task.' : 'Add a new task for yourself.')
              }
            </DialogDescription>
          </DialogHeader>
          <TaskForm
            technicians={companyTechnicians}
            task={selectedTask}
            onSubmit={handleSaveTask}
            onCancel={() => setIsFormOpen(false)}
            currentUser={currentUser}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
