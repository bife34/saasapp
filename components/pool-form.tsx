
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pool } from '@/lib/types';
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
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { MapPin, Thermometer } from 'lucide-react';
import { ImageUpload } from './image-upload';
import { useToast } from '@/hooks/use-toast';

const poolFormSchema = z.object({
  pool_name: z.string().min(1, 'Pool name is required.'),
  pool_location: z.string().min(1, 'Location is required.'),
  status: z.enum(['Active', 'Maintenance', 'Closed']),
  pool_picture: z.string().optional(),
  extra_info: z.string().optional(),

  pump: z.object({
    pump_image: z.string().optional(),
    pump_power: z.string().optional(),
    salt_water: z.boolean().default(false),
  }),

  has_heatpump: z.boolean().default(false),
  heatpump: z.object({
    heatpump_image: z.string().optional(),
    heatpump_on: z.boolean().default(false),
    heatpump_temperature: z.coerce.number().optional(),
  }).optional(),

  has_ph_controller: z.boolean().default(false),
  salt_system_model: z.string().optional(),
  salt_system_image: z.string().optional(),
  sand_filter_model: z.string().optional(),
  sand_filter_sand_amount: z.coerce.number().optional(),
  pool_cover: z.enum(['None', 'Manual', 'Automatic']).default('None'),
  
  grouting_type: z.string().optional(),
  tile_image: z.string().optional(),

  loses_water: z.boolean().default(false),
  water_loss_reason: z.string().optional(),
  water_filling_on: z.boolean().default(false),
}).superRefine((data, ctx) => {
    if (data.loses_water && !data.water_loss_reason) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['water_loss_reason'],
            message: 'Reason for water loss is required when the toggle is on.',
        });
    }
});


export type PoolFormData = z.infer<typeof poolFormSchema>;

interface PoolFormProps {
  pool?: Pool | null;
  onSubmit: (data: PoolFormData) => void;
  onCancel: () => void;
}

export function PoolForm({ pool, onSubmit, onCancel }: PoolFormProps) {
  const form = useForm<PoolFormData>({
    resolver: zodResolver(poolFormSchema),
    defaultValues: {
      pool_name: pool?.pool_name || '',
      pool_location: pool?.pool_location || '',
      status: pool?.status || 'Active',
      pool_picture: pool?.pool_picture || '',
      extra_info: pool?.extra_info || '',
      pump: {
        pump_power: pool?.pump.pump_power || '',
        pump_image: pool?.pump.pump_image || '',
        salt_water: pool?.pump.salt_water || false,
      },
      has_heatpump: pool?.has_heatpump || false,
      heatpump: {
        heatpump_on: pool?.heatpump?.heatpump_on || false,
        heatpump_temperature: pool?.heatpump?.heatpump_temperature || undefined,
        heatpump_image: pool?.heatpump?.heatpump_image || '',
      },
      has_ph_controller: pool?.has_ph_controller || false,
      salt_system_model: pool?.salt_system_model || '',
      salt_system_image: pool?.salt_system_image || '',
      sand_filter_model: pool?.sand_filter_model || '',
      sand_filter_sand_amount: pool?.sand_filter_sand_amount || undefined,
      pool_cover: pool?.pool_cover || 'None',
      grouting_type: pool?.grouting_type || '',
      tile_image: pool?.tile_image || '',
      loses_water: pool?.loses_water || false,
      water_loss_reason: pool?.water_loss_reason || '',
      water_filling_on: pool?.water_filling_on || false,
    },
  });

  const { toast } = useToast();
  const watchHasHeatpump = form.watch('has_heatpump');
  const watchLosesWater = form.watch('loses_water');
  const watchWaterFillingOn = form.watch('water_filling_on');
  const watchSaltWater = form.watch('pump.salt_water');
  
  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
        toast({
            variant: 'destructive',
            title: 'Geolocation not supported',
            description: 'Your browser does not support geolocation.',
        });
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            form.setValue('pool_location', `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, { shouldValidate: true });
            toast({
                title: 'Location Fetched',
                description: 'Location set to your current coordinates.',
            });
        },
        () => {
            toast({
                variant: 'destructive',
                title: 'Geolocation Error',
                description: 'Unable to retrieve your location. Please check your browser settings.',
            });
        }
    );
};

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ScrollArea className="h-[60vh] pr-6">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">General</h3>
                    <p className="text-sm text-muted-foreground">Basic information about the pool.</p>
                </div>
                <FormField control={form.control} name="pool_name" render={({ field }) => (
                    <FormItem><FormLabel>Pool Name</FormLabel><FormControl><Input placeholder="e.g., Sunset Resort Pool" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="pool_location" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Location / Address</FormLabel>
                        <div className="relative flex items-center">
                            <FormControl>
                                <Input placeholder="123 Ocean Drive, Miami, FL" {...field} className="pr-10" />
                            </FormControl>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={handleFetchLocation}
                            >
                                <MapPin className="h-4 w-4" />
                                <span className="sr-only">Get Current Location</span>
                            </Button>
                        </div>
                        <FormDescription>
                            Enter an address or click the pin to get your current location.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="pool_picture" render={({ field }) => (
                    <FormItem><FormLabel>Pool Picture</FormLabel><FormControl><ImageUpload value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Maintenance">Maintenance</SelectItem><SelectItem value="Closed">Closed</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="extra_info" render={({ field }) => (
                    <FormItem><FormLabel>Extra Info</FormLabel><FormControl><Textarea placeholder="Notes about the pool..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <Separator />
                <div>
                    <h3 className="text-lg font-medium">Equipment</h3>
                    <p className="text-sm text-muted-foreground">Details about the pool's hardware.</p>
                </div>
                <FormField control={form.control} name="pump.pump_power" render={({ field }) => (
                    <FormItem><FormLabel>Pump Power</FormLabel><FormControl><Input placeholder="e.g., 1.5 HP" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="pump.pump_image" render={({ field }) => (
                    <FormItem><FormLabel>Pump Image</FormLabel><FormControl><ImageUpload value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="pump.salt_water" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Salt Water System</FormLabel><FormDescription>Does this pool use a salt water system?</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                )} />

                {watchSaltWater && <div className="pl-4 border-l-2 ml-4 space-y-4">
                    <FormField control={form.control} name="salt_system_model" render={({ field }) => (
                        <FormItem><FormLabel>Salt System Model</FormLabel><FormControl><Input placeholder="e.g., AquaPure 9000" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="salt_system_image" render={({ field }) => (
                        <FormItem><FormLabel>Salt System Image</FormLabel><FormControl><ImageUpload value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>}

                <FormField control={form.control} name="has_heatpump" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Has Heat Pump</FormLabel><FormDescription>Does this pool have a heat pump?</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                )} />
                {watchHasHeatpump && <div className="pl-4 border-l-2 ml-4 space-y-4">
                    <FormField control={form.control} name="heatpump.heatpump_on" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Heat Pump On</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="heatpump.heatpump_temperature" render={({ field }) => (
                        <FormItem><FormLabel>Heat Pump Temperature (°C)</FormLabel><FormControl><Input type="number" placeholder="28" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="heatpump.heatpump_image" render={({ field }) => (
                        <FormItem><FormLabel>Heat Pump Image</FormLabel><FormControl><ImageUpload value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>}

                 <FormField control={form.control} name="has_ph_controller" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Has pH Controller</FormLabel><FormDescription>Is an automatic pH controller installed?</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                )} />

                <FormField control={form.control} name="sand_filter_model" render={({ field }) => (
                    <FormItem><FormLabel>Sand Filter Model</FormLabel><FormControl><Input placeholder="e.g., ProSeries S244T" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="sand_filter_sand_amount" render={({ field }) => (
                    <FormItem><FormLabel>Sand Amount (kg)</FormLabel><FormControl><Input type="number" placeholder="150" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="pool_cover" render={({ field }) => (
                    <FormItem><FormLabel>Pool Cover</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select cover type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="None">None</SelectItem><SelectItem value="Manual">Manual</SelectItem><SelectItem value="Automatic">Automatic</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />


                <Separator />
                <div>
                    <h3 className="text-lg font-medium">Construction</h3>
                    <p className="text-sm text-muted-foreground">Information about the pool's physical structure.</p>
                </div>
                 <FormField control={form.control} name="grouting_type" render={({ field }) => (
                    <FormItem><FormLabel>Grouting Type</FormLabel><FormControl><Input placeholder="e.g., Epoxy" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="tile_image" render={({ field }) => (
                    <FormItem><FormLabel>Tile Image</FormLabel><FormControl><ImageUpload value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                )} />

                <Separator />
                <div>
                    <h3 className="text-lg font-medium">Maintenance</h3>
                    <p className="text-sm text-muted-foreground">Settings related to pool maintenance.</p>
                </div>
                 <FormField control={form.control} name="loses_water" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Loses Water</FormLabel><FormDescription>Is the pool currently losing water?</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                )} />
                {watchLosesWater && <FormField control={form.control} name="water_loss_reason" render={({ field }) => (
                    <FormItem className="pl-4 border-l-2 ml-4"><FormLabel>Reason for Water Loss</FormLabel><FormControl><Textarea placeholder="Describe the reason for water loss..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />}
                <FormField control={form.control} name="water_filling_on" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Water Filling System On</FormLabel><FormDescription>Is the automatic water filling system active?</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                )} />
                {watchWaterFillingOn && (
                    <Alert variant="destructive">
                        <Thermometer className="h-4 w-4" />
                        <AlertTitle>Water Filling Active</AlertTitle>
                        <AlertDescription>
                            The automatic water filling system is currently ON. Monitor water levels closely.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </ScrollArea>
        <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Save Pool</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
