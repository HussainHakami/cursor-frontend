import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { AllocationSlice } from '../types';
import { formatCurrency } from '../lib/format';

interface AllocationChartProps {
  data: AllocationSlice[];
}

export function AllocationChart({ data }: AllocationChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-text-secondary">
        Add holdings to see allocation
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a2332',
            border: '1px solid #2d3a4f',
            borderRadius: '8px',
            color: '#f1f5f9',
          }}
          formatter={(value: number) => [
            `${formatCurrency(value)} (${((value / total) * 100).toFixed(1)}%)`,
            'Value',
          ]}
        />
        <Legend
          verticalAlign="bottom"
          formatter={(value: string) => (
            <span style={{ color: '#94a3b8' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
