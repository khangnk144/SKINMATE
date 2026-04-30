"use client";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-serif text-slate-900 mb-10 tracking-tight">Bảng Điều Khiển</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-rose-50/50 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] duration-300">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest">Thành phần</h3>
          <p className="text-3xl font-serif text-emerald-600 mt-3">Quản lý</p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-rose-50/50 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] duration-300">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest">Quy tắc an toàn</h3>
          <p className="text-3xl font-serif text-rose-400 mt-3">Cấu hình</p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-rose-50/50 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] duration-300">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest">Sản phẩm</h3>
          <p className="text-3xl font-serif text-slate-800 mt-3">Xem</p>
        </div>
      </div>
    </div>
  );
}
