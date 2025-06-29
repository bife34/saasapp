
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

const poolRecordFormSchema = z.object({
  ph: z.coerce.number().min(0, 'pH must be positive.'),
  cl: z.coerce.number().min(0, 'Chlorine must be positive.'),
  chlorine_type: z.enum(['liquid', 'tablets', 'granular', 'other']),
  chlorine_quantity: z.coerce.number().optional(),
  flocculant_type: z.string().optional(),
  flocculant_quantity: z.coerce.number().optional(),
  salt_quantity: z.coerce.number().optional(),
  acid_quantity: z.coerce.number().optional(),
  ph_plus_quantity: z.coerce.number().optional(),
  ph_minus_quantity: z.coerce.number().optional(),
  algaecide_quantity: z.coerce.number().optional(),
  chlorine_tablets_quantity: z.coerce.number().optional(),

  vacuumed: z.boolean().default(false),
  brushed: z.boolean().default(false),
  leaves_cleaned: z.boolean().default(false),
  
  overall_state: z.enum(['Excellent', 'Good', 'Fair', 'Poor']),
  weather_status: z.enum(['Sunny', 'Cloudy', 'Rainy', 'Stormy']),
});


export type PoolRecordFormData = z.infer<typeof poolRecordFormSchema>;

interface PoolRecordFormProps {
  poolName: string;
  onSubmit: (data: PoolRecordFormData) => void;
  onCancel: () => void;
}

export function PoolRecordForm({ poolName, onSubmit, onCancel }: PoolRecordFormProps) {
  const form = useForm<PoolRecordFormData>({
    resolver: zodResolver(poolRecordFormSchema),
    defaultValues: {
      ph: 7.4,
      cl: 1.5,
      chlorine_type: 'tablets',
      vacuumed: false,
      brushed: false,
      leaves_cleaned: false,
      overall_state: 'Good',
      weather_status: 'Sunny',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ScrollArea className="h-[60vh] pr-6">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">Water Chemistry</h3>
                    <p className="text-sm text-muted-foreground">Record the chemical levels and additions.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="ph" render={({ field }) => (
                        <FormItem><FormLabel>pH Level</FormLabel><FormControl><Input type="number" step="0.1" placeholder="7.4" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="cl" render={({ field }) => (
                        <FormItem><FormLabel>Chlorine Level (ppm)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="1.5" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <FormField control={form.control} name="chlorine_type" render={({ field }) => (
                    <FormItem><FormLabel>Chlorine Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select chlorine type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="liquid">Liquid</SelectItem><SelectItem value="tablets">Tablets</SelectItem><SelectItem value="granular">Granular</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />

                <h4 className="text-md font-medium">Chemicals Added (Quantity)</h4>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="chlorine_quantity" render={({ field }) => (
                        <FormItem><FormLabel>Chlorine</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="chlorine_tablets_quantity" render={({ field }) => (
                        <FormItem><FormLabel>Chlorine Tablets</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="salt_quantity" render={({ field }) => (
                        <FormItem><FormLabel>Salt</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="acid_quantity" render={({ field }) => (
                        <FormItem><FormLabel>Acid</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="ph_plus_quantity" render={({ field }) => (
                        <FormItem><FormLabel>pH Plus</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="ph_minus_quantity" render={({ field }) => (
                        <FormItem><FormLabel>pH Minus</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="algaecide_quantity" render={({ field }) => (
                        <FormItem><FormLabel>Algaecide</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="flocculant_quantity" render={({ field }) => (
                        <FormItem><FormLabel>Flocculant</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="flocculant_type" render={({ field }) => (
                        <FormItem><FormLabel>Flocculant Type</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                
                <Separator />
                <div>
                    <h3 className="text-lg font-medium">Maintenance Actions</h3>
                    <p className="text-sm text-muted-foreground">Log the physical cleaning tasks performed.</p>
                </div>
                 <div className="space-y-4">
                    <FormField control={form.control} name="vacuumed" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><FormLabel>Pool Vacuumed</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                    )} />
                     <FormField control={form.control} name="brushed" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><FormLabel>Walls Brushed</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="leaves_cleaned" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><FormLabel>Leaves Cleaned</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                    )} />
                </div>
                
                <Separator />
                <div>
                    <h3 className="text-lg font-medium">General State</h3>
                    <p className="text-sm text-muted-foreground">Record the overall condition.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="overall_state" render={({ field }) => (
                        <FormItem><FormLabel>Overall State</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Excellent">Excellent</SelectItem><SelectItem value="Good">Good</SelectItem><SelectItem value="Fair">Fair</SelectItem><SelectItem value="Poor">Poor</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="weather_status" render={({ field }) => (
                        <FormItem><FormLabel>Weather</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Sunny">Sunny</SelectItem><SelectItem value="Cloudy">Cloudy</SelectItem><SelectItem value="Rainy">Rainy</SelectItem><SelectItem value="Stormy">Stormy</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                    )} />
                </div>
            </div>
        </ScrollArea>
        <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Save Record</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
