
'use client';

import { useCurrentUser } from '@/components/app-layout';
import { PoolStatusCard } from './pool-status-card';
import { TasksCard } from './tasks-card';
import { WaterQualityChart } from './water-quality-chart';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertTriangle, Flame, Waves } from 'lucide-react';
import { AdminsCard } from './admins-card';
import { RecentLoginsCard } from './recent-logins-card';
import { mockRecords, mockStockItems } from '@/lib/mock-data';
import { LowStockCard } from './low-stock-card';
import { ActiveSystemsCard } from './active-systems-card';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { format } from 'date-fns';

export default function Dashboard() {
  const { currentUser, allUsers, allPools, allTasks, setTasks } = useCurrentUser();

  if (!currentUser) return null;

  const renderDashboardContent = () => {
    switch (currentUser.role) {
      case 'Superadmin':
        return (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AdminsCard />
            <RecentLoginsCard description="The latest user activity across all companies." />
          </div>
        );

      case 'Admin': {
        const companyPools = allPools.filter(p => p.companyId === currentUser.companyId);
        const companyStock = mockStockItems.filter(i => i.companyId === currentUser.companyId);
        
        const lowStockItems = companyStock.filter(i => i.quantity <= i.low_stock_threshold);
        const heatersOn = companyPools
          .filter(p => p.heatpump?.heatpump_on)
          .map(p => `${p.pool_name}${p.heatpump?.heatpump_temperature ? ` (${p.heatpump.heatpump_temperature}°C)` : ''}`);
        const fillingsOn = companyPools.filter(p => p.water_filling_on).map(p => p.pool_name);
        const companyUsers = allUsers.filter(u => u.companyId === currentUser.companyId);

        return (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <RecentLoginsCard users={companyUsers} title="Recent Company Logins" description="Latest user activity in your company."/>
              <LowStockCard items={lowStockItems} />
              <ActiveSystemsCard
                title="Active Heaters"
                icon={Flame}
                activeItems={heatersOn}
                emptyText="No heaters are currently active."
              />
              <ActiveSystemsCard
                title="Active Water Fillings"
                icon={Waves}
                activeItems={fillingsOn}
                emptyText="No water filling systems are currently active."
              />
          </div>
        );
      }
      
      case 'Technician': {
        const accessiblePools = allPools.filter(p => 
            p.companyId === currentUser.companyId && currentUser.accessible_pool_ids?.includes(p.id)
        );
        const heatersOn = accessiblePools
          .filter(p => p.heatpump?.heatpump_on)
          .map(p => `${p.pool_name}${p.heatpump?.heatpump_temperature ? ` (${p.heatpump.heatpump_temperature}°C)` : ''}`);
        const fillingsOn = accessiblePools.filter(p => p.water_filling_on).map(p => p.pool_name);

        const technicianTasks = allTasks.filter(t => t.technicianId === currentUser.id);

        const handleToggleTask = (taskId: string) => {
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                task.id === taskId ? { ...task, is_completed: !task.is_completed } : task
                )
            );
        };

        return (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <TasksCard tasks={technicianTasks} onToggleTask={handleToggleTask} />
                <div className="space-y-6">
                    <ActiveSystemsCard
                        title="Active Heaters"
                        icon={Flame}
                        activeItems={heatersOn}
                        emptyText="No assigned heaters are active."
                    />
                    <ActiveSystemsCard
                        title="Active Water Fillings"
                        icon={Waves}
                        activeItems={fillingsOn}
                        emptyText="No assigned water fillings are active."
                    />
                </div>
            </div>
        );
      }

      case 'Client': {
        const accessiblePools = allPools.filter(p => currentUser.accessible_pool_ids?.includes(p.id));
        
        // Prepare data for the chart using the first accessible pool
        const firstPoolId = accessiblePools[0]?.id;
        const firstPoolRecords = firstPoolId 
          ? mockRecords
              .filter(r => r.poolId === firstPoolId)
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 7)
              .reverse()
          : [];

        const chartData = firstPoolRecords.map(r => ({
            date: format(new Date(r.created_at), 'dd/MM'),
            ph: r.ph,
            chlorine: r.cl,
        }));

        return (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              {accessiblePools.length > 0 ? (
                accessiblePools.map(pool => <PoolStatusCard key={pool.id} pool={pool} />)
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Pools Assigned</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>You do not have access to any pools yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
            {accessiblePools.length > 0 && (
              <WaterQualityChart className="lg:col-span-1" data={chartData} />
            )}
          </div>
        );
      }

      default:
        return (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Dashboard Not Configured</AlertTitle>
            <AlertDescription>
              There is no dashboard view configured for the current user role.
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {currentUser.forcePasswordChange && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Action Required: Change Your Password</AlertTitle>
          <AlertDescription>
            For your security, please change your temporary password. You can do
            this in the Settings page.
          </AlertDescription>
        </Alert>
      )}
      {renderDashboardContent()}
    </div>
  );
}
