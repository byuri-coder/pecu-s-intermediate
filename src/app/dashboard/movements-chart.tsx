'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const chartData = [
  { date: '2024-01-01', carbono: 120, tributos: 80, terras: 40 },
  { date: '2024-01-02', carbono: 140, tributos: 90, terras: 50 },
  { date: '2024-01-03', carbono: 160, tributos: 110, terras: 60 },
  { date: '2024-01-04', carbono: 130, tributos: 120, terras: 55 },
  { date: '2024-01-05', carbono: 180, tributos: 100, terras: 70 },
  { date: '2024-01-06', carbono: 220, tributos: 130, terras: 80 },
  { date: '2024-01-07', carbono: 210, tributos: 140, terras: 90 },
];

const chartConfig = {
  total: {
    label: 'Total',
    color: 'hsl(var(--chart-1))',
  },
  carbono: {
    label: 'Carbono',
    color: 'hsl(var(--chart-2))',
  },
  tributos: {
    label: 'Tributos',
    color: 'hsl(var(--chart-3))',
  },
  terras: {
    label: 'Terras',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;

export function MovementsChart() {
  const [timeRange, setTimeRange] = React.useState<keyof typeof chartConfig>('total');

  const filteredData = React.useMemo(() => {
    if (timeRange === 'total') {
        return chartData.map(d => ({
            date: d.date,
            value: d.carbono + d.tributos + d.terras
        }));
    }
    return chartData.map(d => ({
        date: d.date,
        value: d[timeRange]
    }));
  }, [timeRange]);

  const activeChart = timeRange;

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
        <div className="grid flex-1 gap-1">
          <CardTitle>Visão Geral das Movimentações</CardTitle>
          <CardDescription>
            Acompanhe o volume de transações ao longo do tempo.
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={(value) => setTimeRange(value as keyof typeof chartConfig)}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Selecione o tipo de movimentação"
          >
            <SelectValue placeholder="Filtrar" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="total" className="rounded-lg">
              Visão Geral
            </SelectItem>
            <SelectItem value="carbono" className="rounded-lg">
              Carbono
            </SelectItem>
            <SelectItem value="tributos" className="rounded-lg">
              Tributos
            </SelectItem>
            <SelectItem value="terras" className="rounded-lg">
              Terras
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id={`fill-${activeChart}`} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={`var(--color-${activeChart})`}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={`var(--color-${activeChart})`}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('pt-BR', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
             <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `R$${value}`}
             />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString('pt-BR', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  }
                  formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number)}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="value"
              type="natural"
              fill={`url(#fill-${activeChart})`}
              stroke={`var(--color-${activeChart})`}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
