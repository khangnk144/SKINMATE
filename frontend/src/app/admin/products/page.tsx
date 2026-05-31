"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Search, AlertTriangle, X } from 'lucide-react';
import Image from 'next/image';
import { API_URL, buildListUrl, getItems, getPaginationMeta } from '@/lib/api';

interface ConfirmDialog {
  open: boolean;
  message: string;
  onConfirm: () => void;
}
const CLOSED_DIALOG: ConfirmDialog = { open: false, message: '', onConfirm: () => {} };


interface Product {
  id: string;
  name: string;
  brand: string;
  imageUrl: string | null;
  ingredients: {
    ingredientId: number;
    position: number;
    ingredient: { name: string };
  }[];
}

export default function AdminProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    imageUrl: ''
  });
  const [ingredientString, setIngredientString] = useState('');
  const [dialog, setDialog] = useState<ConfirmDialog>(CLOSED_DIALOG);

  const fetchData = async () => {
    try {
      const prodRes = await fetch(buildListUrl('/admin/products', {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
      }), { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (!prodRes.ok) throw new Error('Failed to fetch data');
      
      const data = await prodRes.json();
      setProducts(getItems<Product>(data));
      setTotalItems(getPaginationMeta<Product>(data).total);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    const timeout = window.setTimeout(fetchData, 250);
    return () => window.clearTimeout(timeout);
  }, [token, currentPage, searchTerm]);

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', brand: '', imageUrl: '' });
    setIngredientString('');
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      brand: product.brand,
      imageUrl: product.imageUrl || ''
    });
    setIngredientString(product.ingredients.map(i => i.ingredient.name).join(', '));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const url = editingId 
      ? `${API_URL}/admin/products/${editingId}`
      : `${API_URL}/admin/products`;

    try {
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          brand: formData.brand,
          imageUrl: formData.imageUrl || undefined,
          ingredientNames: ingredientString.split(',').map(i => i.trim()).filter(i => i.length > 0)
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save product');
      }

      setSuccess(`Product ${editingId ? 'updated' : 'created'} successfully!`);
      resetForm();
      fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    }
  };

  const handleDelete = (id: string) => {
    setDialog({
      open: true,
      message: 'Bạn có chắc chắn muốn xóa sản phẩm này không?',
      onConfirm: async () => {
        setDialog(CLOSED_DIALOG);
        try {
          const res = await fetch(`${API_URL}/admin/products/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('Failed to delete product');
          fetchData();
        } catch (err: unknown) {
          if (err instanceof Error) setError(err.message);
        }
      },
    });
  };

  if (loading) return <div className="text-lg font-light text-slate-400 animate-pulse tracking-wide">Đang tải...</div>;

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedProducts = products;

  return (
    <div>
      {/* Custom Confirm Dialog */}
      {dialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setDialog(CLOSED_DIALOG)} />
          <div className="relative bg-white rounded-2xl shadow-xl border border-rose-50 max-w-sm w-full p-8 flex flex-col items-center text-center" style={{ animation: 'fadeInScale 0.18s ease-out' }}>
            <button onClick={() => setDialog(CLOSED_DIALOG)} className="absolute top-4 right-4 p-1.5 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-all"><X className="w-4 h-4" /></button>
            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mb-4"><AlertTriangle className="w-6 h-6 text-rose-400" /></div>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">{dialog.message}</p>
            <div className="flex gap-3 w-full">
              <button onClick={() => setDialog(CLOSED_DIALOG)} className="flex-1 px-4 py-2.5 text-sm text-slate-500 bg-gray-100 hover:bg-gray-200 rounded-full transition-all">Hủy</button>
              <button onClick={dialog.onConfirm} className="flex-1 px-4 py-2.5 text-sm text-white bg-rose-400 hover:bg-rose-500 rounded-full hover:shadow-md transition-all">Xóa</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes fadeInScale { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) } }`}</style>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-serif text-slate-900 tracking-tight">Sản phẩm</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm kiếm theo tên hoặc thương hiệu..."
              className="bg-white/70 backdrop-blur-sm rounded-full border border-rose-100 px-6 py-2 pl-10 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all"
            />
          </div>
          {editingId && (
            <button 
              onClick={resetForm}
              className="bg-gray-50 text-slate-600 px-6 py-2.5 rounded-full text-sm font-medium tracking-wide hover:bg-gray-100 transition-all"
            >
              Hủy chỉnh sửa
            </button>
          )}
        </div>
      </div>

      {error && <div className="bg-rose-50 text-rose-700 p-4 rounded-xl mb-8 text-sm font-medium text-center border border-rose-100">{error}</div>}
      {success && <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-8 text-sm font-medium text-center border border-emerald-100">{success}</div>}

      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-rose-50/50 mb-12 flex flex-col lg:flex-row gap-12">
        
        <form onSubmit={handleSubmit} className="flex-[1.5]">
          <h2 className="text-xl font-serif text-slate-800 mb-8">{editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 ml-1 mb-2">Tên sản phẩm</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3.5 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all text-sm"
                placeholder="VD: Ultra Facial Cream"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 ml-1 mb-2">Thương hiệu</label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-3.5 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all text-sm"
                placeholder="VD: Kiehl's"
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 ml-1 mb-2">Đường dẫn hình ảnh (Tùy chọn)</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-4 py-3.5 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all text-sm"
              placeholder="https://example.com/product.jpg"
            />
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-10 py-3.5 text-white bg-slate-900 rounded-full text-sm font-medium tracking-wide hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
          >
            {editingId ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
          </button>
        </form>

        <div className="flex-1 border-t lg:border-t-0 lg:border-l border-rose-50 pt-10 lg:pt-0 lg:pl-12">
          <h2 className="text-xl font-serif text-slate-800 mb-2">Thành phần INCI</h2>
          <p className="text-sm text-slate-400 font-light mb-6">Dán danh sách thành phần, ngăn cách bằng dấu phẩy.</p>
          <textarea
            value={ingredientString}
            onChange={(e) => setIngredientString(e.target.value)}
            className="w-full h-64 px-4 py-4 border border-gray-200 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all text-sm resize-none"
            placeholder="VD: Nước, Glycerin, Niacinamide, ..."
          />
        </div>

      </div>

      <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl border border-rose-50/50 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full divide-y divide-rose-50">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-8 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest">Sản phẩm</th>
              <th className="px-8 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest">Thương hiệu</th>
              <th className="px-8 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest">Thành phần</th>
              <th className="px-8 py-5 text-right text-xs font-semibold text-slate-400 uppercase tracking-widest">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-rose-50/50">
            {paginatedProducts.map((prod) => (
              <tr key={prod.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-slate-800">
                  <div className="flex items-center">
                    {prod.imageUrl && (
                      <Image src={prod.imageUrl} alt={prod.name} width={40} height={40} sizes="40px" className="h-10 w-10 rounded-full mr-4 object-cover ring-2 ring-rose-50" />
                    )}
                    <span className="tracking-tight">{prod.name}</span>
                  </div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-500 font-light">{prod.brand}</td>
                <td className="px-8 py-5 text-sm text-slate-500 max-w-md truncate font-light">
                  {prod.ingredients.map(i => i.ingredient.name).join(', ') || <span className="text-slate-300 italic">Không có thành phần</span>}
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-right text-sm">
                  <button 
                    onClick={() => handleEdit(prod)}
                    className="text-emerald-600 hover:text-emerald-700 mr-6 transition-colors font-semibold"
                  >
                    Sửa
                  </button>
                  <button 
                    onClick={() => handleDelete(prod.id)}
                    className="text-rose-400 hover:text-rose-500 transition-colors font-semibold"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {paginatedProducts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center text-sm text-slate-400 font-light italic">
                  Không tìm thấy sản phẩm nào.
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
    </div>
  );
}
