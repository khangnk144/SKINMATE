"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';


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
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    imageUrl: ''
  });
  const [ingredientString, setIngredientString] = useState('');

  const fetchData = async () => {
    try {
      const prodRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/admin/products`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (!prodRes.ok) throw new Error('Failed to fetch data');
      
      setProducts(await prodRes.json());
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

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
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/admin/products/${editingId}`
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/admin/products`;

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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete product');
      fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    }
  };

  if (loading) return <div className="text-lg font-light text-slate-400 animate-pulse tracking-wide">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-serif text-slate-900 tracking-tight">Products</h1>
        {editingId && (
          <button 
            onClick={resetForm}
            className="bg-gray-50 text-slate-600 px-6 py-2.5 rounded-full text-sm font-medium tracking-wide hover:bg-gray-100 transition-all"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {error && <div className="bg-rose-50 text-rose-700 p-4 rounded-xl mb-8 text-sm font-medium text-center border border-rose-100">{error}</div>}
      {success && <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-8 text-sm font-medium text-center border border-emerald-100">{success}</div>}

      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-rose-50/50 mb-12 flex flex-col lg:flex-row gap-12">
        
        <form onSubmit={handleSubmit} className="flex-[1.5]">
          <h2 className="text-xl font-serif text-slate-800 mb-8">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 ml-1 mb-2">Product Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3.5 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all text-sm"
                placeholder="e.g. Ultra Facial Cream"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 ml-1 mb-2">Brand</label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-3.5 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all text-sm"
                placeholder="e.g. Kiehl's"
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 ml-1 mb-2">Image URL (Optional)</label>
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
            {editingId ? 'Update Product' : 'Create Product'}
          </button>
        </form>

        <div className="flex-1 border-t lg:border-t-0 lg:border-l border-rose-50 pt-10 lg:pt-0 lg:pl-12">
          <h2 className="text-xl font-serif text-slate-800 mb-2">INCI Ingredients</h2>
          <p className="text-sm text-slate-400 font-light mb-6">Paste the ingredient list separated by commas.</p>
          <textarea
            value={ingredientString}
            onChange={(e) => setIngredientString(e.target.value)}
            className="w-full h-64 px-4 py-4 border border-gray-200 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all text-sm resize-none"
            placeholder="e.g. Water, Glycerin, Niacinamide, ..."
          />
        </div>

      </div>

      <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl border border-rose-50/50 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full divide-y divide-rose-50">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-8 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest">Product</th>
              <th className="px-8 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest">Brand</th>
              <th className="px-8 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest">Ingredients</th>
              <th className="px-8 py-5 text-right text-xs font-semibold text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-rose-50/50">
            {products.map((prod) => (
              <tr key={prod.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-slate-800">
                  <div className="flex items-center">
                    {prod.imageUrl && (
                      <img src={prod.imageUrl} alt={prod.name} className="h-10 w-10 rounded-full mr-4 object-cover ring-2 ring-rose-50" />
                    )}
                    <span className="tracking-tight">{prod.name}</span>
                  </div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-500 font-light">{prod.brand}</td>
                <td className="px-8 py-5 text-sm text-slate-500 max-w-md truncate font-light">
                  {prod.ingredients.map(i => i.ingredient.name).join(', ') || <span className="text-slate-300 italic">No ingredients</span>}
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-right text-sm">
                  <button 
                    onClick={() => handleEdit(prod)}
                    className="text-emerald-600 hover:text-emerald-700 mr-6 transition-colors font-semibold"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(prod.id)}
                    className="text-rose-400 hover:text-rose-500 transition-colors font-semibold"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center text-sm text-slate-400 font-light italic">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
