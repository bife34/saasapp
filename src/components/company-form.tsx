
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { DialogFooter } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

const companyFormSchema = z.object({
  companyName: z.string().min(1, 'Company name is required.'),
  adminName: z.string().min(1, 'Admin name is required.'),
  adminEmail: z.string().email('Invalid email address.'),
  adminPassword: z.string().min(8, 'Temporary password must be at least 8 characters.'),
});

export type CompanyFormData = z.infer<typeof companyFormSchema>;

interface CompanyFormProps {
  onSubmit: (data: CompanyFormData) => void;
  onCancel: () => void;
}

export function CompanyForm({ onSubmit, onCancel }: CompanyFormProps) {
  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
        companyName: '',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ScrollArea className="h-[60vh] pr-6">
          <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Company Details</h3>
            </div>
            <FormField control={form.control} name="companyName" render={({ field }) => (
                <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input placeholder="e.g., Aqua Blue Pools" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            
            <Separator />

            <div>
                <h3 className="text-lg font-medium">Owner Admin Details</h3>
                <p className="text-sm text-muted-foreground">This user will manage the new company.</p>
            </div>
             <FormField control={form.control} name="adminName" render={({ field }) => (
                <FormItem><FormLabel>Admin Full Name</FormLabel><FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="adminEmail" render={({ field }) => (
                <FormItem><FormLabel>Admin Email Address</FormLabel><FormControl><Input type="email" placeholder="jane.d@aquablue.com" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField
                control={form.control}
                name="adminPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temporary Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription>
                      The admin will be prompted to change this on first login.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Create Company</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
