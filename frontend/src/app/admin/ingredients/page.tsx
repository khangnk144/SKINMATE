"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Search } from 'lucide-react';

interface Ingredient {
  id: number;
  name: string;
  description: string | null;
}

export default function AdminIngredients() {
  const { token } = useAuth();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchIngredients = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/admin/ingredients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch ingredients');
      const data = await res.json();
      setIngredients(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchIngredients();
  }, [token]);

  const handleOpenModal = (ingredient?: Ingredient) => {
    if (ingredient) {
      setEditingIngredient(ingredient);
      setFormData({ name: ingredient.name, description: ingredient.description || '' });
    } else {
      setEditingIngredient(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
    setError('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIngredient(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const url = editingIngredient 
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/admin/ingredients/${editingIngredient.id}`
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/admin/ingredients`;
    
    const method = editingIngredient ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Operation failed');
      }

      await fetchIngredients();
      handleCloseModal();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thành phần này không?')) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/admin/ingredients/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete');
      await fetchIngredients();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  if (loading) return <div className="text-lg font-light text-slate-400 animate-pulse tracking-wide">Đang tải thành phần...</div>;

  const filteredIngredients = ingredients.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedIngredients = filteredIngredients.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-serif text-slate-900 tracking-tight">Thành phần</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-medium tracking-wide hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
        >
          Thêm mới
        </button>
      </div>

      <div className="flex justify-end mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm kiếm thành phần..."
            className="bg-white/70 backdrop-blur-sm rounded-full border border-rose-100 px-6 py-2 pl-10 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all"
          />
        </div>
      </div>

      {error && <div className="bg-rose-50 text-rose-700 p-4 rounded-xl mb-8 text-sm font-medium text-center border border-rose-100">{error}</div>}

      <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl border border-rose-50/50 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full divide-y divide-rose-50">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-8 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest">ID</th>
              <th className="px-8 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest">Tên</th>
              <th className="px-8 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest">Mô tả</th>
              <th className="px-8 py-5 text-right text-xs font-semibold text-slate-400 uppercase tracking-widest">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-rose-50/50">
            {paginatedIngredients.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-400 font-light">#{item.id}</td>
                <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-slate-800 tracking-tight">{item.name}</td>
                <td className="px-8 py-5 text-sm text-slate-500 font-light max-w-md truncate">
                  {item.description || <span className="text-slate-300 italic">Không có mô tả</span>}
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-right text-sm">
                  <button 
                    onClick={() => handleOpenModal(item)}
                    className="text-emerald-600 hover:text-emerald-700 mr-6 transition-colors font-semibold"
                  >
                    Sửa
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="text-rose-400 hover:text-rose-500 transition-colors font-semibold"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {paginatedIngredients.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center text-sm text-slate-400 font-light italic">
                  Chưa có thành phần nào trong cơ sở dữ liệu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>

        {totalPages > 1 && (
          <div className="px-8 py-5 border-t border-rose-50/50 flex items-center justify-between bg-gray-50/30">
            <div className="text-sm text-slate-500 font-light">
              Trang <span className="font-medium text-slate-700">{currentPage}</span> / <span className="font-medium text-slate-700">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgb(0,0,0,0.1)] w-full max-w-2xl p-10 md:p-12 border border-rose-50">
            <h2 className="text-xl font-serif text-slate-800 mb-6">
              {editingIngredient ? 'Chỉnh sửa thành phần' : 'Thêm thành phần'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 ml-1 mb-2">Tên (INCI)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3.5 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all text-sm"
                  placeholder="VD: Niacinamide"
                />
              </div>
              <div className="mb-8">
                <label className="block text-sm font-medium text-slate-700 ml-1 mb-2">Mô tả</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3.5 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all text-sm resize-none"
                  placeholder="Mô tả tùy chọn"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 text-sm font-medium text-slate-600 bg-gray-50 rounded-full hover:bg-gray-100 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-full hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
                >
                  {editingIngredient ? 'Lưu thay đổi' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
