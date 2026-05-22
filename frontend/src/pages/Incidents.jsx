// src/pages/Incidents.jsx
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const urgencyStyles = {
  critical: 'bg-[#fee2e2] text-[#dc2626]',
  high: 'bg-[#fef3c7] text-[#d97706]',
  normal: 'bg-[#d2f9e0] text-[#087448]',
};

const statusStyles = {
  open: 'bg-[#fee2e2] text-[#dc2626]',
  in_progress: 'bg-[#fef3c7] text-[#d97706]',
  resolved: 'bg-[#d2f9e0] text-[#087448]',
};

const emptyForm = {
  title: '', description: '', asset_id: '',
  urgency_level: 'normal', status: 'open', action_taken: ''
};

export default function Incidents() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');

  const fetchData = async () => {
    try {
      const [i, a] = await Promise.all([
        api.get('/incidents'),
        api.get('/assets'),
      ]);
      setIncidents(i.data);
      setAssets(a.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    try {
      const payload = { ...form, asset_id: form.asset_id || null };
      if (editId) {
        await api.put(`/incidents/${editId}`, payload);
      } else {
        await api.post('/incidents', payload);
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (item) => {
    setForm({
      title: item.title, description: item.description,
      asset_id: item.asset_id || '',
      urgency_level: item.urgency_level,
      status: item.status, action_taken: item.action_taken || ''
    });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus insiden ini?')) return;
    await api.delete(`/incidents/${id}`);
    fetchData();
  };

  const filtered = incidents.filter(i => {
    const matchStatus = filterStatus === 'all' || i.status === filterStatus;
    const matchUrgency = filterUrgency === 'all' || i.urgency_level === filterUrgency;
    const matchOwner = user?.role === 'admin' || i.user_id === user?.id;
    return matchStatus && matchUrgency && matchOwner;
  });

  return (
    <div className="flex min-h-screen bg-[#f4f7f6]">
      <Sidebar />
      
      <div className="ml-[220px] flex-1 p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-[24px] font-bold text-[#032b1d] mb-1">Log Insiden</h1>
          <p className="text-[#6b7280] text-[14px]">Pencatatan dan penanganan insiden operasional</p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex gap-4 flex-1 max-w-xl">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-3 px-4 border border-gray-200 bg-white rounded-xl text-[14px] text-gray-800 outline-none focus:border-[#087448] transition appearance-none"
            >
              <option value="all">Semua Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="w-full py-3 px-4 border border-gray-200 bg-white rounded-xl text-[14px] text-gray-800 outline-none focus:border-[#087448] transition appearance-none"
            >
              <option value="all">Semua Urgency</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
            </select>
          </div>
          
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
            className="bg-[#087448] hover:bg-[#065f3a] text-white px-5 py-3 rounded-xl text-[14px] font-bold flex items-center gap-2 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Tambah Insiden
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <p className="text-gray-500 p-8 text-center">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-500 p-8 text-center">Belum ada insiden</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f9fafb] border-b border-gray-100">
                <tr>
                  <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Judul / Deskripsi</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Aset</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Urgency</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Durasi</th>
                  <th className="py-4 px-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition group">
                    <td className="py-4 px-6">
                      <div className="text-[14px] font-bold text-[#032b1d]">{item.title}</div>
                      <div className="text-[13px] text-gray-500 mt-0.5">{item.description?.slice(0, 60)}...</div>
                    </td>
                    <td className="py-4 px-6 text-[13px] text-gray-500">
                      {item.asset_name || '—'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${urgencyStyles[item.urgency_level] || urgencyStyles.normal}`}>
                          {item.urgency_level}
                        </span>
                        {item.is_auto_urgency && (
                          <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md text-[10px] font-bold">Auto</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${statusStyles[item.status] || statusStyles.open}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[13px] text-gray-500">
                       {/* Ganti item.duration dengan properti yang tepat dari DB Anda jika ada, atau biarkan statis sementara */}
                      {item.duration || item.user_name || '—'} 
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
                  {editId ? 'Edit Insiden' : 'Tambah Insiden'}
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
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">Judul Insiden</label>
                  <input
                    placeholder="Deskripsi singkat insiden"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-[#032b1d] focus:outline-none focus:border-[#087448] focus:ring-1 focus:ring-[#087448] transition"
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">Deskripsi Kejadian</label>
                  <textarea
                    placeholder="Detail lengkap kejadian..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-[#032b1d] focus:outline-none focus:border-[#087448] focus:ring-1 focus:ring-[#087448] h-24 resize-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">Aset Terkait (Opsional)</label>
                  <select
                    value={form.asset_id}
                    onChange={(e) => setForm({ ...form, asset_id: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-[#032b1d] focus:outline-none focus:border-[#087448] focus:ring-1 focus:ring-[#087448] transition appearance-none bg-white"
                  >
                    <option value="">Pilih Aset...</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.asset_code})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">Urgency Level</label>
                    <select
                      value={form.urgency_level}
                      onChange={(e) => setForm({ ...form, urgency_level: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-[#032b1d] focus:outline-none focus:border-[#087448] focus:ring-1 focus:ring-[#087448] transition appearance-none bg-white"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-[#032b1d] focus:outline-none focus:border-[#087448] focus:ring-1 focus:ring-[#087448] transition appearance-none bg-white"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">Tindakan Yang Diambil</label>
                  <textarea
                    placeholder="Jelaskan tindakan yang sudah dilakukan..."
                    value={form.action_taken}
                    onChange={(e) => setForm({ ...form, action_taken: e.target.value })}
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
