"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

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
    if (!confirm('Are you sure you want to delete this ingredient?')) return;
    
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

  if (loading) return <div className="text-lg font-light text-slate-400 animate-pulse tracking-wide">Loading ingredients...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-serif text-slate-900 tracking-tight">Ingredients</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-medium tracking-wide hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
        >
          Add New
        </button>
      </div>

      {error && <div className="bg-rose-50 text-rose-700 p-4 rounded-xl mb-8 text-sm font-medium text-center border border-rose-100">{error}</div>}

      <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl border border-rose-50/50 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full divide-y divide-rose-50">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-8 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest">ID</th>
              <th className="px-8 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest">Name</th>
              <th className="px-8 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest">Description</th>
              <th className="px-8 py-5 text-right text-xs font-semibold text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-rose-50/50">
            {ingredients.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-400 font-light">#{item.id}</td>
                <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-slate-800 tracking-tight">{item.name}</td>
                <td className="px-8 py-5 text-sm text-slate-500 font-light max-w-md truncate">
                  {item.description || <span className="text-slate-300 italic">No description</span>}
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-right text-sm">
                  <button 
                    onClick={() => handleOpenModal(item)}
                    className="text-emerald-600 hover:text-emerald-700 mr-6 transition-colors font-semibold"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="text-rose-400 hover:text-rose-500 transition-colors font-semibold"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {ingredients.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center text-sm text-slate-400 font-light italic">
                  No ingredients in the database yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgb(0,0,0,0.1)] w-full max-w-2xl p-10 md:p-12 border border-rose-50">
            <h2 className="text-xl font-serif text-slate-800 mb-6">
              {editingIngredient ? 'Edit Ingredient' : 'Add Ingredient'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 ml-1 mb-2">Name (INCI)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3.5 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all text-sm"
                  placeholder="e.g. Niacinamide"
                />
              </div>
              <div className="mb-8">
                <label className="block text-sm font-medium text-slate-700 ml-1 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3.5 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all text-sm resize-none"
                  placeholder="Optional description"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 text-sm font-medium text-slate-600 bg-gray-50 rounded-full hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-full hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
                >
                  {editingIngredient ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
