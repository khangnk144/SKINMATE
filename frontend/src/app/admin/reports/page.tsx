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

const skinTypeMap: Record<string, string> = {
  'NORMAL': 'Da thường',
  'OILY': 'Da dầu',
  'DRY': 'Da khô',
  'SENSITIVE': 'Da nhạy cảm',
  'COMBINATION': 'Da hỗn hợp',
};

export default function AdminReports() {
  const { token } = useAuth();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/admin/reports`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Không thể tải báo cáo');
        const reportData = await res.json();
        setData(reportData);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchReports();
  }, [token]);

  if (loading) return <div className="text-lg font-light text-slate-400 animate-pulse tracking-wide">Đang tạo báo cáo thống kê...</div>;

  const downloadCSV = () => {
    if (!data) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Loại da,Số lượng\n";
    data.skinTypeDistribution.forEach(row => {
      const translatedType = skinTypeMap[row.type] || row.type;
      csvContent += `${translatedType},${row.count}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "skinmate_reports.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="mb-10">
        <h1 className="text-3xl font-serif text-slate-900 tracking-tight">Báo Cáo Hệ Thống</h1>
        <p className="text-slate-500 mt-2 font-light">Tổng quan về việc sử dụng nền tảng SKINMATE và nhân khẩu học người dùng.</p>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-xl mb-8 text-sm font-medium text-center border border-rose-100">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-rose-50/50 transition-all hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] group">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Tổng Số Người Dùng</h3>
          <div className="flex items-baseline gap-4">
            <p className="text-5xl font-serif text-slate-900 leading-none">{data?.totalUsers || 0}</p>
            <span className="text-emerald-500 text-sm font-medium bg-emerald-50 px-2 py-0.5 rounded-full">Cộng Đồng Hoạt Động</span>
          </div>
          <div className="h-1 w-12 bg-rose-200 mt-8 rounded-full group-hover:w-24 transition-all duration-500"></div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-rose-50/50 transition-all hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] group">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Tổng Số Lượt Phân Tích</h3>
          <div className="flex items-baseline gap-4">
            <p className="text-5xl font-serif text-emerald-600 leading-none">{data?.totalAnalyses || 0}</p>
            <span className="text-rose-400 text-sm font-medium bg-rose-50 px-2 py-0.5 rounded-full">Kiểm Tra An Toàn</span>
          </div>
          <div className="h-1 w-12 bg-emerald-200 mt-8 rounded-full group-hover:w-24 transition-all duration-500"></div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-rose-50/50">
          <h3 className="text-lg font-serif text-slate-800 mb-8">Phân Bổ Loại Da</h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.skinTypeDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => {
                    const translatedName = skinTypeMap[name] || name;
                    return `${translatedName} ${((percent || 0) * 100).toFixed(0)}%`;
                  }}
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
              <p className="text-sm text-slate-400 font-medium uppercase tracking-tighter mb-1">Chỉ Số Tăng Trưởng</p>
              <p className="text-slate-600 font-light leading-relaxed">
                Nền tảng đang ghi nhận sự <span className="text-emerald-600 font-semibold">gia tăng ổn định</span> của người dùng có ý thức về an toàn.
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium uppercase tracking-tighter mb-1">Chất Lượng Dữ Liệu</p>
              <p className="text-slate-600 font-light leading-relaxed">
                Tất cả các số liệu được cập nhật theo thời gian thực từ cơ sở dữ liệu của chúng tôi.
              </p>
            </div>
            <div className="pt-4">
              <button 
                onClick={downloadCSV}
                className="w-full py-4 border border-rose-100 text-rose-400 rounded-2xl hover:bg-rose-50 transition-all font-medium text-sm"
              >
                Xuất Dữ Liệu (CSV)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
