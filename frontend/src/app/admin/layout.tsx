"use client";

import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Bảng điều khiển', href: '/admin' },
    { name: 'Thành phần', href: '/admin/ingredients' },
    { name: 'Quy tắc an toàn', href: '/admin/rules' },
    { name: 'Sản phẩm', href: '/admin/products' },
    { name: 'Người dùng', href: '/admin/users' },
    { name: 'Báo cáo', href: '/admin/reports' },
    { name: 'BC Cộng đồng', href: '/admin/community-reports' },
    { name: 'Nhập / Xuất', href: '/admin/import-export' },
  ];

  return (
    <AdminProtectedRoute>
      <div className="flex flex-col md:flex-row min-h-screen bg-[#FAFAFA] font-sans">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-rose-100 shadow-[4px_0_20px_rgb(0,0,0,0.02)]">
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-serif text-slate-800 tracking-wide">Bảng Quản Trị</h2>
            <p className="text-xs text-slate-400 mt-1 tracking-widest uppercase">Quản lý</p>
          </div>
          <nav className="mt-2 px-4 pb-4 md:pb-0 flex flex-wrap md:flex-col gap-2 md:gap-1 md:space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block py-2 px-4 md:py-3 text-sm tracking-wide rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-medium'
                      : 'text-slate-500 hover:bg-gray-50 hover:text-slate-700'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <main className="p-10 md:p-14">
            {children}
          </main>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}
