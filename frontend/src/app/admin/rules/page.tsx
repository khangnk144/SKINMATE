"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Ingredient {
  id: number;
  name: string;
}

interface Rule {
  id: number;
  ingredientId: number;
  skinType: string;
  effect: string;
  ingredient: {
    name: string;
  };
}

export default function AdminRules() {
  const { token } = useAuth();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    ingredientId: '',
    skinType: 'NORMAL',
    effect: 'NEUTRAL'
  });

  const fetchData = async () => {
    try {
      const [ingRes, rulesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/admin/ingredients`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/admin/rules`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (!ingRes.ok || !rulesRes.ok) throw new Error('Failed to fetch data');
      
      const ingData = await ingRes.json();
      const rulesData = await rulesRes.json();
      
      setIngredients(ingData);
      setRules(rulesData);
      
      if (ingData.length > 0 && !formData.ingredientId) {
        setFormData(prev => ({ ...prev, ingredientId: ingData[0].id.toString() }));
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/admin/rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ingredientId: parseInt(formData.ingredientId, 10),
          skinType: formData.skinType,
          effect: formData.effect
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create rule');
      }

      setSuccess('Rule created/updated successfully!');
      fetchData(); // Refresh rules
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/admin/rules/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete rule');
      fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    }
  };

  if (loading) return <div className="text-lg font-light text-slate-400 animate-pulse tracking-wide">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-serif text-slate-900 tracking-tight">Safety Rules</h1>
      </div>

      {error && <div className="bg-rose-50 text-rose-700 p-4 rounded-xl mb-8 text-sm font-medium text-center border border-rose-100">{error}</div>}
      {success && <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-8 text-sm font-medium text-center border border-emerald-100">{success}</div>}

      <div className="flex flex-col gap-10">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-rose-50/50">
          <h2 className="text-xl font-serif text-slate-800 mb-8">Add or Update Rule</h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 ml-1 mb-2">Ingredient</label>
              <select
                required
                value={formData.ingredientId}
                onChange={(e) => setFormData({ ...formData, ingredientId: e.target.value })}
                className="w-full px-4 py-3.5 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all text-sm"
              >
                {ingredients.map(ing => (
                  <option key={ing.id} value={ing.id}>{ing.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 ml-1 mb-2">Skin Type</label>
              <select
                required
                value={formData.skinType}
                onChange={(e) => setFormData({ ...formData, skinType: e.target.value })}
                className="w-full px-4 py-3.5 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all text-sm"
              >
                <option value="NORMAL">NORMAL</option>
                <option value="OILY">OILY</option>
                <option value="DRY">DRY</option>
                <option value="SENSITIVE">SENSITIVE</option>
                <option value="COMBINATION">COMBINATION</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 ml-1 mb-2">Safety Effect</label>
              <select
                required
                value={formData.effect}
                onChange={(e) => setFormData({ ...formData, effect: e.target.value })}
                className="w-full px-4 py-3.5 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all text-sm"
              >
                <option value="NEUTRAL">NEUTRAL</option>
                <option value="GOOD">GOOD</option>
                <option value="BAD">BAD</option>
              </select>
            </div>

            <div className="md:col-span-3 flex justify-end mt-4">
              <button
                type="submit"
                className="px-10 py-3.5 text-white bg-slate-900 rounded-full text-sm font-medium tracking-wide hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
              >
                Save Rule
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl border border-rose-50/50 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full divide-y divide-rose-50">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest">Ingredient</th>
                <th className="px-8 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest">Skin Type</th>
                <th className="px-8 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest">Effect</th>
                <th className="px-8 py-5 text-right text-xs font-semibold text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-rose-50/50">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-slate-800">{rule.ingredient.name}</td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-500 font-light">{rule.skinType}</td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm">
                    <span className={`px-4 py-1.5 inline-flex text-[10px] leading-5 font-semibold tracking-widest uppercase rounded-full ${
                      rule.effect === 'GOOD' ? 'bg-emerald-50 text-emerald-700' :
                      rule.effect === 'BAD' ? 'bg-rose-50 text-rose-700' : 'bg-gray-50 text-slate-600'
                    }`}>
                      {rule.effect}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right text-sm">
                    <button 
                      onClick={() => {
                        setFormData({
                          ingredientId: rule.ingredientId.toString(),
                          skinType: rule.skinType,
                          effect: rule.effect
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-emerald-600 hover:text-emerald-700 mr-6 transition-colors font-semibold"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(rule.id)}
                      className="text-rose-400 hover:text-rose-500 transition-colors font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {rules.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-sm text-slate-400 font-light italic">
                    No safety rules defined yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}
