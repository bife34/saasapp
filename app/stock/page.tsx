
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Trash2, Pencil, ArrowDownUp } from 'lucide-react';
import { Pool, StockItem, StockUsageRecord } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
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
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrentUser } from '@/components/app-layout';
import { mockStockItems, mockUsageRecords } from '@/lib/mock-data';

// Stock Item Form Schema and Component
const stockItemFormSchema = z.object({
  name: z.string().min(1, 'Product name is required.'),
  category: z.string().min(1, 'Category is required.'),
  quantity: z.coerce.number().min(0, 'Quantity must be a positive number.'),
  unit: z.enum(['kg', 'liters', 'units']),
  supplier: z.string().optional(),
  low_stock_threshold: z.coerce.number().min(0, 'Threshold must be a positive number.'),
});

type StockItemFormData = z.infer<typeof stockItemFormSchema>;

interface StockItemFormProps {
  item?: StockItem | null;
  onSubmit: (data: StockItemFormData) => void;
  onCancel: () => void;
}

function StockItemForm({ item, onSubmit, onCancel }: StockItemFormProps) {
  const form = useForm<StockItemFormData>({
    resolver: zodResolver(stockItemFormSchema),
    defaultValues: {
      name: item?.name || '',
      category: item?.category || '',
      quantity: item?.quantity || 0,
      unit: item?.unit || 'units',
      supplier: item?.supplier || '',
      low_stock_threshold: item?.low_stock_threshold || 10,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4 p-1">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input placeholder="e.g., Chlorine Tablets" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem><FormLabel>Category</FormLabel><FormControl><Input placeholder="e.g., Sanitizer" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="quantity" render={({ field }) => (
              <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="unit" render={({ field }) => (
              <FormItem><FormLabel>Unit</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a unit" /></SelectTrigger></FormControl><SelectContent><SelectItem value="kg">kg</SelectItem><SelectItem value="liters">Liters</SelectItem><SelectItem value="units">Units</SelectItem></SelectContent></Select><FormMessage /></FormItem>
            )} />
          </div>
          <FormField control={form.control} name="low_stock_threshold" render={({ field }) => (
            <FormItem><FormLabel>Low Stock Threshold</FormLabel><FormControl><Input type="number" placeholder="10" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="supplier" render={({ field }) => (
            <FormItem><FormLabel>Supplier (Optional)</FormLabel><FormControl><Input placeholder="e.g., PoolChem Inc." {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Save Product</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// Stock Usage Form Schema and Component
const stockUsageFormSchema = z.object({
  quantityUsed: z.coerce.number().min(0.1, 'Quantity used must be greater than 0.'),
  poolId: z.string().optional(),
});

type StockUsageFormData = z.infer<typeof stockUsageFormSchema>;

interface StockUsageFormProps {
  item: StockItem;
  pools: Pick<Pool, 'id' | 'pool_name'>[];
  onSubmit: (data: StockUsageFormData) => void;
  onCancel: () => void;
}

function StockUsageForm({ item, pools, onSubmit, onCancel }: StockUsageFormProps) {
  const form = useForm<StockUsageFormData>({
    resolver: zodResolver(stockUsageFormSchema),
    defaultValues: {
      quantityUsed: 1,
      poolId: '',
    },
    context: { max: item.quantity },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4 p-1">
          <p>Logging usage for: <strong>{item.name}</strong></p>
          <p className="text-sm text-muted-foreground">Current Stock: {item.quantity} {item.unit}</p>
          <FormField control={form.control} name="quantityUsed" render={({ field }) => (
            <FormItem><FormLabel>Quantity Used</FormLabel><FormControl><Input type="number" step="0.1" max={item.quantity} {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="poolId" render={({ field }) => (
            <FormItem>
              <FormLabel>Link to Pool (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select a pool" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {pools.map(pool => (<SelectItem key={pool.id} value={pool.id}>{pool.pool_name}</SelectItem>))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Log Usage</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// Main Page Component
export default function StockPage() {
  const { currentUser, allPools } = useCurrentUser();
  const [stock, setStock] = useState<StockItem[]>(mockStockItems);
  const [usageRecords, setUsageRecords] = useState<StockUsageRecord[]>(mockUsageRecords);
  
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  const [isUsageFormOpen, setIsUsageFormOpen] = useState(false);
  const [itemToLog, setItemToLog] = useState<StockItem | null>(null);

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<StockItem | null>(null);

  const { toast } = useToast();

  if (!currentUser) return null;

  const companyStock = currentUser.role === 'Superadmin' 
    ? stock
    : stock.filter(item => item.companyId === currentUser.companyId);

  const companyUsageRecords = currentUser.role === 'Superadmin'
    ? usageRecords
    : usageRecords.filter(record => record.companyId === currentUser.companyId);
  
  const companyPools = currentUser.role === 'Superadmin'
    ? allPools
    : allPools.filter(pool => pool.companyId === currentUser.companyId);

  const handleNewItem = () => { setSelectedItem(null); setIsItemFormOpen(true); };
  const handleEditItem = (item: StockItem) => { setSelectedItem(item); setIsItemFormOpen(true); };
  const handleLogUsage = (item: StockItem) => { setItemToLog(item); setIsUsageFormOpen(true); };
  const handleDeleteRequest = (item: StockItem) => { setItemToDelete(item); setIsDeleteAlertOpen(true); };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setStock(stock.filter((item) => item.id !== itemToDelete.id));
      setIsDeleteAlertOpen(false);
      setItemToDelete(null);
      toast({ title: 'Product Deleted', description: `${itemToDelete.name} has been removed.` });
    }
  };

  const handleSaveItem = (data: StockItemFormData) => {
    if (selectedItem) {
      setStock(stock.map((item) => (item.id === selectedItem.id ? { ...item, ...data } : item)));
      toast({ title: 'Product Updated', description: `${data.name} has been updated.` });
    } else {
      const newItem: StockItem = { 
        id: crypto.randomUUID(), 
        companyId: currentUser.companyId,
        ...data 
      };
      setStock([...stock, newItem]);
      toast({ title: 'Product Added', description: `${data.name} has been added.` });
    }
    setIsItemFormOpen(false);
    setSelectedItem(null);
  };

  const handleSaveUsage = (data: StockUsageFormData) => {
    if (!itemToLog) return;
    setStock(stock.map(item => item.id === itemToLog.id ? { ...item, quantity: item.quantity - data.quantityUsed } : item));

    const finalPoolId = data.poolId === 'none' || data.poolId === '' ? undefined : data.poolId;
    const pool = companyPools.find(p => p.id === finalPoolId);
    const newRecord: StockUsageRecord = {
      id: crypto.randomUUID(),
      companyId: currentUser.companyId,
      itemId: itemToLog.id,
      itemName: itemToLog.name,
      quantityUsed: data.quantityUsed,
      unit: itemToLog.unit,
      userId: currentUser.id,
      userName: currentUser.name,
      poolId: finalPoolId,
      poolName: pool?.pool_name,
      date: new Date().toISOString(),
    };
    setUsageRecords([newRecord, ...usageRecords]);

    toast({ title: 'Stock Usage Logged', description: `${data.quantityUsed} ${itemToLog.unit} of ${itemToLog.name} used.` });
    setIsUsageFormOpen(false);
    setItemToLog(null);
  };

  const getStockLevelVariant = (item: StockItem) => {
    if (item.quantity <= 0) return 'destructive';
    if (item.quantity <= item.low_stock_threshold) return 'secondary';
    return 'default';
  };
  
  return (
    <>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Stock Levels</CardTitle>
                <CardDescription>Manage your chemical and supply inventory.</CardDescription>
              </div>
              {currentUser.role === 'Admin' && (
                <Button onClick={handleNewItem}><PlusCircle className="mr-2" />New Product</Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead className="w-[40%]">Product</TableHead><TableHead>Category</TableHead><TableHead>In Stock</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {companyStock.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{`${item.quantity} ${item.unit}`}</TableCell>
                    <TableCell><Badge variant={getStockLevelVariant(item)}>{item.quantity <= item.low_stock_threshold ? 'Low Stock' : 'In Stock'}</Badge></TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleLogUsage(item)} disabled={item.quantity <= 0}><ArrowDownUp className="mr-2 h-4 w-4" />Log Usage</DropdownMenuItem>
                           {currentUser.role === 'Admin' && (
                            <>
                              <DropdownMenuItem onClick={() => handleEditItem(item)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteRequest(item)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {currentUser.role === 'Admin' && (
          <Card>
            <CardHeader><CardTitle>Stock Usage Log</CardTitle><CardDescription>Recent records of stock being used by staff.</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Qty Used</TableHead><TableHead>By</TableHead><TableHead>For Pool</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                <TableBody>
                  {companyUsageRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.itemName}</TableCell>
                      <TableCell>{`${record.quantityUsed} ${record.unit}`}</TableCell>
                      <TableCell>{record.userName}</TableCell>
                      <TableCell>{record.poolName || 'N/A'}</TableCell>
                      <TableCell>{formatDistanceToNow(new Date(record.date), { addSuffix: true })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isItemFormOpen} onOpenChange={setIsItemFormOpen}>
        <DialogContent><DialogHeader><DialogTitle>{selectedItem ? 'Edit Product' : 'Create New Product'}</DialogTitle></DialogHeader><StockItemForm item={selectedItem} onSubmit={handleSaveItem} onCancel={() => setIsItemFormOpen(false)} /></DialogContent>
      </Dialog>
      
      <Dialog open={isUsageFormOpen} onOpenChange={setIsUsageFormOpen}>
        <DialogContent><DialogHeader><DialogTitle>Log Stock Usage</DialogTitle><DialogDescription>Record the quantity of product used for a job.</DialogDescription></DialogHeader>{itemToLog && <StockUsageForm item={itemToLog} pools={companyPools} onSubmit={handleSaveUsage} onCancel={() => setIsUsageFormOpen(false)} />}</DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the product from your inventory.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </>
  );
}
