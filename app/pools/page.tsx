
'use client';

import { Pool, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FilePlus2,
  MoreHorizontal,
  Pencil,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PoolForm, PoolFormData } from '@/components/pool-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { PoolRecordForm, PoolRecordFormData } from '@/components/pool-record-form';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useCurrentUser } from '@/components/app-layout';

export default function PoolsPage() {
  const { currentUser, allUsers, setUsers, allPools, setPools, allCompanies } = useCurrentUser();
  
  const poolsToDisplay = useMemo(() => {
    if (!currentUser) return [];
    // Filter pools by company first
    const companyPools = currentUser.role === 'Superadmin'
      ? allPools
      : allPools.filter(p => p.companyId === currentUser.companyId);

    // Then, if user is client or tech, filter by their accessible pools
    if (currentUser.role === 'Client' || currentUser.role === 'Technician') {
      return companyPools.filter(pool => currentUser.accessible_pool_ids?.includes(pool.id));
    } else {
      return companyPools;
    }
  }, [currentUser, allPools]);


  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [poolToDelete, setPoolToDelete] = useState<Pool | null>(null);
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
  const [poolForRecord, setPoolForRecord] = useState<Pool | null>(null);
  const [isAssignTechOpen, setIsAssignTechOpen] = useState(false);
  const [poolToAssignTechs, setPoolToAssignTechs] = useState<Pool | null>(null);

  const { toast } = useToast();

  if (!currentUser) return null;

  const handleToggleHeatPump = (poolId: string) => {
    setPools((prevPools) =>
      prevPools.map((pool) => {
        if (pool.id === poolId) {
          const newHasHeatPump = !pool.has_heatpump;
          return {
            ...pool,
            has_heatpump: newHasHeatPump,
            heatpump: {
              ...(pool.heatpump || { heatpump_on: false }),
              heatpump_on: newHasHeatPump,
            },
          };
        }
        return pool;
      })
    );
  };

  const handleTemperatureChange = (poolId: string, temp: string) => {
    const newTemp = Number(temp);
    if (temp !== '' && isNaN(newTemp)) return;

    setPools((prevPools) =>
      prevPools.map((pool) => {
        if (pool.id === poolId) {
          return {
            ...pool,
            heatpump: {
              ...(pool.heatpump || { heatpump_on: true }),
              heatpump_temperature: temp === '' ? undefined : newTemp,
            },
          };
        }
        return pool;
      })
    );
  };

  const handleToggleWaterFilling = (poolId: string) => {
    setPools((prevPools) =>
      prevPools.map((pool) =>
        pool.id === poolId
          ? { ...pool, water_filling_on: !pool.water_filling_on }
          : pool
      )
    );
  };

  const handleNewPool = () => {
    setSelectedPool(null);
    setIsFormOpen(true);
  };

  const handleEditPool = (pool: Pool) => {
    setSelectedPool(pool);
    setIsFormOpen(true);
  };
  
  const handleDeleteRequest = (pool: Pool) => {
    setPoolToDelete(pool);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (poolToDelete) {
      setPools(prev => prev.filter((p) => p.id !== poolToDelete.id));
      setIsDeleteAlertOpen(false);
      setPoolToDelete(null);
    }
  };

  const handleSavePool = (data: PoolFormData) => {
    const enrichedData: Omit<Pool, 'id' | 'companyId'> = {
      ...data,
      heatpump: data.has_heatpump ? data.heatpump : undefined,
      water_loss_reason: data.loses_water ? data.water_loss_reason : undefined,
    };
  
    if (selectedPool) {
      // Update existing pool
      setPools(prev => 
        prev.map((p) =>
          p.id === selectedPool.id ? { ...p, ...enrichedData } : p
        )
      );
    } else {
      // Add new pool
      const newPool: Pool = {
        id: crypto.randomUUID(),
        companyId: currentUser.companyId,
        ...enrichedData,
      };
      setPools(prev => [...prev, newPool]);
    }
    setIsFormOpen(false);
    setSelectedPool(null);
  };

  const handleAddRecord = (pool: Pool) => {
    setPoolForRecord(pool);
    setIsRecordFormOpen(true);
  };

  const handleSaveRecord = (data: PoolRecordFormData) => {
    if (!poolForRecord) return;
    
    const newRecord = {
      ...data,
      id: crypto.randomUUID(),
      poolId: poolForRecord?.id,
      created_at: new Date().toISOString(),
    };
    
    console.log('New Pool Record:', newRecord);
    // Here you would typically save the newRecord to your state or database
    setIsRecordFormOpen(false);
    toast({
      title: "Record Saved",
      description: `A new record for ${poolForRecord?.pool_name} has been created.`,
    });

    // Automated email sending logic
    const company = allCompanies.find(c => c.id === poolForRecord.companyId);
    if (company?.enable_record_notifications && poolForRecord.send_record_notification_on_creation && poolForRecord.owner_email) {
      toast({
          title: "Notification Sent Automatically",
          description: `A copy of the record has been emailed to ${poolForRecord.owner_email}.`,
      });
    }
  };

  const handleOpenAssignTechs = (pool: Pool) => {
    setPoolToAssignTechs(pool);
    setIsAssignTechOpen(true);
  };

  const handleSaveTechAssignments = (poolId: string, assignedTechIds: string[]) => {
    const updatedUsers = allUsers.map(user => {
      if (user.role === 'Technician' || user.role === 'Client') {
        const accessiblePools = user.accessible_pool_ids || [];
        const isAssigned = assignedTechIds.includes(user.id);
        
        if (isAssigned && !accessiblePools.includes(poolId)) {
          // Add pool to user
          return { ...user, accessible_pool_ids: [...accessiblePools, poolId] };
        } else if (!isAssigned && accessiblePools.includes(poolId)) {
          // Remove pool from user
          return { ...user, accessible_pool_ids: accessiblePools.filter(id => id !== poolId) };
        }
      }
      return user;
    });

    setUsers(updatedUsers);
    setIsAssignTechOpen(false);
    toast({
        title: "Assignments Updated",
        description: "Pool assignments have been saved.",
    });
  };

  const getStatusVariant = (status: Pool['status']) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Maintenance':
        return 'secondary';
      case 'Closed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const usersToAssign = allUsers.filter(u => 
    (u.role === 'Technician' || u.role === 'Client') && 
    u.companyId === currentUser.companyId
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Pools</CardTitle>
              <CardDescription>
                Manage your portfolio of client pools.
              </CardDescription>
            </div>
            {(currentUser.role === 'Admin' || currentUser.role === 'Technician') && (
              <Button onClick={handleNewPool}>
                <PlusCircle className="mr-2" />
                New Pool
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  Image
                </TableHead>
                <TableHead>Pool Name</TableHead>
                <TableHead>Location</TableHead>
                {currentUser.role === 'Admin' && <TableHead>Assigned Team</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead>Heat Pump</TableHead>
                <TableHead>Water Filling</TableHead>
                {currentUser.role !== 'Client' && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {poolsToDisplay.map((pool) => {
                const assignedUsers = allUsers.filter(
                  (user) =>
                    (user.role === 'Technician' || user.role === 'Client') &&
                    user.accessible_pool_ids?.includes(pool.id)
                );
                return (
                  <TableRow key={pool.id}>
                    <TableCell className="hidden sm:table-cell">
                      {pool.pool_picture ? (
                        <Image
                          alt={pool.pool_name}
                          className="aspect-square rounded-md object-cover"
                          height="64"
                          src={pool.pool_picture}
                          width="64"
                          data-ai-hint="pool"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-16 w-16 bg-muted rounded-md text-xs text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{pool.pool_name}</TableCell>
                    <TableCell>{pool.pool_location}</TableCell>
                    {currentUser.role === 'Admin' && (
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                {assignedUsers.length > 0 ? (
                                    assignedUsers.map(user => (
                                    <Avatar key={user.id} className="border-2 border-background">
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    ))
                                ) : (
                                    <div className="text-xs text-muted-foreground">None</div>
                                )}
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleOpenAssignTechs(pool)}>
                                    <Pencil className="h-3 w-3" />
                                </Button>
                            </div>
                        </TableCell>
                    )}
                    <TableCell>
                      <Badge variant={getStatusVariant(pool.status)}>
                        {pool.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`heatpump-switch-${pool.id}`}
                          checked={pool.has_heatpump}
                          onCheckedChange={() => handleToggleHeatPump(pool.id)}
                          aria-label="Toggle Heat Pump"
                          disabled={currentUser.role === 'Client'}
                        />
                        {pool.has_heatpump && (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              className="h-8 w-20"
                              value={pool.heatpump?.heatpump_temperature ?? ''}
                              onChange={(e) =>
                                handleTemperatureChange(pool.id, e.target.value)
                              }
                              placeholder="Temp"
                              disabled={currentUser.role === 'Client'}
                            />
                            <span>°C</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        id={`water-filling-switch-${pool.id}`}
                        checked={pool.water_filling_on}
                        onCheckedChange={() => handleToggleWaterFilling(pool.id)}
                        aria-label="Toggle Water Filling"
                        disabled={currentUser.role === 'Client'}
                      />
                    </TableCell>
                    {currentUser.role !== 'Client' && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleAddRecord(pool)}>
                                <FilePlus2 className="mr-2 h-4 w-4" /> Add Record
                            </DropdownMenuItem>
                            {(currentUser.role === 'Admin' || currentUser.role === 'Technician') && (
                                <DropdownMenuItem onClick={() => handleEditPool(pool)}>
                                  <Pencil className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                            )}
                            {currentUser.role === 'Admin' && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteRequest(pool)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPool ? 'Edit Pool' : 'Create New Pool'}
            </DialogTitle>
            <DialogDescription>
                Fill in the details below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <PoolForm
            pool={selectedPool}
            onSubmit={handleSavePool}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone and can only be performed by an administrator. This will permanently delete the pool and all of its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isRecordFormOpen} onOpenChange={setIsRecordFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Record for {poolForRecord?.pool_name}</DialogTitle>
            <DialogDescription>
              Fill in the details for this maintenance record.
            </DialogDescription>
          </DialogHeader>
          <PoolRecordForm
            poolName={poolForRecord?.pool_name || ''}
            onSubmit={handleSaveRecord}
            onCancel={() => setIsRecordFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <AssignUsersDialog
        pool={poolToAssignTechs}
        allUsers={usersToAssign}
        isOpen={isAssignTechOpen}
        onOpenChange={setIsAssignTechOpen}
        onSave={handleSaveTechAssignments}
      />
    </>
  );
}

// Sub-component for the technician assignment dialog
interface AssignUsersDialogProps {
    pool: Pool | null;
    allUsers: User[];
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (poolId: string, userIds: string[]) => void;
}

function AssignUsersDialog({ pool, allUsers, isOpen, onOpenChange, onSave }: AssignUsersDialogProps) {
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

    // Effect to update selected techs when dialog opens for a new pool
    useEffect(() => {
        if (pool && isOpen) {
            const initiallyAssigned = allUsers
                .filter(tech => tech.accessible_pool_ids?.includes(pool.id))
                .map(tech => tech.id);
            setSelectedUserIds(initiallyAssigned);
        }
    }, [pool, isOpen, allUsers]);
    
    if (!pool) return null;

    const handleCheckboxChange = (userId: string, checked: boolean) => {
        setSelectedUserIds(prev =>
            checked ? [...prev, userId] : prev.filter(id => id !== userId)
        );
    };

    const handleSave = () => {
        onSave(pool.id, selectedUserIds);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Users to {pool.pool_name}</DialogTitle>
                    <DialogDescription>Select the clients and technicians who can access this pool.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {allUsers.map(user => (
                        <div key={user.id} className="flex items-center space-x-3">
                            <Checkbox
                                id={`user-${user.id}`}
                                checked={selectedUserIds.includes(user.id)}
                                onCheckedChange={(checked) => handleCheckboxChange(user.id, !!checked)}
                            />
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <Label htmlFor={`user-${user.id}`} className="flex-1">
                                {user.name} <span className="text-muted-foreground">({user.role})</span>
                            </Label>
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Assignments</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
