
'use client';

import { DashboardHeader } from '@/components/dashboard-header';
import { SidebarNav } from '@/components/sidebar-nav';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Company, Pool, User, Task } from '@/lib/types';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { mockUsers, mockCompanies, initialPools, mockTasks } from '@/lib/mock-data';
import { usePathname, useRouter } from 'next/navigation';

interface CurrentUserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  allUsers: User[];
  setUsers: (users: User[] | ((prev: User[]) => User[])) => void;
  allCompanies: Company[];
  setCompanies: (companies: Company[] | ((prev: Company[]) => Company[])) => void;
  allPools: Pool[];
  setPools: (pools: Pool[] | ((prev: Pool[]) => Pool[])) => void;
  allTasks: Task[];
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void;
}

const CurrentUserContext = createContext<CurrentUserContextType | null>(null);

export function useCurrentUser() {
  const context = useContext(CurrentUserContext);
  if (!context) {
    throw new Error('useCurrentUser must be used within a CurrentUserProvider');
  }
  return context;
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [pools, setPools] = useState<Pool[]>(initialPools);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // If not logged in and not on login page, redirect to login
    if (!currentUser && pathname !== '/login') {
      router.replace('/login');
    }
    // If logged in and on login page, redirect to home
    if (currentUser && pathname === '/login') {
      router.replace('/');
    }
  }, [currentUser, pathname, router]);
  
  const handleSetCurrentUser = (user: User | null) => {
    if (user) {
      // On login, ensure we have the latest user data
      const freshUser = users.find(u => u.id === user.id) || user;
      setCurrentUser(freshUser);
    } else {
      // On logout
      setCurrentUser(null);
      router.replace('/login');
    }
  };
  
  const contextValue = { 
      currentUser, 
      setCurrentUser: handleSetCurrentUser, 
      allUsers: users, 
      setUsers, 
      allCompanies: companies, 
      setCompanies,
      allPools: pools,
      setPools,
      allTasks: tasks,
      setTasks,
  };

  // While redirecting, render nothing to avoid content flashes
  if ((!currentUser && pathname !== '/login') || (currentUser && pathname === '/login')) {
    return null;
  }
  
  if (!currentUser) {
    // Only render the login page if not authenticated
    return (
      <CurrentUserContext.Provider value={contextValue}>
        {pathname === '/login' ? children : null}
      </CurrentUserContext.Provider>
    );
  }
  
  return (
    <CurrentUserContext.Provider value={contextValue}>
      <SidebarProvider>
        <Sidebar>
          <SidebarNav />
        </Sidebar>
        <SidebarInset>
          <DashboardHeader />
          <main className="p-4 lg:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </CurrentUserContext.Provider>
  );
}
