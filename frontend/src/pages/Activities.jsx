import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

import EditIcon from '../assets/edit.svg'
import DeleteIcon from '../assets/delete.svg'
import PlusIcon from '../assets/plus.svg'
import './Activities.css';

const urgencyStyle = {
  critical: { background: '#fee2e2', color: '#dc2626', fontWeight: '700' },
  high: { background: '#fef3c7', color: '#92400e', fontWeight: '700' },
  normal: { background: '#f3f4f6', color: '#6b7280', fontWeight: '600' },
};

const statusStyle = {
  ongoing: { background: '#d2f9e0', color: '#087448' },
  selesai: { background: '#f3f4f6', color: '#6b7280' },
};

const tipeStyle = {
  darurat: { background: '#fee2e2', color: '#dc2626' },
  maintenance: { background: '#dbeafe', color: '#1d4ed8' },
  inspeksi: { background: '#ede9fe', color: '#7c3aed' },
  produksi: { background: '#d2f9e0', color: '#087448' },
};

const emptyForm = {
  title: '', description: '', type: 'maintenance',
  location: '', urgency_level: 'normal', status: 'ongoing', event_time: ''
};

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return `${d.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'][d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2,'0')}.${String(d.getMinutes()).padStart(2,'0')}`;
}

export default function Activities() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [toast, setToast] = useState('');
  const [confirm, setConfirm] = useState({ show: false, message: '', onConfirm: null });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const showConfirm = (message, onConfirm) => {
    setConfirm({ show: true, message, onConfirm });
  };

  const fetchActivities = async () => {
    try {
      const res = await api.get('/activities');
      setActivities(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchActivities(); }, []);

  const handleSubmit = async () => {
    try {
      if (editId) {
        await api.put(`/activities/${editId}`, form);
        showToast('Aktivitas berhasil diupdate');
      } else {
        await api.post('/activities', form);
        showToast('Aktivitas berhasil ditambahkan');
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      fetchActivities();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitClick = () => {
    if (editId) {
      showConfirm('Simpan perubahan aktivitas ini?', handleSubmit);
    } else {
      handleSubmit();
    }
  };

  const handleEdit = (item) => {
    setForm({
      title: item.title, description: item.description || '',
      type: item.type, location: item.location || '',
      urgency_level: item.urgency_level, status: item.status,
      event_time: item.event_time?.slice(0, 16) || ''
    });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await api.delete(`/activities/${id}`);
    fetchActivities();
  };

  const filtered = activities.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.location || '').toLowerCase().includes(search.toLowerCase());
    const matchUrgency = filterUrgency === 'all' || a.urgency_level === filterUrgency;
    const matchOwner = user.role === 'admin' || a.user_id === user.id;
    return matchSearch && matchUrgency && matchOwner;
  });

  const Label = ({ text, style }) => (
    <span className="act-label" style={style}>{text}</span>
  );

  return (
    <div className="act-page">
      <Sidebar />
      <div className="act-content">
        <div className="act-header">
          <h1 className="act-title">Manajemen Aktivitas</h1>
          <p className="act-subtitle">Pencatatan dan pemantauan aktivitas lapangan</p>
        </div>

        <div className="act-toolbar">
          <div className="act-search-wrap">
            <svg className="act-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#032b1d" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              type="text"
              placeholder="Cari judul atau lokasi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="act-search-input"
            />
          </div>

          <select value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)} className="act-filter">
            <option value="all">Semua Urgency</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
          </select>

          <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }} className="act-add-btn">
            <img src={PlusIcon} alt="" />
            Tambah Aktivitas
          </button>
        </div>

        <div className="act-table">
          <div className="act-th">
            <span>JUDUL / DESKRIPSI</span>
            <span>TIPE</span>
            <span>LOKASI</span>
            <span>URGENCY</span>
            <span>STATUS</span>
            <span>OPERATOR</span>
            <span>WAKTU</span>
            <span></span>
          </div>

          {loading ? (
            <div className="act-empty">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="act-empty">Belum ada aktivitas</div>
          ) : filtered.map((item, idx) => (
            <div key={item.id} className="act-row">
              <div>
                <div className="act-cell-title">{item.title}</div>
                {item.description && (
                  <div className="act-cell-desc">{item.description}</div>
                )}
              </div>
              <div>
                <Label text={item.type} style={tipeStyle[item.type] || { background: '#f3f4f6', color: '#6b7280' }} />
              </div>
              <div className="act-cell-location">{item.location || '-'}</div>
              <div className="act-cell-urgency">
                <Label text={item.urgency_level.toUpperCase()} style={urgencyStyle[item.urgency_level]} />
                {item.is_auto_urgency && <Label text="Auto" style={{ background: '#f3f4f6', color: '#9ca3af', fontWeight: '500' }} />}
              </div>
              <div>
                <Label text={item.status} style={statusStyle[item.status] || { background: '#f3f4f6', color: '#6b7280' }} />
              </div>
              <div className="act-cell-operator">{item.user_name || '-'}</div>
              <div className="act-cell-time">{formatDate(item.created_at)}</div>
              <div className="act-cell-actions">
                {(user.role === 'admin' || item.user_id === user.id) && (<>
                  <button onClick={() => handleEdit(item)} className="act-icon-btn">
                    <img src={EditIcon} alt="edit" className="act-icon-edit" />
                  </button>
                  <button onClick={() => showConfirm('Hapus aktivitas ini?', () => handleDelete(item.id))} className="act-icon-btn act-icon-btn-del">
                    <img src={DeleteIcon} alt="hapus" className="act-icon-del" />
                  </button>
                </>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="act-modal-overlay">
          <div className="act-modal">
            <div className="act-modal-header">
              <h2 className="act-modal-title">{editId ? 'Edit Aktivitas' : 'Tambah Aktivitas'}</h2>
              <button onClick={() => setShowForm(false)} className="act-modal-close">✕</button>
            </div>
            <div className="act-modal-body">
              <div>
                <label className="act-field-label">JUDUL AKTIVITAS</label>
                <input placeholder="Deskripsi singkat aktivitas" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="act-field-input" />
              </div>
              <div>
                <label className="act-field-label">DESKRIPSI</label>
                <textarea placeholder="Detail lengkap aktivitas..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} className="act-field-textarea" />
              </div>
              <div className="act-field-row">
                <div>
                  <label className="act-field-label">TIPE</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="act-field-select">
                    <option value="maintenance">Maintenance</option>
                    <option value="inspeksi">Inspeksi</option>
                    <option value="produksi">Produksi</option>
                    <option value="darurat">Darurat</option>
                  </select>
                </div>
                <div>
                  <label className="act-field-label">STATUS</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="act-field-select">
                    <option value="ongoing">Ongoing</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="act-field-label">LOKASI</label>
                <input placeholder="Area atau lokasi kejadian" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="act-field-input" />
              </div>
              <div>
                <label className="act-field-label">URGENCY LEVEL</label>
                <select value={form.urgency_level} onChange={e => setForm({ ...form, urgency_level: e.target.value })} className="act-field-select">
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="act-field-label">WAKTU KEJADIAN</label>
                <input type="datetime-local" value={form.event_time} onChange={e => setForm({ ...form, event_time: e.target.value })} className="act-field-input" />
              </div>
            </div>
            <div className="act-modal-footer">
              <button onClick={() => setShowForm(false)} className="act-btn-cancel">Batal</button>
              <button onClick={handleSubmitClick} className="act-btn-save">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {confirm.show && (
        <div className="act-modal-overlay">
          <div className="act-modal" style={{ maxWidth: 420 }}>
            <div className="act-modal-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
              <p style={{ fontSize: 15, color: '#032b1d', fontWeight: 600, margin: 0 }}>{confirm.message}</p>
            </div>
            <div className="act-modal-footer" style={{ justifyContent: 'center', gap: 12 }}>
              <button onClick={() => setConfirm({ show: false, message: '', onConfirm: null })} className="act-btn-cancel">Batal</button>
              <button onClick={() => { confirm.onConfirm?.(); setConfirm({ show: false, message: '', onConfirm: null }); }} className="act-btn-save">Ya</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast toast-success">{toast}</div>}
    </div>
  );
}
