// src/pages/Activities.jsx
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Activities.css';

import EditIcon from '../assets/edit.svg'
import DeleteIcon from '../assets/delete.svg'
import PlusIcon from '../assets/plus.svg'

const urgencyStyle = {
  critical: { background: '#fee2e2', color: '#dc2626', fontWeight: '700' },
  high: { background: '#fef3c7', color: '#92400e', fontWeight: '700' },
  normal: { background: '#e5e7eb', color: '#374151', fontWeight: '600' },
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
      } else {
        await api.post('/activities', form);
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      fetchActivities();
    } catch (err) {
      console.error(err);
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
    if (!confirm('Hapus aktivitas ini?')) return;
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

  const Label = ({ text, className = '', style }) => (
    <span className={`activities-label ${className}`.trim()} style={style}>{text}</span>
  );

  return (
    <div className="activities-page">
      <Sidebar />

      <div className="activities-content">

        {/* Header */}
        <div className="activities-header">
          <h1>Manajemen Aktivitas</h1>
          <p>Pencatatan dan pemantauan aktivitas lapangan</p>
        </div>

        {/* Toolbar */}
        <div className="activities-toolbar">
          {/* Search */}
          <div className="activities-search-wrap">
            <svg className="activities-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#032b1d" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              type="text"
              placeholder="Cari judul atau lokasi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="activities-search-input"
            />
          </div>

          {/* Filter urgency */}
          <select
            value={filterUrgency}
            onChange={e => setFilterUrgency(e.target.value)}
            className="activities-filter-select"
          >
            <option value="all">Semua Urgency</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
          </select>

          {/* Tambah button */}
          <button
            onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
            className="activities-add-btn"
          >
            <img src={PlusIcon} alt="" />
            Tambah Aktivitas
          </button>
        </div>

        {/* Table */}
        <div className="activities-table">
          {/* Table Header */}
          <div className="activities-table-header">
            <span>JUDUL / DESKRIPSI</span>
            <span>TIPE</span>
            <span>LOKASI</span>
            <span>URGENCY</span>
            <span>STATUS</span>
            <span>WAKTU</span>
            <span></span>
          </div>

          {/* Rows */}
          {loading ? (
            <div className="activities-table-empty">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="activities-table-empty">Belum ada aktivitas</div>
          ) : filtered.map(item => (
            <div key={item.id} className="activities-table-row">
              {/* Judul */}
              <div>
                <div className="activities-item-title">{item.title}</div>
                {item.description && (
                  <div className="activities-item-desc">
                    {item.description}
                  </div>
                )}
              </div>

              {/* Tipe */}
              <div>
                <Label text={item.type} style={tipeStyle[item.type] || { background: '#f3f4f6', color: '#6b7280' }} />
              </div>

              {/* Lokasi */}
              <div className="activities-item-location">{item.location || '-'}</div>

              {/* Urgency */}
              <div className="activities-urgency-col">
                <Label text={item.urgency_level.toUpperCase()} style={urgencyStyle[item.urgency_level]} />
                {item.is_auto_urgency && <Label text="Auto" className="activities-label-auto" />}
              </div>

              {/* Status */}
              <div>
                <Label text={item.status} style={statusStyle[item.status] || { background: '#f3f4f6', color: '#6b7280' }} />
              </div>

              {/* Waktu */}
              <div className="activities-item-time">
                {formatDate(item.created_at)}
              </div>

              {/* Aksi */}
              <div className="activities-item-actions">
                {(user.role === 'admin' || item.user_id === user.id) && (<>
                  <button onClick={() => handleEdit(item)}
                    className="activities-action-btn activities-action-edit"
                  >
                    <img src={EditIcon} alt="edit" />
                  </button>
                  <button onClick={() => handleDelete(item.id)}
                    className="activities-action-btn activities-action-delete"
                  >
                    <img src={DeleteIcon} alt="hapus" />
                  </button>
                </>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="activities-modal-overlay">
          <div className="activities-modal">
            {/* Modal Header */}
            <div className="activities-modal-header">
              <h2>{editId ? 'Edit Aktivitas' : 'Tambah Aktivitas'}</h2>
              <button onClick={() => setShowForm(false)} className="activities-modal-close">✕</button>
            </div>

            <div className="activities-modal-body">

              {/* Judul */}
              <div>
                <label className="activities-field-label">JUDUL AKTIVITAS</label>
                <input
                  placeholder="Deskripsi singkat aktivitas"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="activities-field-input"
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="activities-field-label">DESKRIPSI</label>
                <textarea
                  placeholder="Detail lengkap aktivitas..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="activities-field-textarea"
                />
              </div>

              {/* Tipe & Status */}
              <div className="activities-modal-grid">
                <div>
                  <label className="activities-field-label">TIPE</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="activities-field-select">
                    <option value="maintenance">Maintenance</option>
                    <option value="inspeksi">Inspeksi</option>
                    <option value="produksi">Produksi</option>
                    <option value="darurat">Darurat</option>
                  </select>
                </div>
                <div>
                  <label className="activities-field-label">STATUS</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="activities-field-select">
                    <option value="ongoing">Ongoing</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>
              </div>

              {/* Lokasi */}
              <div>
                <label className="activities-field-label">LOKASI</label>
                <input
                  placeholder="Area atau lokasi kejadian"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  className="activities-field-input"
                />
              </div>

              {/* Urgency */}
              <div>
                <label className="activities-field-label">URGENCY LEVEL</label>
                <select value={form.urgency_level} onChange={e => setForm({ ...form, urgency_level: e.target.value })} className="activities-field-select">
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Waktu */}
              <div>
                <label className="activities-field-label">WAKTU KEJADIAN</label>
                <input
                  type="datetime-local"
                  value={form.event_time}
                  onChange={e => setForm({ ...form, event_time: e.target.value })}
                  className="activities-field-input"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="activities-modal-footer">
              <button onClick={() => setShowForm(false)} className="activities-btn-batal">
                Batal
              </button>
              <button onClick={handleSubmit} className="activities-btn-simpan">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
