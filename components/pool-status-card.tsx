
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Waves, Wind, Thermometer } from 'lucide-react';
import { Pool } from '@/lib/types';

const StatusItem = ({ icon: Icon, label, value, variant }: { icon: React.ElementType, label: string, value: string, variant?: "default" | "secondary" | "destructive" | "outline" | null | undefined }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="size-4" />
      <span>{label}</span>
    </div>
    <Badge variant={variant} className="text-sm">{value}</Badge>
  </div>
);

export function PoolStatusCard({ pool }: { pool: Pool }) {
  if (!pool) {
    return (
       <Card>
        <CardHeader>
          <CardTitle>Pool Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No pool data available.</p>
        </CardContent>
      </Card>
    );
  }
  
  const pumpStatus = pool.status === 'Active' ? 'ON' : 'OFF';
  const heaterStatus = pool.heatpump?.heatpump_on ? 'ON' : 'OFF';
  const temperature = pool.heatpump?.heatpump_temperature ? `${pool.heatpump.heatpump_temperature}°C` : 'N/A';
  const coverStatus = pool.pool_cover || 'N/A';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{pool.pool_name} - Status</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <StatusItem icon={Waves} label="Pump" value={pumpStatus} variant={pool.status === 'Active' ? 'default' : 'secondary'} />
        <StatusItem icon={Flame} label="Heater" value={heaterStatus} variant={pool.heatpump?.heatpump_on ? 'default' : 'secondary'} />
        <StatusItem icon={Thermometer} label="Temperature" value={temperature} variant="secondary" />
        <StatusItem icon={Wind} label="Cover" value={coverStatus} variant="secondary" />
      </CardContent>
    </Card>
  );
}
