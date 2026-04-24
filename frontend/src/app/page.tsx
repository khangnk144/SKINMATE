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
        const response = await fetch('http://localhost:5000/api/v1/health');
        if (!response.ok) {
          throw new Error('Backend Connection Error');
        }
        const data = await response.json();
        setHealthStatus(data.message);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Backend Offline');
      }
    }
    checkHealth();
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center py-20 px-4">
      {/* Background Blobs & Aura */}
      <div className="absolute top-[-25%] right-[-15%] w-[1000px] h-[1000px] bg-rose-200/40 rounded-full blur-[140px] -z-10 animate-pulse duration-[10s]"></div>
      <div className="absolute bottom-[-25%] left-[-15%] w-[1000px] h-[1000px] bg-pink-200/30 rounded-full blur-[140px] -z-10 animate-pulse duration-[15s]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[150%] bg-[radial-gradient(circle_at_center,rgba(255,200,210,0.5)_0%,transparent_70%)] -z-20"></div>
      <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-rose-100/40 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-pink-50/50 rounded-full blur-[120px] -z-10"></div>

      {/* Hero Section */}
      <section className="text-center space-y-8 max-w-4xl relative z-10">
        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/50 backdrop-blur-sm border border-rose-100 rounded-full mb-4 animate-in fade-in slide-in-from-top-4 duration-1000">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-300"></span>
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.25em]">Est. 2026 • Science-Backed Beauty</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-serif text-slate-900 tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000">
          Unveil the <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-rose-400 italic">Truth</span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-500 font-light leading-relaxed max-w-2xl mx-auto animate-in fade-in duration-1000 delay-300">
          Elevate your daily ritual with luxury ingredient intelligence. Discover exactly what you're applying to your skin.
        </p>
      </section>

      {/* Action Card */}
      <div className="mt-16 w-full max-w-xl bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/60 p-12 md:p-16 text-center shadow-[0_20px_50px_rgba(0,0,0,0.03)] animate-in zoom-in-95 duration-1000 delay-500">
        <h2 className="text-3xl font-serif text-slate-800 mb-10 tracking-tight leading-tight">
          {user ? (
            <>Welcome back, <span className="text-rose-400">{user.name || 'Beautiful'}</span></>
          ) : (
            'Begin Your Transformation'
          )}
        </h2>

        {!isLoading && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {user ? (
              <>
                <Link href="/analysis" className="group w-full sm:w-auto px-10 py-5 text-xs font-black tracking-[0.2em] uppercase text-white bg-slate-900 rounded-2xl hover:bg-slate-800 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-300/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative">Run Analysis</span>
                </Link>
                <Link href="/profile" className="w-full sm:w-auto px-10 py-5 text-xs font-black tracking-[0.2em] uppercase text-slate-600 bg-white border border-stone-100 rounded-2xl hover:bg-stone-50 transition-all duration-500 hover:-translate-y-1">
                  My Profile
                </Link>
                <button onClick={logout} className="mt-6 sm:mt-0 sm:ml-4 text-[10px] font-bold text-slate-300 hover:text-rose-400 uppercase tracking-widest transition-colors">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/register" className="group w-full sm:w-auto px-12 py-5 text-xs font-black tracking-[0.2em] uppercase text-white bg-rose-400 rounded-2xl hover:bg-rose-500 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative">Get Started</span>
                </Link>
                <Link href="/login" className="w-full sm:w-auto px-12 py-5 text-xs font-black tracking-[0.2em] uppercase text-slate-700 bg-white border border-stone-100 rounded-2xl hover:bg-stone-50 transition-all duration-500 hover:-translate-y-1">
                  Sign In
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      {/* Subtle Status */}
      <div className="mt-24 opacity-40 hover:opacity-100 transition-opacity duration-700">
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
              Cloud Sync Active
            </span>
          ) : (
            <span>Connecting...</span>
          )}
          <div className="h-px w-8 bg-slate-200"></div>
        </div>
      </div>
    </div>
  );
}
