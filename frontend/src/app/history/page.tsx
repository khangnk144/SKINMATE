'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, History as HistoryIcon, ArrowLeft, Loader2 } from 'lucide-react';

interface HistoryItem {
  id: string;
  userId: string;
  rawInput: string;
  createdAt: string;
}

export default function HistoryPage() {
  const { user, token, isLoading } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [fetching, setFetching] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchHistory = async () => {
    if (!token) return;
    setFetching(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch history');
      }

      const data = await res.json();
      setHistory(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'An error occurred while fetching history');
      } else {
        setError('An error occurred while fetching history');
      }
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!isLoading && user && token) {
      fetchHistory();
    }
  }, [user, token, isLoading]);

  const deleteItem = async (id: string) => {
    if (!token || !confirm('Are you sure you want to delete this analysis?')) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/history/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to delete item');
      }

      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete item');
    } finally {
      setDeletingId(null);
    }
  };

  const clearAllHistory = async () => {
    if (!token || !confirm('Are you sure you want to clear ALL analysis history? This cannot be undone.')) return;
    
    setIsClearingAll(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/history`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to clear history');
      }

      setHistory([]);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to clear history');
    } finally {
      setIsClearingAll(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-rose-300 animate-spin mb-4" />
        <p className="text-lg font-light text-gray-400 tracking-wide">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-5rem)] relative flex flex-col items-center justify-center px-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(252,232,238,0.25)_0%,transparent_100%)] rounded-full blur-[140px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(245,250,248,0.2)_0%,transparent_100%)] rounded-full blur-[140px] -z-10"></div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/40 p-12 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] max-w-md w-full text-center">
          <HistoryIcon className="w-16 h-16 text-rose-200 mx-auto mb-6" />
          <h2
            className="text-2xl mb-4 text-gray-800 tracking-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Please Sign In
          </h2>
          <p className="mb-8 text-gray-500 leading-relaxed">You need to be signed in to view your analysis history.</p>
          <Link
            href="/login"
            className="block px-8 py-4 bg-gray-900 text-white text-sm font-medium tracking-wide rounded-full hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 w-full"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] relative py-16 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-20 right-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(252,232,238,0.2)_0%,transparent_100%)] rounded-full blur-[150px] -z-10"></div>
      <div className="absolute bottom-20 left-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(245,250,248,0.15)_0%,transparent_100%)] rounded-full blur-[150px] -z-10"></div>

      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1
              className="text-5xl text-gray-900 tracking-tight mb-2"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Analysis History
            </h1>
            <p className="text-gray-400 text-sm tracking-widest uppercase">Track your past ingredient checks</p>
          </div>
          <div className="flex items-center gap-4">
            {history.length > 0 && (
              <button
                onClick={clearAllHistory}
                disabled={isClearingAll}
                className="text-sm text-gray-400 hover:text-rose-500 transition-colors flex items-center gap-2 px-4 py-2"
              >
                {isClearingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Clear All
              </button>
            )}
            <Link
              href="/"
              className="text-sm tracking-wide text-rose-400 hover:text-rose-500 font-medium transition-colors flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full shadow-sm border border-rose-50/50"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 px-6 py-4 rounded-2xl text-sm font-medium text-center flex items-center justify-center gap-3 mb-8">
            <span className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></span>
            {error}
          </div>
        )}

        {fetching ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="w-16 h-16 text-rose-300 animate-spin mb-4" />
            <p className="text-gray-400" style={{ fontFamily: 'var(--font-serif)' }}>
              Loading your history...
            </p>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-sm p-20 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] text-center border border-white/40">
            <div className="bg-rose-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
              <HistoryIcon className="w-10 h-10 text-rose-300" />
            </div>
            <p
              className="text-gray-500 mb-8 text-xl"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              You have no analysis history yet.
            </p>
            <Link
              href="/analysis"
              className="px-8 py-4 bg-rose-400 text-white text-sm font-medium tracking-wide rounded-full hover:bg-rose-500 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 inline-block"
            >
              Analyze Your First Product
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-white/60 backdrop-blur-sm p-6 md:p-8 rounded-[2rem] shadow-lg shadow-black/5 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-white/40 group"
              >
                <div className="flex-1 mr-6 w-full md:w-auto mb-6 md:mb-0">
                  <p className="text-xs text-gray-400 mb-2 tracking-widest uppercase flex items-center gap-2">
                    <span className="w-1 h-1 bg-rose-300 rounded-full"></span>
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-gray-700 line-clamp-2 md:line-clamp-1 leading-relaxed">{item.rawInput}</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => router.push(`/analysis?inci=${encodeURIComponent(item.rawInput)}`)}
                    className="flex-1 md:flex-none px-6 py-3 bg-rose-50 text-rose-500 text-sm font-medium tracking-wide rounded-full hover:bg-rose-100 transition-all duration-300 whitespace-nowrap"
                  >
                    Re-analyze
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    disabled={deletingId === item.id}
                    className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all duration-300 disabled:opacity-50"
                    title="Delete record"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}