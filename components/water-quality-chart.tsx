
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartConfig = {
  ph: {
    label: 'pH',
    color: 'hsl(var(--chart-1))',
  },
  chlorine: {
    label: 'Chlorine (ppm)',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

interface WaterQualityChartProps {
  className?: string;
  data: { date: string; ph: number; chlorine: number }[];
}

export function WaterQualityChart({ className, data }: WaterQualityChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Water Quality - Last 7 Days</CardTitle>
        <CardDescription>pH and Chlorine Levels</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="ph" fill="var(--color-ph)" radius={4} />
            <Bar dataKey="chlorine" fill="var(--color-chlorine)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
