// src/pages/Assets.jsx
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const conditionStyles = {
  baik: 'bg-[#d2f9e0] text-[#087448]',
  perlu_perhatian: 'bg-[#fef3c7] text-[#d97706]',
  rusak: 'bg-[#fee2e2] text-[#dc2626]',
};

const emptyForm = {
  name: '', asset_code: '', category: 'Mesin',
  location: '', condition: 'baik', notes: ''
};

export default function Assets() {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');

  const fetchAssets = async () => {
    try {
      const res = await api.get('/assets');
      setAssets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssets(); }, []);

  const handleSubmit = async () => {
    try {
      if (editId) {
        await api.put(`/assets/${editId}`, form);
      } else {
        await api.post('/assets', form);
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      fetchAssets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name, asset_code: item.asset_code,
      category: item.category, location: item.location,
      condition: item.condition, notes: item.notes || ''
    });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus aset ini?')) return;
    await api.delete(`/assets/${id}`);
    fetchAssets();
  };

  const filtered = assets.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.asset_code.toLowerCase().includes(search.toLowerCase());
    const matchOwner = user?.role === 'admin' || a.user_id === user?.id;
    return matchSearch && matchOwner;
  });

  return (
    <div className="flex min-h-screen bg-[#f4f7f6]">
      <Sidebar />
      
      <div className="ml-[220px] flex-1 p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-[24px] font-bold text-[#032b1d] mb-1">Manajemen Aset</h1>
          <p className="text-[#6b7280] text-[14px]">Inventaris dan kondisi aset perusahaan</p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="relative flex-1 max-w-4xl border border-gray-200 bg-white rounded-xl overflow-hidden flex items-center">
            <div className="pl-4 pr-2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari nama atau kode aset..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-3 pr-4 text-[14px] text-gray-800 outline-none bg-transparent placeholder-gray-400"
            />
          </div>
          
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
            className="bg-[#087448] hover:bg-[#065f3a] text-white px-5 py-3 rounded-xl text-[14px] font-bold flex items-center gap-2 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Tambah Aset
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <p className="text-gray-500 p-8 text-center">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-500 p-8 text-center">Belum ada aset</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f9fafb] border-b border-gray-100">
                <tr>
                  <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Nama / Kode</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Kategori</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Lokasi</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Kondisi</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Insiden Open</th>
                  <th className="py-4 px-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition group">
                    <td className="py-4 px-6">
                      <div className="text-[14px] font-bold text-[#032b1d]">{item.name}</div>
                      <div className="text-[11px] font-bold text-gray-400 font-mono mt-0.5">{item.asset_code}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-[#d2f9e0] text-[#087448] px-3 py-1 rounded-full text-[11px] font-bold capitalize">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[13px] text-gray-500">
                      {item.location || '-'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize ${conditionStyles[item.condition] || conditionStyles.baik}`}>
                        {item.condition.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {item.open_incidents > 0 ? (
                        <span className="text-[#dc2626] text-[12px] font-bold">{item.open_incidents} open</span>
                      ) : (
                        <span className="text-gray-400 font-bold">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-60 hover:opacity-100 transition">
                        {(user?.role === 'admin' || item.user_id === user?.id) && (
                          <>
                            <button onClick={() => handleEdit(item)} className="text-gray-400 hover:text-[#087448] transition p-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-[#dc2626] transition p-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Form Tambah / Edit */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-[640px] shadow-2xl flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100">
                <h2 className="text-[16px] font-bold text-[#032b1d]">
                  {editId ? 'Edit Aset' : 'Tambah Aset'}
                </h2>
                <button 
                  onClick={() => { setShowForm(false); setEditId(null); }}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">Nama Aset</label>
                    <input
                      placeholder="Nama lengkap aset"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-[#032b1d] focus:outline-none focus:border-[#087448] focus:ring-1 focus:ring-[#087448] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">Kode Aset</label>
                    <input
                      placeholder="EXC-001"
                      value={form.asset_code}
                      onChange={(e) => setForm({ ...form, asset_code: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-[#032b1d] focus:outline-none focus:border-[#087448] focus:ring-1 focus:ring-[#087448] transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">Kategori</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-[#032b1d] focus:outline-none focus:border-[#087448] focus:ring-1 focus:ring-[#087448] transition appearance-none bg-white"
                    >
                      <option value="Mesin">Mesin</option>
                      <option value="Kendaraan">Kendaraan</option>
                      <option value="Peralatan">Peralatan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">Kondisi</label>
                    <select
                      value={form.condition}
                      onChange={(e) => setForm({ ...form, condition: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-[#032b1d] focus:outline-none focus:border-[#087448] focus:ring-1 focus:ring-[#087448] transition appearance-none bg-white"
                    >
                      <option value="baik">Baik</option>
                      <option value="perlu_perhatian">Perlu Perhatian</option>
                      <option value="rusak">Rusak</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">Lokasi</label>
                  <input
                    placeholder="Area atau gedung"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-[#032b1d] focus:outline-none focus:border-[#087448] focus:ring-1 focus:ring-[#087448] transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">Catatan</label>
                  <textarea
                    placeholder="Informasi tambahan..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-[#032b1d] focus:outline-none focus:border-[#087448] focus:ring-1 focus:ring-[#087448] h-24 resize-none transition"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-5 flex justify-end gap-3">
                <button 
                  onClick={() => { setShowForm(false); setEditId(null); }} 
                  className="px-6 py-2.5 text-[14px] font-bold text-[#032b1d] hover:bg-gray-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSubmit} 
                  className="px-6 py-2.5 bg-[#087448] hover:bg-[#065f3a] text-white text-[14px] font-bold rounded-lg transition"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}