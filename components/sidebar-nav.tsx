
'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import {
  BookCopy,
  ChevronDown,
  Droplet,
  Droplets,
  LayoutDashboard,
  LogOut,
  Mail,
  Package,
  Settings,
  TestTubeDiagonal,
  Users,
  Building2,
  CheckSquare,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCurrentUser } from './app-layout';
import Image from 'next/image';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pools', label: 'Pools', icon: Droplet, roles: ['Admin', 'Technician', 'Client'] },
  { href: '/records', label: 'Pool Records', icon: BookCopy, roles: ['Admin', 'Technician', 'Client'] },
  { href: '/ai-analysis', label: 'AI Analysis', icon: TestTubeDiagonal, roles: ['Admin', 'Technician'] },
  { href: '/tasks', label: 'Today\'s Tasks', icon: CheckSquare, roles: ['Admin', 'Technician'] },
  { href: '/stock', label: 'Stock', icon: Package, roles: ['Admin', 'Technician'] },
  { href: '/email-notifications', label: 'Email Notifications', icon: Mail, roles: ['Admin'] },
  { href: '/users', label: 'Users', icon: Users, roles: ['Admin', 'Superadmin'] },
  { href: '/companies', label: 'Companies', icon: Building2, roles: ['Superadmin'] },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { currentUser, setCurrentUser, allCompanies } = useCurrentUser();
  
  if (!currentUser) return null;

  const visibleNavItems = navItems.filter(item => {
    return !item.roles || item.roles.includes(currentUser.role);
  });

  const company = currentUser.companyId 
    ? allCompanies.find(c => c.id === currentUser.companyId)
    : null;

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Droplets className="size-8 text-primary" />
          <h1 className="text-xl font-semibold">ProPools</h1>
        </div>
      </SidebarHeader>

      {company && (
         <div className="p-4 space-y-2">
           <div className="p-2 rounded-md bg-sidebar-accent text-sidebar-accent-foreground text-sm">
             <span className="font-bold text-xs block mb-1">Company:</span>
             <div className="flex items-center gap-2">
                {company.logo ? (
                  <Image src={company.logo} alt={`${company.name} logo`} width={24} height={24} className="h-6 w-6 rounded-sm object-cover" data-ai-hint="logo" />
                ) : (
                  <Building2 className="h-6 w-6" />
                )}
                <span className="font-medium">{company.name}</span>
             </div>
           </div>
         </div>
      )}
      
      <SidebarContent>
        <SidebarMenu>
          {visibleNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex h-8 w-full items-center gap-2 rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2',
                  pathname === item.href
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground'
                )}
              >
                <item.icon className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2 p-2">
              <Avatar className="size-8">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium">{currentUser.name}</span>
                <span className="text-xs text-muted-foreground">
                  {currentUser.email}
                </span>
              </div>
              <ChevronDown className="ml-auto size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mb-2">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href="/settings" className="w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setCurrentUser(null)}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </>
  );
}
