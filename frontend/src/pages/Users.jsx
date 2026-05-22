// src/pages/Users.jsx
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Users.css';

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
    <div className="users-loading">
      <Sidebar />
      <div className="users-loading-inner">Loading...</div>
    </div>
  );

  return (
    <div className="users-page">
      <Sidebar />
      
      <div className="users-content">
        
        {/* Header */}
        <div className="users-header">
          <div>
            <h1 className="text-[24px] font-bold text-[#032b1d] mb-1">Kelola User</h1>
            <p className="text-[#6b7280] text-[14px]">Manajemen akun dan hak akses pengguna</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="users-add-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Tambah User
          </button>
        </div>

        {/* Tabel Data User */}
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Bergabung</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="users-user-cell">
                      <div className="users-avatar">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="users-name">
                        <span className="text-[14px] font-bold text-[#032b1d] flex items-center gap-2">
                          {u.name}
                          {currentUser?.id === u.id && (
                            <span className="users-you-tag">— kamu</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="users-email">{u.email}</td>
                  <td>
                    <span className={`users-role-badge ${u.role}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="users-joined-date">
                    {formatDate(u.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {currentUser?.id !== u.id && (
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="users-delete-btn"
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
          <div className="users-modal-overlay">
            <div className="users-modal">
              
              <div className="users-modal-header">
                <h2 className="text-[16px] font-bold text-[#032b1d]">Tambah User Baru</h2>
                <button 
                  onClick={() => { setShowForm(false); setForm(emptyForm); }}
                  className="users-modal-close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="users-modal-body">
                <div>
                  <label className="users-field-label">Nama Lengkap</label>
                  <input
                    placeholder="Nama lengkap pengguna"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="users-field-input"
                  />
                </div>
                
                <div>
                  <label className="users-field-label">Email</label>
                  <input
                    placeholder="user@greenfeld.co.id"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="users-field-input"
                  />
                </div>

                <div>
                  <label className="users-field-label">Password Awal</label>
                  <input
                    placeholder="Password untuk login pertama"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="users-field-input"
                  />
                </div>

                <div>
                  <label className="users-field-label">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="users-field-select"
                  >
                    <option value="operator">Operator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="users-modal-footer">
                <button 
                  onClick={() => { setShowForm(false); setForm(emptyForm); }} 
                  className="users-btn-batal"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSubmit} 
                  className="users-btn-submit"
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
