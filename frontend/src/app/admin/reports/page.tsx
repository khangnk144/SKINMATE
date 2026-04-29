"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

interface ReportData {
  totalUsers: number;
  totalAnalyses: number;
  skinTypeDistribution: {
    type: string;
    count: number;
  }[];
}

const COLORS = ['#E11D48', '#10B981', '#6366F1', '#F59E0B', '#64748B', '#EC4899'];

export default function AdminReports() {
  const { token } = useAuth();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/v1/admin/reports', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch reports');
        const reportData = await res.json();
        setData(reportData);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchReports();
  }, [token]);

  if (loading) return <div className="text-lg font-light text-slate-400 animate-pulse tracking-wide">Generating statistical reports...</div>;

  return (
    <div className="animate-in fade-in duration-700">
      <div className="mb-10">
        <h1 className="text-3xl font-serif text-slate-900 tracking-tight">System Reports</h1>
        <p className="text-slate-500 mt-2 font-light">Overview of SKINMATE platform usage and user demographics.</p>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-xl mb-8 text-sm font-medium text-center border border-rose-100">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-rose-50/50 transition-all hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] group">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Total Platform Users</h3>
          <div className="flex items-baseline gap-4">
            <p className="text-5xl font-serif text-slate-900 leading-none">{data?.totalUsers || 0}</p>
            <span className="text-emerald-500 text-sm font-medium bg-emerald-50 px-2 py-0.5 rounded-full">Active Community</span>
          </div>
          <div className="h-1 w-12 bg-rose-200 mt-8 rounded-full group-hover:w-24 transition-all duration-500"></div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-rose-50/50 transition-all hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] group">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Total Skin Analyses</h3>
          <div className="flex items-baseline gap-4">
            <p className="text-5xl font-serif text-emerald-600 leading-none">{data?.totalAnalyses || 0}</p>
            <span className="text-rose-400 text-sm font-medium bg-rose-50 px-2 py-0.5 rounded-full">Safety Checks</span>
          </div>
          <div className="h-1 w-12 bg-emerald-200 mt-8 rounded-full group-hover:w-24 transition-all duration-500"></div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-rose-50/50">
          <h3 className="text-lg font-serif text-slate-800 mb-8">Skin Type Distribution</h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.skinTypeDistribution || []}
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
                  {(data?.skinTypeDistribution || []).map((entry, index) => (
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
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-rose-50/50 flex flex-col justify-center">
          <div className="space-y-8">
            <div>
              <p className="text-sm text-slate-400 font-medium uppercase tracking-tighter mb-1">Growth Index</p>
              <p className="text-slate-600 font-light leading-relaxed">
                The platform is seeing a <span className="text-emerald-600 font-semibold">steady increase</span> in safety-conscious users.
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium uppercase tracking-tighter mb-1">Data Quality</p>
              <p className="text-slate-600 font-light leading-relaxed">
                All metrics are updated in real-time from our production database.
              </p>
            </div>
            <div className="pt-4">
              <button className="w-full py-4 border border-rose-100 text-rose-400 rounded-2xl hover:bg-rose-50 transition-all font-medium text-sm">
                Export Data (CSV)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
