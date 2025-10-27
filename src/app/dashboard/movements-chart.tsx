
'use client';

import * as React from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';

type ChartDataItem = {
  month: string;
  total: number;
  carbono: number;
  tributos: number;
  terras: number;
};

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
  const [chartData, setChartData] = React.useState<ChartDataItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchChartData = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/movements');
      const data = await response.json();
      if (data.ok) {
        // Format data for the chart
        const formattedData = data.movements.map((item: any) => ({
            month: item.month,
            total: item.total,
            carbono: item.byType['carbon-credit'] || 0,
            tributos: item.byType['tax-credit'] || 0,
            terras: item.byType['rural-land'] || 0,
        }));
        setChartData(formattedData);
      }
    } catch (error) {
      console.error("Failed to fetch chart data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchChartData();

    // Listen for updates from other tabs
    const channel = new BroadcastChannel("dashboard-update");
    channel.onmessage = (event) => {
        if(event.data === 'contract-finalized') {
            fetchChartData();
        }
    };

    return () => channel.close();
  }, [fetchChartData]);

  const filteredData = React.useMemo(() => {
    if (timeRange === 'total') {
      return chartData.map(d => ({
        date: d.month,
        value: d.total,
      }));
    }
    return chartData.map(d => ({
      date: d.month,
      value: d[timeRange],
    }));
  }, [timeRange, chartData]);

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
        {loading ? (
            <div className="h-[250px] w-full flex items-center justify-center">
                <Skeleton className="h-full w-full"/>
            </div>
        ) : filteredData.length > 0 ? (
            <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
            >
            <LineChart data={filteredData}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={(value) => {
                        const [year, month] = value.split('-');
                        const date = new Date(parseInt(year), parseInt(month) - 1);
                        return date.toLocaleDateString('pt-BR', {
                            month: 'short',
                        }).replace('.', '');
                    }}
                />
                <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `R$${new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(value)}`}
                />
                <ChartTooltip
                cursor={false}
                content={
                    <ChartTooltipContent
                    labelFormatter={(value) => {
                        const [year, month] = value.split('-');
                        const date = new Date(parseInt(year), parseInt(month) - 1);
                        return date.toLocaleDateString('pt-BR', {
                            month: 'long',
                            year: 'numeric'
                        });
                    }}
                    formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number)}
                    indicator="dot"
                    />
                }
                />
                <Line
                    dataKey="value"
                    type="monotone"
                    stroke={`var(--color-${activeChart})`}
                    strokeWidth={2}
                    dot={{
                        fill: `var(--color-${activeChart})`
                    }}
                    activeDot={{
                        r: 6
                    }}
                />
            </LineChart>
            </ChartContainer>
        ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <p>Nenhuma movimentação registrada ainda.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
