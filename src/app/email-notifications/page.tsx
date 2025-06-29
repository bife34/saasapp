
'use client';

import { useCurrentUser } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EmailNotificationsPage() {
    const { currentUser, allCompanies, setCompanies, allPools, setPools } = useCurrentUser();
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (currentUser && currentUser.role !== 'Admin') {
            router.push('/');
        }
    }, [currentUser, router]);

    const company = currentUser ? allCompanies.find(c => c.id === currentUser.companyId) : undefined;

    // Local state to manage form changes before saving
    const [isFeatureEnabled, setIsFeatureEnabled] = useState(company?.enable_record_notifications || false);
    const [poolSettings, setPoolSettings] = useState<Record<string, { email: string; sendNotification: boolean }>>({});

    useEffect(() => {
        // Initialize local state when component mounts or user changes
        if (company) {
            setIsFeatureEnabled(company.enable_record_notifications || false);
            const initialSettings = allPools
                .filter(p => p.companyId === company.id)
                .reduce((acc, pool) => {
                    acc[pool.id] = {
                        email: pool.owner_email || '',
                        sendNotification: pool.send_record_notification_on_creation || false,
                    };
                    return acc;
                }, {} as Record<string, { email: string; sendNotification: boolean }>);
            setPoolSettings(initialSettings);
        }
    }, [company, allPools, currentUser]);


    if (!currentUser || currentUser.role !== 'Admin' || !company) {
        return null;
    }

    const companyPools = allPools.filter(p => p.companyId === company.id);

    const handleSettingChange = (poolId: string, key: 'email' | 'sendNotification', value: string | boolean) => {
        setPoolSettings(prev => ({
            ...prev,
            [poolId]: {
                ...prev[poolId],
                [key]: value,
            },
        }));
    };

    const handleSaveChanges = () => {
        // Update global company state
        setCompanies(prev => prev.map(c =>
            c.id === company.id ? { ...c, enable_record_notifications: isFeatureEnabled } : c
        ));

        // Update global pools state
        setPools(prev => prev.map(p => {
            if (Object.keys(poolSettings).includes(p.id)) {
                return { 
                    ...p, 
                    owner_email: poolSettings[p.id].email,
                    send_record_notification_on_creation: poolSettings[p.id].sendNotification,
                };
            }
            return p;
        }));

        toast({
            title: 'Settings Saved',
            description: 'Email notification settings have been updated.',
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>
                    Manage settings for sending automated email reports to pool owners.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="enable-feature" className="text-base">Enable Automated Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                            This master switch must be on for any automated emails to be sent.
                        </p>
                    </div>
                    <Switch
                        id="enable-feature"
                        checked={isFeatureEnabled}
                        onCheckedChange={setIsFeatureEnabled}
                        aria-label="Enable Automated Notifications"
                    />
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Pool-Specific Settings</h3>
                     <p className="text-sm text-muted-foreground">
                        Configure email addresses and enable automated reports for individual pools.
                    </p>
                    <div className="space-y-6">
                        {companyPools.map(pool => (
                            <div key={pool.id} className="rounded-lg border p-4">
                                <h4 className="font-medium mb-4">{pool.pool_name}</h4>
                                <div className="space-y-4">
                                    <div className="grid items-center gap-2 md:grid-cols-3">
                                        <Label htmlFor={`email-${pool.id}`}>Owner Email</Label>
                                        <Input
                                            id={`email-${pool.id}`}
                                            type="email"
                                            placeholder="owner@example.com"
                                            value={poolSettings[pool.id]?.email || ''}
                                            onChange={(e) => handleSettingChange(pool.id, 'email', e.target.value)}
                                            className="md:col-span-2"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor={`notify-switch-${pool.id}`} className="text-sm">Send Record Automatically</Label>
                                            <p className="text-xs text-muted-foreground">
                                                If on, an email is sent to the owner every time a record is added.
                                            </p>
                                        </div>
                                        <Switch
                                            id={`notify-switch-${pool.id}`}
                                            checked={poolSettings[pool.id]?.sendNotification || false}
                                            onCheckedChange={(checked) => handleSettingChange(pool.id, 'sendNotification', checked)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                         {companyPools.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No pools have been created for this company yet.
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSaveChanges}>Save Changes</Button>
                </div>
            </CardContent>
        </Card>
    )
}
