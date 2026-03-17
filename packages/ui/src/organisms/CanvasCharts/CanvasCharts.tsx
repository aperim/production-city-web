'use client';

import { cn } from '../../lib/utils';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export type ChartType = 'line' | 'bar' | 'area' | 'pie';

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface ChartConfig {
  id: string;
  title: string;
  type: ChartType;
  data: ChartDataPoint[];
  color?: string;
}

export interface CanvasChartsProps {
  charts: ChartConfig[];
  onChartClick?: (chartId: string, dataPoint?: ChartDataPoint) => void;
  showTable?: boolean;
  className?: string;
}

const CHART_COLORS = [
  'var(--color-primary, #6c8eff)',
  'var(--color-secondary, #a78bfa)',
  '#14b8a6',
  '#f97316',
  '#ef4444',
  '#8b5cf6',
];

function ChartRenderer({
  chart,
  onChartClick,
}: {
  chart: ChartConfig;
  onChartClick?: (chartId: string, dataPoint?: ChartDataPoint) => void;
}) {
  const color = chart.color || CHART_COLORS[0];

  const handleClick = (data?: ChartDataPoint) => {
    onChartClick?.(chart.id, data);
  };

  switch (chart.type) {
    case 'line':
      return (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chart.data} onClick={() => handleClick()}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #333)" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground, #888)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground, #888)" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chart.data} onClick={() => handleClick()}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #333)" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground, #888)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground, #888)" />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    case 'area':
      return (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chart.data} onClick={() => handleClick()}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #333)" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground, #888)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground, #888)" />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.15} />
          </AreaChart>
        </ResponsiveContainer>
      );
    case 'pie':
      return (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart onClick={() => handleClick()}>
            <Tooltip />
            <Legend />
            <Pie data={chart.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
              {chart.data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      );
  }
}

export function CanvasCharts({
  charts,
  onChartClick,
  showTable = false,
  className,
}: CanvasChartsProps) {
  if (charts.length === 0) {
    return (
      <div className={cn('py-8 text-center text-sm text-muted-foreground', className)}>
        No charts configured
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {charts.map((chart) => (
          <div
            key={chart.id}
            data-chart
            className="flex flex-col gap-2 border rounded-sm p-3 bg-card"
          >
            <div className="text-sm font-medium">{chart.title}</div>
            <ChartRenderer chart={chart} onChartClick={onChartClick} />
          </div>
        ))}
      </div>

      {showTable && (
        <table className="w-full border-collapse text-sm" role="table">
          <thead>
            <tr className="border-b">
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Chart</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Type</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Points</th>
            </tr>
          </thead>
          <tbody>
            {charts.map((chart) => (
              <tr key={chart.id} className="border-b">
                <td className="px-3 py-2">{chart.title}</td>
                <td className="px-3 py-2 capitalize text-muted-foreground">{chart.type}</td>
                <td className="px-3 py-2 text-right text-muted-foreground">{chart.data.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
