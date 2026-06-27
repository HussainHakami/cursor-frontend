"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface SectorChartProps {
  data: { name: string; value: number; color: string; percent: number }[];
}

export function SectorPieChart({ data }: SectorChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        لا توجد بيانات
      </div>
    );
  }

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
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{ direction: "rtl", borderRadius: "12px" }}
        />
        <Legend
          layout="vertical"
          align="left"
          verticalAlign="middle"
          wrapperStyle={{ fontSize: "12px", direction: "rtl" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface PerformanceChartProps {
  data: { month: string; value: number }[];
}

export function PerformanceLineChart({ data }: PerformanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis
          tick={{ fontSize: 12 }}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{ direction: "rtl", borderRadius: "12px" }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#006C35"
          strokeWidth={2.5}
          dot={{ fill: "#006C35", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface HoldingsBarChartProps {
  data: { name: string; value: number; gainLoss: number }[];
}

export function HoldingsBarChart({ data }: HoldingsBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          type="number"
          tick={{ fontSize: 12 }}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
        />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{ direction: "rtl", borderRadius: "12px" }}
        />
        <Bar dataKey="value" fill="#006C35" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
