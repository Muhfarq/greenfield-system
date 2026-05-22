// src/pages/Users.jsx
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const emptyForm = { name: '', email: '', password: '', role: 'operator' };

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async () => {
    try {
      await api.post('/auth/users', form);
      setShowForm(false);
      setForm(emptyForm);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal buat akun');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus user ini?')) return;
    await api.delete(`/auth/users/${id}`);
    fetchUsers();
  };

  // Helper untuk format tanggal
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options).replace(',', '');
  };

  if (loading) return (
    <div className="flex min-h-screen bg-[#f4f7f6]">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center text-gray-500">Loading...</div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f4f7f6]">
      <Sidebar />
      
      <div className="flex-1 p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[24px] font-bold text-[#032b1d] mb-1">Kelola User</h1>
            <p className="text-[#6b7280] text-[14px]">Manajemen akun dan hak akses pengguna</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#087448] hover:bg-[#065f3a] text-white px-5 py-2.5 rounded-xl text-[14px] font-bold flex items-center gap-2 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Tambah User
          </button>
        </div>

        {/* Tabel Data User */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f9fafb] border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-1/3">User</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Bergabung</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#087448] flex items-center justify-center text-white font-bold text-[16px]">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-[#032b1d] flex items-center gap-2">
                          {u.name}
                          {currentUser?.id === u.id && (
                            <span className="text-[#087448] text-[12px] font-normal tracking-tight">— kamu</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-gray-500 font-mono text-sm">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[12px] px-3 py-1 rounded-full font-bold tracking-wide ${
                      u.role === 'admin'
                        ? 'bg-[#087448] text-white'
                        : 'bg-[#d1fae5] text-[#065f46]'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-gray-500 font-mono text-sm">
                    {formatDate(u.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {currentUser?.id !== u.id && (
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="text-gray-400 hover:text-red-500 transition p-2"
                        title="Hapus User"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Form Tambah User */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-[540px] shadow-2xl flex flex-col overflow-hidden">
              
              <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100">
                <h2 className="text-[16px] font-bold text-[#032b1d]">Tambah User Baru</h2>
                <button 
                  onClick={() => { setShowForm(false); setForm(emptyForm); }}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">Nama Lengkap</label>
                  <input
                    placeholder="Nama lengkap pengguna"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-[#032b1d] focus:outline-none focus:border-[#087448] focus:ring-1 focus:ring-[#087448] transition"
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">Email</label>
                  <input
                    placeholder="user@greenfeld.co.id"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-[#032b1d] focus:outline-none focus:border-[#087448] focus:ring-1 focus:ring-[#087448] transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">Password Awal</label>
                  <input
                    placeholder="Password untuk login pertama"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-[#032b1d] focus:outline-none focus:border-[#087448] focus:ring-1 focus:ring-[#087448] transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-[#032b1d] focus:outline-none focus:border-[#087448] focus:ring-1 focus:ring-[#087448] transition appearance-none bg-white"
                  >
                    <option value="operator">Operator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="px-6 py-5 flex justify-end gap-3 border-t border-gray-50">
                <button 
                  onClick={() => { setShowForm(false); setForm(emptyForm); }} 
                  className="px-6 py-2.5 text-[14px] font-bold text-[#032b1d] hover:bg-gray-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSubmit} 
                  className="px-6 py-2.5 bg-[#087448] hover:bg-[#065f3a] text-white text-[14px] font-bold rounded-lg transition"
                >
                  Buat Akun
                </button>
              </div>
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
