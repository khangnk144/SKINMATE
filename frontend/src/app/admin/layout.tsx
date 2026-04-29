"use client";

import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Ingredients', href: '/admin/ingredients' },
    { name: 'Rules', href: '/admin/rules' },
    { name: 'Products', href: '/admin/products' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Reports', href: '/admin/reports' },
    { name: 'Import / Export', href: '/admin/import-export' },
  ];

  return (
    <AdminProtectedRoute>
      <div className="flex min-h-screen bg-[#FAFAFA] font-sans">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-rose-100 shadow-[4px_0_20px_rgb(0,0,0,0.02)]">
          <div className="p-8">
            <h2 className="text-xl font-serif text-slate-800 tracking-wide">Admin Panel</h2>
            <p className="text-xs text-slate-400 mt-1 tracking-widest uppercase">Management</p>
          </div>
          <nav className="mt-2 px-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block py-3 px-4 text-sm tracking-wide rounded-xl transition-all duration-200 ${
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
