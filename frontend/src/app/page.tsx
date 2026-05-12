'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user, logout, isLoading } = useAuth();

  useEffect(() => {
    async function checkHealth() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/health`);
        if (!response.ok) {
          throw new Error('Lỗi kết nối máy chủ');
        }
        const data = await response.json();
        setHealthStatus(data.message);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Máy chủ ngoại tuyến');
      }
    }
    checkHealth();
  }, []);

  return (
    <div className="min-h-[calc(100vh-5rem)] relative overflow-hidden">
      {/* Soft Pastel Gradient Background */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-[#fef5f8] via-[#fffbfc] to-[#ffffff]"></div>

      {/* Dreamy Blur Overlays */}
      <div className="fixed top-0 right-0 w-[800px] h-[800px] -z-10 opacity-50 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(252,232,238,0.3)_0%,rgba(254,245,248,0.2)_50%,transparent_100%)] blur-3xl rounded-full"></div>
      </div>
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] -z-10 opacity-35 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(248,250,249,0.4)_0%,rgba(254,254,254,0.2)_50%,transparent_100%)] blur-3xl rounded-full"></div>
      </div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] -z-10 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,240,245,0.2)_0%,transparent_100%)] blur-[100px] rounded-full"></div>
      </div>

      <main className="pt-10 pb-20 relative">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden">
          {/* Background Images with Gradient Overlay */}
          <div className="absolute inset-0 z-0">
            {/* Main hero image */}
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1519084278803-b94f11e1c63b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
                alt="Luxury skincare"
                className="w-full h-full object-cover opacity-15"
              />
            </div>

            {/* Gradient overlays for readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-[#fffbfc]/95 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#fef9fa]/50 via-transparent to-white/40" />
          </div>

          <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <div className="text-left">
                <h1
                  className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-6 text-[var(--gray-800)] tracking-tight leading-[1.1]"
                  style={{ fontFamily: 'var(--font-serif)', fontWeight: 300 }}
                >
                  Khám Phá
                  <br />
                  Làn Da{' '}
                  <span
                    className="text-[var(--rose-500)] whitespace-nowrap"
                    style={{ fontWeight: 600 }}
                  >
                    Hoàn Hảo
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-[var(--gray-600)] max-w-xl mb-12 leading-relaxed">
                  Phân tích thành phần mỹ phẩm bằng AI, cá nhân hóa theo loại da.
                </p>

                {/* CTA Buttons */}
                {!isLoading && (
                  <div className="flex flex-wrap items-center gap-4">
                    {user ? (
                      <>
                        <Link
                          href="/analysis"
                          className="px-8 py-4 rounded-full bg-rose-400 hover:bg-rose-500 text-white font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                        >
                          Phân Tích Ngay
                        </Link>
                        <Link
                          href="/profile"
                          className="px-8 py-4 rounded-full border-2 border-gray-300 text-gray-600 hover:text-rose-400 hover:border-rose-400 font-medium transition-all duration-300"
                        >
                          Hồ Sơ Của Tôi
                        </Link>
                        <button
                          onClick={logout}
                          className="px-6 py-4 text-sm font-bold text-gray-400 hover:text-rose-400 uppercase tracking-widest transition-colors"
                        >
                          Đăng Xuất
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/register"
                          className="px-8 py-4 rounded-full bg-rose-400 hover:bg-rose-500 text-white font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                        >
                          Bắt Đầu Ngay
                        </Link>
                        <Link
                          href="/login"
                          className="px-8 py-4 rounded-full border-2 border-gray-300 text-gray-600 hover:text-rose-400 hover:border-rose-400 font-medium transition-all duration-300"
                        >
                          Đăng Nhập
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Lifestyle Images */}
              <div className="hidden lg:grid grid-cols-2 gap-6">
                {/* Image 1 - Large */}
                <div className="col-span-2 relative group">
                  <div className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-black/10">
                    <img
                      src="https://i.postimg.cc/cCf9QTmr/image.png"
                      alt="Woman applying luxury serum"
                      className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--rose-500)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </div>

                {/* Image 2 - Small Left */}
                <div className="relative group">
                  <div className="relative overflow-hidden rounded-[2rem] shadow-xl shadow-black/10">
                    <img
                      src="https://i.postimg.cc/GpBjFq3b/image.png"
                      alt="Luxury skincare products"
                      className="w-full h-[280px] object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--sage-500)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </div>

                {/* Image 3 - Small Right */}
                <div className="relative group mt-8">
                  <div className="relative overflow-hidden rounded-[2rem] shadow-xl shadow-black/10">
                    <img
                      src="https://i.postimg.cc/028dW82g/image.png"
                      alt="Minimal skincare aesthetic"
                      className="w-full h-[280px] object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--rose-500)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Soft Decorative Blobs */}
          <div className="absolute top-1/4 right-[10%] w-72 h-72 bg-[radial-gradient(circle_at_center,rgba(252,232,238,0.2)_0%,transparent_100%)] rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 left-[5%] w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(245,250,248,0.15)_0%,transparent_100%)] rounded-full blur-[140px] pointer-events-none" />
        </section>

        <div className="max-w-[1200px] mx-auto px-6 mt-12">
          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Phân tích AI',
                description: 'Đánh giá INCI theo dữ liệu và loại da',
                color: 'rose',
              },
              {
                title: 'Lọc độ phù hợp',
                description: 'Phân loại thành phần theo mức độ an toàn',
                color: 'sage',
              },
              {
                title: 'Gợi ý sản phẩm',
                description: 'Gợi ý sản phẩm không chứa thành phần gây hại',
                color: 'rose',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-lg shadow-black/5 border border-black/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-black/10"
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color === 'rose'
                      ? 'from-[var(--rose-100)] to-[var(--rose-200)]'
                      : 'from-[var(--sage-100)] to-[var(--sage-200)]'
                    } mb-6 flex items-center justify-center transition-all duration-500 group-hover:scale-110`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg ${feature.color === 'rose'
                        ? 'bg-[var(--rose-400)]'
                        : 'bg-[var(--sage-400)]'
                      }`}
                  />
                </div>
                <h3
                  className="text-2xl mb-3 text-[var(--gray-800)]"
                  style={{ fontFamily: 'var(--font-serif)', fontWeight: 500 }}
                >
                  {feature.title}
                </h3>
                <p className="text-[var(--gray-600)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Subtle Status */}
        <div className="max-w-[1200px] mx-auto px-6 mt-24 opacity-40 hover:opacity-100 transition-opacity duration-700 flex justify-center">
          <div className="flex items-center gap-4 text-[10px] font-black tracking-[0.3em] uppercase text-slate-400">
            <div className="h-px w-8 bg-slate-200"></div>
            {error ? (
              <span className="text-rose-400 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-rose-400 animate-pulse"></span>
                {error}
              </span>
            ) : healthStatus ? (
              <span className="text-emerald-500 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                Đồng bộ đám mây hoạt động
              </span>
            ) : (
              <span>Đang kết nối...</span>
            )}
            <div className="h-px w-8 bg-slate-200"></div>
          </div>
        </div>
      </main>
    </div>
  );
}
