"use client";

import { useEffect, useState } from 'react';
import { AlertCircle, Check, Search, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API_URL, buildListUrl, getItems, getPaginationMeta } from '@/lib/api';

type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type SafetyEffect = 'GOOD' | 'BAD' | 'NEUTRAL';

interface AiSuggestion {
  id: number;
  ingredientName: string;
  skinType: string;
  suggestedEffect: SafetyEffect;
  suggestedDescription: string | null;
  status: ReviewStatus;
  source: string;
  occurrenceCount: number;
  createdAt: string;
  reviewedAt: string | null;
  adminNote: string | null;
}

interface ReviewModal {
  open: boolean;
  suggestion: AiSuggestion | null;
  action: 'approve' | 'reject' | null;
}

const CLOSED_MODAL: ReviewModal = { open: false, suggestion: null, action: null };

const SKIN_TYPE_LABELS: Record<string, string> = {
  OILY: 'Dầu',
  DRY: 'Khô',
  SENSITIVE: 'Nhạy cảm',
  COMBINATION: 'Hỗn hợp',
  NORMAL: 'Bình thường',
};

const getEffectBadge = (effect: SafetyEffect) => {
  const classes = {
    GOOD: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    BAD: 'bg-rose-50 text-rose-700 border-rose-200',
    NEUTRAL: 'bg-stone-50 text-slate-600 border-stone-200',
  }[effect];

  const label = {
    GOOD: 'Tốt',
    BAD: 'Xấu',
    NEUTRAL: 'Trung bình',
  }[effect];

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${classes}`}>
      {label}
    </span>
  );
};

export default function AdminAiSuggestionsPage() {
  const { token } = useAuth();
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [status, setStatus] = useState<ReviewStatus>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<ReviewModal>(CLOSED_MODAL);
  const [adminNote, setAdminNote] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!token) return;
      setLoading(true);
      setError('');
      try {
        const url = buildListUrl('/admin/ai-suggestions', {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
        });
        const separator = url.includes('?') ? '&' : '?';
        const res = await fetch(`${url}${separator}status=${status}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Không thể tải hàng chờ AI');

        const data = await res.json();
        setSuggestions(getItems<AiSuggestion>(data));
        setTotalItems(getPaginationMeta<AiSuggestion>(data).total);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    };

    const timeout = window.setTimeout(fetchSuggestions, 250);
    return () => window.clearTimeout(timeout);
  }, [token, currentPage, searchTerm, status]);

  const openReviewModal = (suggestion: AiSuggestion, action: 'approve' | 'reject') => {
    setModal({ open: true, suggestion, action });
    setAdminNote('');
    setError('');
  };

  const handleResolve = async () => {
    if (!token || !modal.suggestion || !modal.action) return;

    setIsResolving(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/admin/ai-suggestions/${modal.suggestion.id}/${modal.action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adminNote }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Duyệt đề xuất AI thất bại');
      }

      setSuggestions((prev) => prev.filter((item) => item.id !== modal.suggestion?.id));
      setTotalItems((prev) => Math.max(0, prev - 1));
      setModal(CLOSED_MODAL);
      setAdminNote('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setIsResolving(false);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="animate-in fade-in duration-700">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-serif text-slate-900 tracking-tight">Duyệt đề xuất AI</h1>
          <p className="mt-2 max-w-2xl text-sm font-light leading-relaxed text-slate-500">
            Các phân loại từ Gemini được giữ ở đây cho đến khi admin xác nhận. Chỉ đề xuất được duyệt mới cập nhật vào Ingredient và IngredientRule chính thức.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as ReviewStatus);
              setCurrentPage(1);
            }}
            className="rounded-full border border-rose-100 bg-white/80 px-5 py-2.5 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-rose-200"
          >
            <option value="PENDING">Đang chờ</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Đã từ chối</option>
          </select>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm ingredient..."
              className="rounded-full border border-rose-100 bg-white/80 py-2.5 pl-10 pr-5 text-sm text-slate-700 outline-none transition-all focus:ring-2 focus:ring-rose-200"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-center text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-rose-50/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {loading ? (
          <div className="flex justify-center p-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-100 border-t-amber-500" />
          </div>
        ) : suggestions.length === 0 ? (
          <div className="flex flex-col items-center p-20 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-slate-300" />
            <p className="font-medium text-slate-600">Không có đề xuất AI nào trong trạng thái này.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-rose-50">
              <thead className="bg-slate-50/60">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-widest text-slate-400">Thành phần</th>
                  <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-widest text-slate-400">Đề xuất</th>
                  <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-widest text-slate-400">Mô tả AI</th>
                  <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-widest text-slate-400">Lượt gặp</th>
                  <th className="px-6 py-5 text-right text-xs font-semibold uppercase tracking-widest text-slate-400">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50/70">
                {suggestions.map((suggestion) => (
                  <tr key={suggestion.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-5">
                      <p className="font-medium capitalize text-slate-800">{suggestion.ingredientName}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {SKIN_TYPE_LABELS[suggestion.skinType] || suggestion.skinType} · {suggestion.source}
                      </p>
                    </td>
                    <td className="px-6 py-5">{getEffectBadge(suggestion.suggestedEffect)}</td>
                    <td className="max-w-md px-6 py-5">
                      <p className="line-clamp-2 text-sm font-light leading-relaxed text-slate-600" title={suggestion.suggestedDescription || ''}>
                        {suggestion.suggestedDescription || 'Không có mô tả'}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex min-w-10 justify-center rounded-xl bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                        {suggestion.occurrenceCount}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      {suggestion.status === 'PENDING' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openReviewModal(suggestion, 'approve')}
                            className="rounded-xl border border-emerald-100 p-2 text-emerald-600 transition-colors hover:bg-emerald-50"
                            title="Duyệt và cập nhật rule chính thức"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openReviewModal(suggestion, 'reject')}
                            className="rounded-xl border border-rose-100 p-2 text-rose-600 transition-colors hover:bg-rose-50"
                            title="Từ chối đề xuất"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                          {suggestion.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-rose-50/70 bg-slate-50/30 px-6 py-5">
            <p className="text-sm font-light text-slate-500">
              Trang <span className="font-medium text-slate-700">{currentPage}</span> / <span className="font-medium text-slate-700">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {modal.open && modal.suggestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={() => setModal(CLOSED_MODAL)}>
          <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setModal(CLOSED_MODAL)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-800">
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-2 text-2xl font-serif text-slate-800">
              {modal.action === 'approve' ? 'Duyệt đề xuất AI' : 'Từ chối đề xuất AI'}
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-slate-500">
              {modal.action === 'approve'
                ? `Duyệt "${modal.suggestion.ingredientName}" sẽ tạo/cập nhật ingredient và rule chính thức.`
                : `Từ chối "${modal.suggestion.ingredientName}" sẽ chỉ đóng đề xuất, không cập nhật database chính thức.`}
            </p>

            <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="font-medium capitalize text-slate-800">{modal.suggestion.ingredientName}</span>
                {getEffectBadge(modal.suggestion.suggestedEffect)}
              </div>
              <p className="text-sm font-light leading-relaxed text-slate-600">
                {modal.suggestion.suggestedDescription || 'Không có mô tả'}
              </p>
            </div>

            <label className="mb-2 block text-sm font-medium text-slate-700">Ghi chú admin (tùy chọn)</label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="mb-6 h-24 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
              placeholder="Lý do duyệt hoặc từ chối..."
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModal(CLOSED_MODAL)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={handleResolve}
                disabled={isResolving}
                className={`rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
                  modal.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
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
