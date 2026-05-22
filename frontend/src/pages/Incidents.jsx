// src/pages/Incidents.jsx
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Incidents.css';

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
    <div className="incidents-page">
      <Sidebar />
      
      <div className="incidents-content">
        {/* Header Section */}
        <div className="incidents-header">
          <h1 className="text-[24px] font-bold text-[#032b1d] mb-1">Log Insiden</h1>
          <p className="text-[#6b7280] text-[14px]">Pencatatan dan penanganan insiden operasional</p>
        </div>

        {/* Toolbar */}
        <div className="incidents-toolbar">
          <div className="incidents-filters">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="incidents-filter-select"
            >
              <option value="all">Semua Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="incidents-filter-select"
            >
              <option value="all">Semua Urgency</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
            </select>
          </div>
          
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
            className="incidents-add-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Tambah Insiden
          </button>
        </div>

        {/* Table Container */}
        <div className="incidents-table-container">
          {loading ? (
            <p className="text-gray-500 p-8 text-center">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="incidents-empty">Belum ada insiden</p>
          ) : (
            <table className="incidents-table">
              <thead>
                <tr>
                  <th>Judul / Deskripsi</th>
                  <th>Aset</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Durasi</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="incidents-item-title">{item.title}</div>
                      <div className="incidents-item-desc">{item.description?.slice(0, 60)}...</div>
                    </td>
                    <td className="text-[13px] text-gray-500">
                      {item.asset_name || '—'}
                    </td>
                    <td>
                      <div className="incidents-urgency-wrap">
                        <span className={`incidents-urgency-badge ${item.urgency_level}`}>
                          {item.urgency_level}
                        </span>
                        {item.is_auto_urgency && (
                          <span className="incidents-auto-badge">Auto</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`incidents-status-badge ${item.status}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="text-[13px] text-gray-500">
                      {item.duration || item.user_name || '—'} 
                    </td>
                    <td className="incidents-action-cell">
                      <div className="incidents-actions">
                        {(user?.role === 'admin' || item.user_id === user?.id) && (
                          <>
                            <button onClick={() => handleEdit(item)} className="incidents-action-btn">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="incidents-action-btn delete">
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
          <div className="incidents-modal-overlay">
            <div className="incidents-modal">
              {/* Modal Header */}
              <div className="incidents-modal-header">
                <h2 className="text-[16px] font-bold text-[#032b1d]">
                  {editId ? 'Edit Insiden' : 'Tambah Insiden'}
                </h2>
                <button 
                  onClick={() => { setShowForm(false); setEditId(null); }}
                  className="incidents-modal-close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="incidents-modal-body">
                <div>
                  <label className="incidents-field-label">Judul Insiden</label>
                  <input
                    placeholder="Deskripsi singkat insiden"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="incidents-field-input"
                  />
                </div>
                
                <div>
                  <label className="incidents-field-label">Deskripsi Kejadian</label>
                  <textarea
                    placeholder="Detail lengkap kejadian..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="incidents-field-textarea"
                  />
                </div>

                <div>
                  <label className="incidents-field-label">Aset Terkait (Opsional)</label>
                  <select
                    value={form.asset_id}
                    onChange={(e) => setForm({ ...form, asset_id: e.target.value })}
                    className="incidents-field-select"
                  >
                    <option value="">Pilih Aset...</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.asset_code})</option>
                    ))}
                  </select>
                </div>

                <div className="incidents-modal-grid">
                  <div>
                    <label className="incidents-field-label">Urgency Level</label>
                    <select
                      value={form.urgency_level}
                      onChange={(e) => setForm({ ...form, urgency_level: e.target.value })}
                      className="incidents-field-select"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="incidents-field-label">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="incidents-field-select"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="incidents-field-label">Tindakan Yang Diambil</label>
                  <textarea
                    placeholder="Jelaskan tindakan yang sudah dilakukan..."
                    value={form.action_taken}
                    onChange={(e) => setForm({ ...form, action_taken: e.target.value })}
                    className="incidents-field-textarea"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="incidents-modal-footer">
                <button 
                  onClick={() => { setShowForm(false); setEditId(null); }} 
                  className="incidents-btn-batal"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSubmit} 
                  className="incidents-btn-simpan"
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
