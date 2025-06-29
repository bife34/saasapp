
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from './ui/badge';

interface ActiveSystemsCardProps {
  title: string;
  icon: React.ElementType;
  activeItems: string[];
  emptyText: string;
}

export function ActiveSystemsCard({ title, icon: Icon, activeItems, emptyText }: ActiveSystemsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {activeItems.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {activeItems.map(item => (
              <Badge key={item} variant="outline">{item}</Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground pt-2">{emptyText}</p>
        )}
      </CardContent>
    </Card>
  );
}
