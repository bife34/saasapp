
'use client';

import { useCurrentUser } from './app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { User } from '@/lib/types';

export function AdminsCard() {
    const { currentUser, allUsers, allCompanies } = useCurrentUser();

    if (!currentUser) return null;

    const admins = allUsers.filter((user: User) => user.role === 'Admin');

    const getCompanyById = (companyId?: string) => {
        if (!companyId) return null;
        return allCompanies.find(c => c.id === companyId);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Company Admins</CardTitle>
                <CardDescription>Overview of all company administrators.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Admin</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {admins.length > 0 ? admins.map(admin => {
                            const company = getCompanyById(admin.companyId);
                            return (
                                <TableRow key={admin.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={admin.avatar} alt={admin.name} />
                                                <AvatarFallback>{admin.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="grid gap-0.5">
                                                <p className="font-medium">{admin.name}</p>
                                                <p className="text-xs text-muted-foreground">{admin.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{company?.name || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant={admin.status === 'Active' ? 'default' : 'secondary'}>
                                            {admin.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            )
                        }) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24">No admins found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
