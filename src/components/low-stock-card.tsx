
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StockItem } from '@/lib/types';
import { AlertTriangle } from 'lucide-react';

interface LowStockCardProps {
    items: StockItem[];
}

export function LowStockCard({ items }: LowStockCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="text-destructive" /> Low Stock Alerts
        </CardTitle>
        <CardDescription>Products that have fallen below their set threshold.</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>In Stock</TableHead>
                        <TableHead>Threshold</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map(item => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-destructive font-bold">{item.quantity} {item.unit}</TableCell>
                            <TableCell>{item.low_stock_threshold} {item.unit}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
                All stock levels are healthy.
            </p>
        )}
      </CardContent>
    </Card>
  );
}
