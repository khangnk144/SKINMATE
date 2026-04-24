"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface User {
  id: string;
  username: string;
  skinType: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'lock' | 'unlock' | 'delete';
    userId: string;
    username: string;
  }>({
    isOpen: false,
    type: 'lock',
    userId: '',
    username: ''
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const openConfirmModal = (user: User, type: 'lock' | 'unlock' | 'delete') => {
    setConfirmModal({
      isOpen: true,
      type,
      userId: user.id,
      username: user.username
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  const handleAction = async () => {
    const { type, userId } = confirmModal;
    try {
      let url = `http://localhost:5000/api/v1/admin/users/${userId}`;
      let method = 'DELETE';

      if (type === 'lock' || type === 'unlock') {
        url = `http://localhost:5000/api/v1/admin/users/${userId}/status`;
        method = 'PATCH';
      }

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Action failed');
      
      await fetchUsers();
      closeConfirmModal();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Action failed');
      closeConfirmModal();
    }
  };

  if (loading) return <div className="text-lg font-light text-slate-400 animate-pulse tracking-wide">Loading users...</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-serif text-slate-900 tracking-tight">User Management</h1>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-xl mb-8 text-sm font-medium text-center border border-rose-100">
          {error}
        </div>
      )}

      <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl border border-rose-50/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-rose-50">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest">Username</th>
                <th className="px-8 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest">Skin Type</th>
                <th className="px-8 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-8 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest">Joined</th>
                <th className="px-8 py-5 text-right text-xs font-semibold text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-rose-50/50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-800 tracking-tight">{user.username}</div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-500">
                    <span className="px-2.5 py-1 bg-slate-50 rounded-lg text-xs font-medium uppercase tracking-wider text-slate-600">
                      {user.skinType || 'Not set'}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-500 font-light">
                    {user.role}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    {user.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                        Locked
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-400 font-light">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right text-sm">
                    {user.role !== 'ADMIN' && (
                      <>
                        <button 
                          onClick={() => openConfirmModal(user, user.isActive ? 'lock' : 'unlock')}
                          className={`mr-4 font-semibold transition-colors ${
                            user.isActive ? 'text-amber-500 hover:text-amber-600' : 'text-emerald-600 hover:text-emerald-700'
                          }`}
                        >
                          {user.isActive ? 'Lock' : 'Unlock'}
                        </button>
                        <button 
                          onClick={() => openConfirmModal(user, 'delete')}
                          className="text-rose-400 hover:text-rose-500 transition-colors font-semibold"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {user.role === 'ADMIN' && (
                      <span className="text-xs text-slate-300 italic">System Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgb(0,0,0,0.1)] w-full max-w-md p-8 border border-rose-50">
            <h2 className="text-xl font-serif text-slate-800 mb-4">
              {confirmModal.type === 'delete' ? 'Confirm Deletion' : 'Change Account Status'}
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              Are you sure you want to {confirmModal.type} user <span className="font-semibold text-slate-800">{confirmModal.username}</span>? 
              {confirmModal.type === 'delete' && ' This action cannot be undone.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeConfirmModal}
                className="px-6 py-2.5 text-sm font-medium text-slate-600 bg-gray-50 rounded-full hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                className={`px-6 py-2.5 text-sm font-medium text-white rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 ${
                  confirmModal.type === 'delete' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                Confirm {confirmModal.type.charAt(0).toUpperCase() + confirmModal.type.slice(1)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
