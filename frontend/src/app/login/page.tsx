"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}`}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Đăng nhập thất bại");
      }

      login(data.token, data.user);
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đăng nhập thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] relative flex items-center justify-center px-4 py-16">
      <div className="absolute top-20 right-[-5%] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(252,232,238,0.25)_0%,transparent_100%)] rounded-full blur-[140px] -z-10"></div>
      <div className="absolute bottom-20 left-[-5%] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(245,250,248,0.2)_0%,transparent_100%)] rounded-full blur-[140px] -z-10"></div>

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Image */}
        <div className="hidden lg:block relative w-full h-[600px] rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
          <img
            src="https://i.postimg.cc/bwqYWws7/image.png"
            alt="Luxury skincare"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          <div className="absolute bottom-12 left-12 right-12 text-white">
            <p
              className="text-3xl mb-2 tracking-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Chào mừng trở lại
            </p>
            <p className="text-white/80 text-sm tracking-widest uppercase">Tiếp tục hành trình chăm sóc da của bạn</p>
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="bg-white/70 backdrop-blur-xl border border-white/50 p-10 md:p-12 rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
            <div className="mb-10">
              <h2
                className="text-3xl text-gray-800 mb-3 tracking-tight"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Đăng Nhập
              </h2>
              <p className="text-gray-500 leading-relaxed">
                Chào mừng trở lại! Vui lòng nhập thông tin đăng nhập để tiếp tục hành trình chăm sóc da của bạn.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-3 p-4 bg-rose-50/50 border border-rose-100 rounded-2xl text-rose-600 text-sm">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0116 0z"></path>
                  </svg>
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">
                  Tên đăng nhập
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-50 focus:border-rose-200 focus:bg-white transition-all text-gray-700 placeholder:text-gray-300"
                  placeholder="Nhập tên đăng nhập"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">
                  Mật khẩu
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-50 focus:border-rose-200 focus:bg-white transition-all text-gray-700 placeholder:text-gray-300"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full py-5 rounded-[2rem] overflow-hidden transition-all duration-500 ${loading ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-900 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1'
                  }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-300/20 to-emerald-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative text-white text-sm font-semibold tracking-widest uppercase">
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </span>
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400">
                Chưa có tài khoản?{' '}
                <Link
                  href="/register"
                  className="text-rose-400 hover:text-rose-500 font-medium underline underline-offset-4 decoration-rose-200 transition-colors"
                >
                  Tham gia Skinmate
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
