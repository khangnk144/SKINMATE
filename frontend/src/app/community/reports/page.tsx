"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ThumbsUp, ThumbsDown, Link as LinkIcon, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Report {
  id: number;
  ingredient: {
    id: number;
    name: string;
  };
  user: {
    id: string;
    username: string;
    displayName: string | null;
  };
  skinType: string;
  reportedEffect: 'GOOD' | 'BAD' | 'NEUTRAL';
  reason: string;
  evidenceUrl: string | null;
  status: string;
  createdAt: string;
  up: number;
  down: number;
  voteScore: number;
}

const SKIN_TYPE_LABELS: Record<string, string> = {
  OILY: "Dầu",
  DRY: "Khô",
  SENSITIVE: "Nhạy cảm",
  COMBINATION: "Hỗn hợp",
  NORMAL: "Bình thường"
};

export default function CommunityReportsPage() {
  const { token, user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'votes' | 'newest'>('votes');
  const [userVotes, setUserVotes] = useState<Record<number, 'UP' | 'DOWN' | null>>({});

  useEffect(() => {
    fetchReports();
  }, [sortBy, token]);

  const fetchReports = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/reports/pending?sortBy=${sortBy}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data.data);
        
        // Fetch user's votes for these reports
        const votes: Record<number, 'UP' | 'DOWN' | null> = {};
        for (const report of data.data) {
          const voteRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/reports/vote/${report.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (voteRes.ok) {
            const voteData = await voteRes.json();
            votes[report.id] = voteData.voteType;
          }
        }
        setUserVotes(votes);
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (reportId: number, voteType: 'UP' | 'DOWN') => {
    if (!token) return;
    
    // Save current state for rollback
    const prevVotes = { ...userVotes };
    const prevReports = [...reports];
    
    // Determine new vote state (toggle if same)
    const currentVote = userVotes[reportId];
    const newVote = currentVote === voteType ? null : voteType;

    // Apply Optimistic Update Immediately
    setUserVotes(prev => ({ ...prev, [reportId]: newVote }));
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        let newUp = r.up;
        let newDown = r.down;

        if (currentVote === 'UP') newUp--;
        if (currentVote === 'DOWN') newDown--;

        if (newVote === 'UP') newUp++;
        if (newVote === 'DOWN') newDown++;

        return { ...r, up: newUp, down: newDown, voteScore: newUp - newDown };
      }
      return r;
    }));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/reports/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reportId, voteType })
      });
      
      if (res.ok) {
        // Sync with exact server counts just in case
        const result = await res.json();
        setUserVotes(prev => ({ ...prev, [reportId]: result.userVote }));
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, up: result.up, down: result.down, voteScore: result.up - result.down } : r));
      } else {
        throw new Error('Vote failed');
      }
    } catch (err) {
      console.error(err);
      // Revert optimistic update on failure
      setUserVotes(prevVotes);
      setReports(prevReports);
    }
  };

  const getEffectBadge = (effect: string) => {
    switch (effect) {
      case 'GOOD': return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">Tốt</span>;
      case 'BAD': return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">Xấu</span>;
      default: return <span className="bg-stone-50 text-slate-600 border border-stone-200 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">Trung bình</span>;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen relative bg-stone-50/30 px-4 py-16 pb-32">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-100/30 rounded-full blur-[140px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-50/30 rounded-full blur-[140px] -z-10 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-serif text-slate-900 tracking-tight mb-4">Báo Cáo Cộng Đồng</h1>
            <p className="text-slate-500 max-w-xl mx-auto font-light leading-relaxed">
              Cùng nhau xây dựng một cơ sở dữ liệu thành phần mỹ phẩm chính xác nhất. Bình chọn cho những báo cáo bạn thấy hợp lý để quản trị viên ưu tiên xem xét.
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setSortBy('votes')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold tracking-wider uppercase transition-all duration-300 ${
                sortBy === 'votes' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              Nổi bật nhất
            </button>
            <button
              onClick={() => setSortBy('newest')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold tracking-wider uppercase transition-all duration-300 ${
                sortBy === 'newest' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              Mới nhất
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 rounded-full border-2 border-rose-200 border-t-rose-500 animate-spin"></div>
              <p className="mt-4 font-serif text-slate-400 tracking-widest uppercase text-xs">Đang tải dữ liệu...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-xl border border-white/50 p-16 rounded-[3rem] text-center shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
              <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-6" />
              <h3 className="text-2xl font-serif text-slate-700 mb-2">Chưa có báo cáo nào</h3>
              <p className="text-slate-500 font-light">Hiện tại không có báo cáo nào đang chờ xử lý.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reports.map((report) => (
                <div key={report.id} className="bg-white/80 backdrop-blur-xl border border-white/60 p-8 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500 flex gap-6">
                  
                  {/* Voting Column */}
                  <div className="flex flex-col items-center gap-2 pt-2">
                    <button 
                      onClick={() => handleVote(report.id, 'UP')}
                      className={`p-2.5 rounded-full transition-colors ${userVotes[report.id] === 'UP' ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-50 text-slate-400 hover:bg-slate-100 hover:text-emerald-500'}`}
                    >
                      <ThumbsUp className="w-5 h-5" />
                    </button>
                    <span className={`font-bold text-lg ${userVotes[report.id] === 'UP' ? 'text-emerald-600' : userVotes[report.id] === 'DOWN' ? 'text-rose-600' : 'text-slate-600'}`}>
                      {report.voteScore}
                    </span>
                    <button 
                      onClick={() => handleVote(report.id, 'DOWN')}
                      className={`p-2.5 rounded-full transition-colors ${userVotes[report.id] === 'DOWN' ? 'bg-rose-100 text-rose-600' : 'bg-stone-50 text-slate-400 hover:bg-slate-100 hover:text-rose-500'}`}
                    >
                      <ThumbsDown className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Content Column */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-2xl font-serif text-slate-800 tracking-tight capitalize">{report.ingredient.name}</h3>
                      <div className="flex flex-col items-end gap-2">
                        {getEffectBadge(report.reportedEffect)}
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Cho da {SKIN_TYPE_LABELS[report.skinType]}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-6 text-sm text-slate-500">
                      <span className="font-medium text-slate-700">{report.user.displayName || report.user.username}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>{new Date(report.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>

                    <div className="bg-stone-50/50 rounded-2xl p-6 border border-stone-100 mb-4">
                      <p className="text-slate-600 leading-relaxed font-light whitespace-pre-wrap">{report.reason}</p>
                    </div>

                    {report.evidenceUrl && (
                      <a href={report.evidenceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-rose-500 hover:text-rose-600 font-medium group">
                        <LinkIcon className="w-4 h-4 group-hover:-rotate-45 transition-transform" />
                        Xem tài liệu dẫn chứng
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
