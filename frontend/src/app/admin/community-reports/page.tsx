"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import { Check, X, Search, AlertCircle } from "lucide-react";

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

export default function AdminCommunityReportsPage() {
  const { token } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Resolve Modal State
  const [resolveModal, setResolveModal] = useState<{ isOpen: boolean; reportId: number | null; status: 'APPROVED' | 'REJECTED' | null }>({ isOpen: false, reportId: null, status: null });
  const [adminNote, setAdminNote] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [token]);

  const fetchReports = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/reports/pending?sortBy=votes`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!resolveModal.reportId || !resolveModal.status || !token) return;
    
    setIsResolving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/reports/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          reportId: resolveModal.reportId,
          status: resolveModal.status,
          adminNote: adminNote
        })
      });
      
      if (res.ok) {
        setReports(prev => prev.filter(r => r.id !== resolveModal.reportId));
        setResolveModal({ isOpen: false, reportId: null, status: null });
        setAdminNote('');
      } else {
        alert('Có lỗi xảy ra khi duyệt báo cáo');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối');
    } finally {
      setIsResolving(false);
    }
  };

  const getEffectBadge = (effect: string) => {
    switch (effect) {
      case 'GOOD': return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">Tốt</span>;
      case 'BAD': return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">Xấu</span>;
      default: return <span className="bg-stone-50 text-slate-600 border border-stone-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">Trung bình</span>;
    }
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-serif text-slate-900 tracking-tight mb-2">Duyệt Báo Cáo</h1>
      <p className="text-slate-500 font-light">Xét duyệt các đề xuất điều chỉnh phân loại thành phần từ cộng đồng.</p>
      
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mt-8">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-rose-200 border-t-rose-500 animate-spin"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center">
             <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
             <p className="text-slate-500 font-medium">Không có báo cáo nào đang chờ duyệt</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6 font-medium">Thành Phần</th>
                  <th className="p-4 font-medium">Người Báo Cáo</th>
                  <th className="p-4 font-medium">Đề Xuất (Da)</th>
                  <th className="p-4 font-medium max-w-xs">Lý Do</th>
                  <th className="p-4 font-medium">Vote Score</th>
                  <th className="p-4 pr-6 font-medium text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-medium text-slate-800 capitalize">{report.ingredient.name}</div>
                      {report.evidenceUrl && (
                        <a href={report.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-rose-500 hover:underline mt-1 inline-block">Xem dẫn chứng</a>
                      )}
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {report.user.displayName || report.user.username}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-start gap-1.5">
                        {getEffectBadge(report.reportedEffect)}
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{SKIN_TYPE_LABELS[report.skinType]}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-slate-600 line-clamp-2 max-w-xs" title={report.reason}>{report.reason}</p>
                    </td>
                    <td className="p-4">
                      <div className="inline-flex items-center justify-center min-w-[2.5rem] h-7 rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                        {report.voteScore > 0 ? '+' : ''}{report.voteScore}
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setResolveModal({ isOpen: true, reportId: report.id, status: 'APPROVED' })}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                          title="Duyệt (Cập nhật Rules)"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setResolveModal({ isOpen: true, reportId: report.id, status: 'REJECTED' })}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                          title="Từ chối"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      {resolveModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setResolveModal({ isOpen: false, reportId: null, status: null })}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setResolveModal({ isOpen: false, reportId: null, status: null })}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-2xl font-serif text-slate-800 mb-2">
              {resolveModal.status === 'APPROVED' ? 'Duyệt báo cáo' : 'Từ chối báo cáo'}
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              {resolveModal.status === 'APPROVED' 
                ? 'Thao tác này sẽ tự động cập nhật hệ thống luật phân loại (Ingredient Rules) theo đề xuất của báo cáo này.' 
                : 'Báo cáo sẽ bị từ chối và không ảnh hưởng đến hệ thống luật hiện tại.'}
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Ghi chú của Admin (Tùy chọn)</label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none resize-none h-24 text-sm"
                placeholder="Lý do duyệt/từ chối để giải thích cho người dùng..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setResolveModal({ isOpen: false, reportId: null, status: null })}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleResolve}
                disabled={isResolving}
                className={`px-5 py-2.5 rounded-xl text-white font-medium transition-colors disabled:opacity-50 text-sm flex items-center gap-2 ${
                  resolveModal.status === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isResolving ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
