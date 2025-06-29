
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StockItem as StockItemType } from '@/lib/types';
import { mockStockItems } from '@/lib/mock-data';

const StockItem = ({ name, value, unit }: { name: string; value: number; unit: string; }) => (
  <div>
    <div className="mb-1 flex justify-between">
      <span className="text-sm font-medium">{name}</span>
      <span className="text-sm text-muted-foreground">{`${value} ${unit}`}</span>
    </div>
    <Progress value={value} aria-label={`${name} stock level`} />
  </div>
);

export function StockLevelsCard() {
  const stockForDisplay = mockStockItems.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chemical Stock Levels</CardTitle>
        <CardDescription>Inventory at main warehouse</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {stockForDisplay.map((item) => (
          <StockItem key={item.id} name={item.name} value={item.quantity} unit={item.unit} />
        ))}
      </CardContent>
    </Card>
  );
}
