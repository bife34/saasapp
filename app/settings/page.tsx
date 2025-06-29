
'use client';

import * as React from 'react';
import { useCurrentUser } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/image-upload';

// Sub-components for different settings sections
const ProfileSettings = () => {
    const { currentUser } = useCurrentUser();

    if (!currentUser) return null;

    // In a real app, this form would be functional and could update the user's name.
    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Manage your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue={currentUser.name} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={currentUser.email} readOnly />
            </div>
            <Button>Save Changes</Button>
            </CardContent>
        </Card>
    );
};

// Password change schema and component
const passwordFormSchema = z.object({
  // In a real app, you would validate the current password against the backend
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordFormSchema>;

const PasswordSettings = () => {
    const { currentUser, setUsers } = useCurrentUser();
    const { toast } = useToast();

    const form = useForm<PasswordFormData>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        }
    });

    if (!currentUser) return null;

    const onSubmit = (data: PasswordFormData) => {
        // Here you would normally verify the currentPassword against what's stored.
        // For this prototype, we'll skip that step.

        setUsers(prev => prev.map(user => 
            user.id === currentUser.id 
                ? { ...user, password: data.newPassword, forcePasswordChange: false } 
                : user
        ));

        toast({
            title: 'Success!',
            description: 'Your password has been updated.',
        });

        form.reset();
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Change your password here. After changing, you may need to log in again.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="currentPassword" render={({ field }) => (
                            <FormItem><FormLabel>Current Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="newPassword" render={({ field }) => (
                            <FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                            <FormItem><FormLabel>Confirm New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="submit">Update Password</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

const NotificationSettings = () => {
  const { currentUser } = useCurrentUser();
  
  if (!currentUser) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Manage how you receive notifications.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive important updates via email.</p>
          </div>
          <Switch defaultChecked />
        </div>
        {currentUser.role === 'Admin' && (
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Low Stock Alerts</Label>
              <p className="text-sm text-muted-foreground">Get notified when stock levels are low.</p>
            </div>
            <Switch />
          </div>
        )}
        <Button>Save Changes</Button>
      </CardContent>
    </Card>
  );
};

const companySettingsSchema = z.object({
  companyName: z.string().min(1, "Company name is required."),
  logo: z.string().optional(),
});

type CompanySettingsFormData = z.infer<typeof companySettingsSchema>;

const CompanySettings = () => {
    const { currentUser, allCompanies, setCompanies } = useCurrentUser();
    const { toast } = useToast();
    
    if (!currentUser) return null;

    const company = allCompanies.find(c => c.id === currentUser.companyId);

    const form = useForm<CompanySettingsFormData>({
        resolver: zodResolver(companySettingsSchema),
        defaultValues: {
            companyName: company?.name || '',
            logo: company?.logo || '',
        },
    });

    React.useEffect(() => {
        if (company) {
            form.reset({
                companyName: company.name,
                logo: company.logo || '',
            });
        }
    }, [company, form]);

    const onSubmit = (data: CompanySettingsFormData) => {
        if (!company) return;

        setCompanies(prev => prev.map(c => 
            c.id === company.id 
                ? { ...c, name: data.companyName, logo: data.logo } 
                : c
        ));

        toast({
            title: 'Company Settings Saved',
            description: 'Your company information has been updated.',
        });
    };
    
    if (!company) {
        return null;
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Company Settings</CardTitle>
                <CardDescription>Manage your company's information and branding.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="logo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company Logo</FormLabel>
                                    <FormControl>
                                        <ImageUpload value={field.value} onChange={field.onChange} />
                                    </FormControl>
                                    <FormDescription>
                                        Upload your company's logo. Recommended size: 200x200px.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Save Changes</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

const SystemSettings = () => (
    <Card>
        <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>Manage global settings for the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Temporarily disable access for non-superadmin users.</p>
                </div>
                <Switch />
            </div>
            <Button>Save Changes</Button>
        </CardContent>
    </Card>
);


export default function SettingsPage() {
  const { currentUser } = useCurrentUser();

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
            <p className="text-muted-foreground">
                Manage your account, company, and system settings.
            </p>
        </div>
        <Tabs defaultValue="profile" className="w-full">
            <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                {currentUser.role === 'Admin' && <TabsTrigger value="company">Company</TabsTrigger>}
                {currentUser.role === 'Superadmin' && <TabsTrigger value="system">System</TabsTrigger>}
            </TabsList>
            <TabsContent value="profile" className="pt-4">
                <ProfileSettings />
            </TabsContent>
            <TabsContent value="security" className="pt-4">
                <PasswordSettings />
            </TabsContent>
            <TabsContent value="notifications" className="pt-4">
                <NotificationSettings />
            </TabsContent>
            <TabsContent value="company" className="pt-4">
                {currentUser.role === 'Admin' && <CompanySettings />}
            </TabsContent>
            <TabsContent value="system" className="pt-4">
                 {currentUser.role === 'Superadmin' && <SystemSettings />}
            </TabsContent>
        </Tabs>
    </div>
  );
}
