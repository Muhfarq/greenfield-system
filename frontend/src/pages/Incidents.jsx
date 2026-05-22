import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Incidents.css';

const urgencyStyles = {
  critical: 'badge-red',
  high: 'badge-amber',
  normal: 'badge-green',
};

const statusStyles = {
  open: 'badge-red',
  in_progress: 'badge-amber',
  resolved: 'badge-green',
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
    <div className="page-wrap">
      <Sidebar />
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Log Insiden</h1>
          <p className="page-subtitle">Pencatatan dan penanganan insiden operasional</p>
        </div>

        <div className="toolbar">
          <div className="toolbar-left">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
              <option value="all">Semua Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select value={filterUrgency} onChange={(e) => setFilterUrgency(e.target.value)} className="filter-select">
              <option value="all">Semua Urgency</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
            </select>
          </div>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }} className="btn-primary-sm">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Tambah Insiden
          </button>
        </div>

        <div className="table-wrap">
          {loading ? (
            <p className="act-empty">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="act-empty">Belum ada insiden</p>
          ) : (
            <table className="inc-table">
              <thead className="table-header">
                <tr>
                  <th>Judul / Deskripsi</th>
                  <th>Aset</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Durasi</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td className="inc-td">
                      <div className="inc-cell-title">{item.title}</div>
                      <div className="inc-cell-desc">{item.description?.slice(0, 60)}...</div>
                    </td>
                    <td className="inc-cell-asset">
                      {item.asset_name || '—'}
                    </td>
                    <td className="inc-cell-urgency">
                      <div className="inc-cell-urgency-inner">
                        <span className={`${urgencyStyles[item.urgency_level] || 'badge-green'} badge-uppercase`}>
                          {item.urgency_level}
                        </span>
                        {item.is_auto_urgency && (
                          <span className="badge-gray small">Auto</span>
                        )}
                      </div>
                    </td>
                    <td className="inc-cell-status">
                      <span className={`${statusStyles[item.status] || 'badge-green'} badge-capitalize`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="inc-cell-duration">
                      {item.duration || item.user_name || '—'}
                    </td>
                    <td className="inc-cell-actions">
                      <div className="inc-actions-inner">
                        {(user?.role === 'admin' || item.user_id === user?.id) && (
                          <>
                            <button onClick={() => handleEdit(item)} className="inc-action-btn">
                              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="inc-action-btn">
                              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

        {showForm && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h2 className="modal-title">{editId ? 'Edit Insiden' : 'Tambah Insiden'}</h2>
                <button onClick={() => { setShowForm(false); setEditId(null); }} className="modal-close">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="modal-body form-body">
                <div>
                  <label className="form-label">Judul Insiden</label>
                  <input placeholder="Deskripsi singkat insiden" value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Deskripsi Kejadian</label>
                  <textarea placeholder="Detail lengkap kejadian..." value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })} className="form-textarea textarea-sm" />
                </div>
                <div>
                  <label className="form-label">Aset Terkait (Opsional)</label>
                  <select value={form.asset_id} onChange={(e) => setForm({ ...form, asset_id: e.target.value })} className="form-select">
                    <option value="">Pilih Aset...</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.asset_code})</option>
                    ))}
                  </select>
                </div>
                <div className="form-grid">
                  <div>
                    <label className="form-label">Urgency Level</label>
                    <select value={form.urgency_level} onChange={(e) => setForm({ ...form, urgency_level: e.target.value })} className="form-select">
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="form-select">
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">Tindakan Yang Diambil</label>
                  <textarea placeholder="Jelaskan tindakan yang sudah dilakukan..." value={form.action_taken}
                    onChange={(e) => setForm({ ...form, action_taken: e.target.value })} className="form-textarea textarea-sm" />
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => { setShowForm(false); setEditId(null); }} className="btn-secondary">Batal</button>
                <button onClick={handleSubmit} className="btn-primary-modal">Simpan</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
