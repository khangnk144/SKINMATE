"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api';
import {
  FlaskConical,
  ShieldCheck,
  Package,
  Users,
  ScanLine,
  ArrowRight,
  Plus,
  Upload,
} from 'lucide-react';

interface DashboardStats {
  ingredients: number;
  rules: number;
  products: number;
  users: number;
  analyses: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  href,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: number | null;
  accent: string;
  href?: string;
  loading: boolean;
}) {
  const inner = (
    <div
      className={`group relative bg-white rounded-3xl border border-rose-50/60 shadow-[0_4px_24px_rgb(0,0,0,0.04)] p-7 flex flex-col gap-4 transition-all duration-300 ${
        href ? 'hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.09)] cursor-pointer' : ''
      }`}
    >
      {/* Icon bubble */}
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Value */}
      {loading ? (
        <div className="h-9 w-24 rounded-xl bg-slate-100 animate-pulse" />
      ) : (
        <p className="text-4xl font-semibold text-slate-800 tracking-tight tabular-nums">
          {value?.toLocaleString('vi-VN') ?? '—'}
        </p>
      )}

      {/* Label + arrow */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          {label}
        </span>
        {href && (
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-200" />
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setStats(data);
      } catch {
        // fail silently — cards will show "—"
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  const kpiCards = [
    {
      icon: FlaskConical,
      label: 'Thành phần',
      value: stats?.ingredients ?? null,
      accent: 'bg-emerald-50 text-emerald-600',
      href: '/admin/ingredients',
    },
    {
      icon: ShieldCheck,
      label: 'Quy tắc an toàn',
      value: stats?.rules ?? null,
      accent: 'bg-rose-50 text-rose-500',
      href: '/admin/rules',
    },
    {
      icon: Package,
      label: 'Sản phẩm',
      value: stats?.products ?? null,
      accent: 'bg-violet-50 text-violet-500',
      href: '/admin/products',
    },
    {
      icon: Users,
      label: 'Người dùng',
      value: stats?.users ?? null,
      accent: 'bg-sky-50 text-sky-500',
      href: '/admin/users',
    },
    {
      icon: ScanLine,
      label: 'Lượt quét OCR',
      value: stats?.analyses ?? null,
      accent: 'bg-amber-50 text-amber-500',
    },
  ];

  const quickActions = [
    {
      icon: Plus,
      label: 'Thêm thành phần',
      description: 'Thêm nguyên liệu mới vào hệ thống',
      href: '/admin/ingredients',
      accent: 'bg-emerald-600 hover:bg-emerald-700',
    },
    {
      icon: Plus,
      label: 'Thêm sản phẩm',
      description: 'Thêm sản phẩm mỹ phẩm mới',
      href: '/admin/products',
      accent: 'bg-violet-600 hover:bg-violet-700',
    },
    {
      icon: Upload,
      label: 'Nhập / Xuất dữ liệu',
      description: 'Import hoặc export file Excel',
      href: '/admin/import-export',
      accent: 'bg-slate-700 hover:bg-slate-800',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-serif text-slate-900 mb-10 tracking-tight">
        Bảng Điều Khiển
      </h1>

      {/* KPI Cards */}
      <section>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
          Tổng quan hệ thống
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {kpiCards.map((card) => (
            <StatCard key={card.label} loading={loading} {...card} />
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mt-12">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
          Thao tác nhanh
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <div className="group bg-white rounded-3xl border border-rose-50/60 shadow-[0_4px_24px_rgb(0,0,0,0.04)] p-7 flex items-center gap-5 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.09)] transition-all duration-300 cursor-pointer">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-white transition-colors duration-200 ${action.accent}`}
                >
                  <action.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{action.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{action.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-200 ml-auto flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
