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
      const res = await fetch('http://localhost:5000/api/v1/history', {
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
      const res = await fetch(`http://localhost:5000/api/v1/history/${id}`, {
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
      const res = await fetch('http://localhost:5000/api/v1/history', {
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="w-10 h-10 text-rose-300 animate-spin mb-4" />
        <p className="text-lg font-light text-slate-400 tracking-wide">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAFA] px-4 py-16 font-sans">
        <div className="bg-white p-10 md:p-14 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-md w-full text-center border border-rose-50/50">
          <HistoryIcon className="w-16 h-16 text-rose-200 mx-auto mb-6" />
          <h2 className="text-2xl font-serif mb-4 text-slate-800">Please Sign In</h2>
          <p className="mb-8 text-slate-500 font-light">You need to be signed in to view your analysis history.</p>
          <Link href="/login" className="px-8 py-3.5 bg-slate-900 text-white text-sm font-medium tracking-wide rounded-full hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 inline-block w-full">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-serif text-slate-900 tracking-tight">Analysis History</h1>
            <p className="text-slate-500 font-light mt-2">Track your past ingredient checks and findings</p>
          </div>
          <div className="flex items-center gap-4">
            {history.length > 0 && (
              <button 
                onClick={clearAllHistory}
                disabled={isClearingAll}
                className="text-sm text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-2 px-4 py-2"
              >
                {isClearingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Clear All
              </button>
            )}
            <Link href="/" className="text-sm tracking-wide text-rose-400 hover:text-rose-500 font-medium transition-colors flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-rose-50">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 px-6 py-4 rounded-xl text-sm font-medium text-center flex items-center justify-center gap-3">
            <span className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></span>
            {error}
          </div>
        )}

        {fetching ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="w-8 h-8 text-rose-300 animate-spin mb-4" />
            <p className="text-slate-400 font-light">Loading your history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center border border-rose-50/50">
            <div className="bg-rose-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
              <HistoryIcon className="w-10 h-10 text-rose-300" />
            </div>
            <p className="text-slate-500 font-light mb-8 text-lg">You have no analysis history yet.</p>
            <Link href="/analysis" className="px-8 py-3.5 bg-rose-400 text-white text-sm font-medium tracking-wide rounded-full hover:bg-rose-500 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 inline-block">
              Analyze Your First Product
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {history.map((item) => (
              <div key={item.id} className="bg-white p-6 md:p-8 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-all duration-300 border border-slate-100 group">
                <div className="flex-1 mr-6 w-full md:w-auto mb-6 md:mb-0">
                  <p className="text-xs text-slate-400 mb-2 tracking-widest uppercase flex items-center gap-2">
                    <span className="w-1 h-1 bg-rose-300 rounded-full"></span>
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-slate-700 font-light line-clamp-2 md:line-clamp-1 leading-relaxed">
                    {item.rawInput}
                  </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => router.push(`/analysis?inci=${encodeURIComponent(item.rawInput)}`)}
                    className="flex-1 md:flex-none px-6 py-2.5 bg-rose-50 text-rose-500 text-sm font-medium tracking-wide rounded-full hover:bg-rose-100 transition-all duration-300 whitespace-nowrap"
                  >
                    Re-analyze
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    disabled={deletingId === item.id}
                    className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all duration-300 disabled:opacity-50"
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