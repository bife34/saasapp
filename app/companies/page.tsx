
'use client';

import { useCurrentUser } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Company, User } from '@/lib/types';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CompanyForm, CompanyFormData } from '@/components/company-form';

export default function CompaniesPage() {
    const { currentUser, allUsers, allCompanies, setCompanies, setUsers, allPools } = useCurrentUser();
    const router = useRouter();
    const { toast } = useToast();
    
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        if (currentUser && currentUser.role !== 'Superadmin') {
            router.push('/');
        }
    }, [currentUser, router]);

    if (!currentUser || currentUser.role !== 'Superadmin') {
        return null; // Render nothing while redirecting or if not authorized
    }
    
    const handleSaveCompany = (data: CompanyFormData) => {
        const newAdminId = crypto.randomUUID();
        const newCompanyId = crypto.randomUUID();

        const newAdmin: User = {
            id: newAdminId,
            name: data.adminName,
            email: data.adminEmail,
            role: 'Admin',
            status: 'Active',
            last_login: '',
            companyId: newCompanyId,
            password: data.adminPassword,
            forcePasswordChange: true,
        };

        const newCompany: Company = {
            id: newCompanyId,
            name: data.companyName,
            ownerAdminId: newAdminId,
        };

        setUsers(prev => [...prev, newAdmin]);
        setCompanies(prev => [...prev, newCompany]);

        toast({
            title: 'Company Created',
            description: `${data.companyName} has been created with ${data.adminName} as the admin.`,
        });

        setIsFormOpen(false);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Companies</CardTitle>
                            <CardDescription>
                                An overview of all companies on the ProPools platform.
                            </CardDescription>
                        </div>
                        <Button onClick={() => setIsFormOpen(true)}>
                            <PlusCircle className="mr-2" />
                            New Company
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Company</TableHead>
                                <TableHead>Admin</TableHead>
                                <TableHead>Users</TableHead>
                                <TableHead>Pools</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allCompanies.map(company => {
                                const admin = allUsers.find(u => u.id === company.ownerAdminId);
                                const userCount = allUsers.filter(u => u.companyId === company.id).length;
                                const poolCount = allPools.filter(p => p.companyId === company.id).length;
                                return (
                                    <TableRow key={company.id}>
                                        <TableCell className="font-medium">{company.name}</TableCell>
                                        <TableCell>
                                            {admin ? (
                                                <div>
                                                    <div>{admin.name}</div>
                                                    <div className="text-sm text-muted-foreground">{admin.email}</div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">N/A</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{userCount}</TableCell>
                                        <TableCell>{poolCount}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Create New Company</DialogTitle>
                        <DialogDescription>
                            Fill in the details below to create a new company and its primary admin user.
                        </DialogDescription>
                    </DialogHeader>
                    <CompanyForm
                        onSubmit={handleSaveCompany}
                        onCancel={() => setIsFormOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    )
}
