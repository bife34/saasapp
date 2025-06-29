
'use client';

import { useCurrentUser } from './app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { User } from '@/lib/types';

interface RecentLoginsCardProps {
    users?: User[];
    title?: string;
    description?: string;
}

export function RecentLoginsCard({ users, title, description }: RecentLoginsCardProps) {
    const { currentUser, allUsers } = useCurrentUser();
    
    if (!currentUser) return null;

    // If a specific list of users is provided, use it. Otherwise, use all users.
    const usersToDisplay = users || allUsers;

    const usersWithLogins = usersToDisplay
        .filter((user: User) => user.last_login)
        .sort((a, b) => new Date(b.last_login).getTime() - new Date(a.last_login).getTime())
        .slice(0, 5); // Show top 5 recent logins

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title || 'Recent User Logins'}</CardTitle>
                <CardDescription>{description || 'The latest user activity.'}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {usersWithLogins.length > 0 ? usersWithLogins.map(user => (
                        <div key={user.id} className="flex items-center gap-4">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.role}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(user.last_login), { addSuffix: true })}
                            </p>
                        </div>
                    )) : (
                        <div className="text-center text-muted-foreground p-8">No recent logins found.</div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
