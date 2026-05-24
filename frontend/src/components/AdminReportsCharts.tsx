"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

interface AdminReportsChartsProps {
  data: {
    type: string;
    count: number;
  }[];
}

const COLORS = ['#E11D48', '#10B981', '#6366F1', '#F59E0B', '#64748B', '#EC4899'];

export default function AdminReportsCharts({ data }: AdminReportsChartsProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
          outerRadius={140}
          fill="#8884d8"
          dataKey="count"
          nameKey="type"
          innerRadius={80}
          paddingAngle={5}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            padding: '12px 20px'
          }}
        />
        <Legend verticalAlign="bottom" height={36}/>
      </PieChart>
    </ResponsiveContainer>
  );
}
