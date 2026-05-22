// src/pages/Activities.jsx
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

import EditIcon from '../assets/edit.svg'
import DeleteIcon from '../assets/delete.svg'
import PlusIcon from '../assets/plus.svg'

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

  const Label = ({ text, style }) => (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: '6px',
      fontSize: '11px', fontWeight: '600', ...style
    }}>{text}</span>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0faf4' }}>
      <Sidebar />

      <div style={{ marginLeft: '220px', flex: 1, padding: '32px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#032b1d', margin: '0 0 4px' }}>Manajemen Aktivitas</h1>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Pencatatan dan pemantauan aktivitas lapangan</p>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, maxWidth: '520px' }}>
            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#032b1d" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              type="text"
              placeholder="Cari judul atau lokasi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px 10px 38px',
                borderRadius: '10px', border: '1.5px solid #e5e7eb',
                fontSize: '14px', color: '#032b1d', background: '#FFFFFF',
                outline: 'none', boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#087448'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Filter urgency */}
          <select
            value={filterUrgency}
            onChange={e => setFilterUrgency(e.target.value)}
            style={{
              padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb',
              fontSize: '13px', color: '#032b1d', background: '#FFFFFF', outline: 'none', cursor: 'pointer'
            }}
          >
            <option value="all">Semua Urgency</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
          </select>

          {/* Tambah button */}
          <button
            onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 18px', borderRadius: '10px', border: 'none',
              background: '#087448', color: '#FFFFFF', fontSize: '14px',
              fontWeight: '600', cursor: 'pointer', transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#16b36c'}
            onMouseLeave={e => e.currentTarget.style.background = '#087448'}
          >
            <img src={PlusIcon} alt="" style={{ width: '16px', height: '16px', filter: 'brightness(0) invert(1)' }} />
            Tambah Aktivitas
          </button>
        </div>

        {/* Table */}
        <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {/* Table Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2.5fr 0.8fr 1.2fr 1.2fr 0.8fr 1.4fr 80px',
            padding: '12px 20px', borderBottom: '1px solid #f3f4f6',
            fontSize: '11px', fontWeight: '700', color: '#9ca3af', letterSpacing: '0.05em'
          }}>
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
            <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>Belum ada aktivitas</div>
          ) : filtered.map((item, idx) => (
            <div key={item.id} style={{
              display: 'grid', gridTemplateColumns: '2.5fr 0.8fr 1.2fr 1.2fr 0.8fr 1.4fr 80px',
              padding: '14px 20px', alignItems: 'center',
              borderBottom: idx < filtered.length - 1 ? '1px solid #f9fafb' : 'none',
              background: idx % 2 === 0 ? '#FFFFFF' : '#fafafa',
              transition: 'background 0.1s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#f0faf4'}
              onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#FFFFFF' : '#fafafa'}
            >
              {/* Judul */}
              <div>
                <div style={{ fontWeight: '600', color: '#032b1d', fontSize: '14px', marginBottom: '2px' }}>{item.title}</div>
                {item.description && (
                  <div style={{ fontSize: '12px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }}>
                    {item.description}
                  </div>
                )}
              </div>

              {/* Tipe */}
              <div>
                <Label text={item.type} style={tipeStyle[item.type] || { background: '#f3f4f6', color: '#6b7280' }} />
              </div>

              {/* Lokasi */}
              <div style={{ fontSize: '13px', color: '#6b7280' }}>{item.location || '-'}</div>

              {/* Urgency */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Label text={item.urgency_level.toUpperCase()} style={urgencyStyle[item.urgency_level]} />
                {item.is_auto_urgency && <Label text="Auto" style={{ background: '#f3f4f6', color: '#9ca3af', fontWeight: '500' }} />}
              </div>

              {/* Status */}
              <div>
                <Label text={item.status} style={statusStyle[item.status] || { background: '#f3f4f6', color: '#6b7280' }} />
              </div>

              {/* Waktu */}
              <div style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace' }}>
                {formatDate(item.created_at)}
              </div>

              {/* Aksi */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                {(user.role === 'admin' || item.user_id === user.id) && (<>
                  <button onClick={() => handleEdit(item)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0faf4'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <img src={EditIcon} alt="edit" style={{ width: '16px', height: '16px', filter: 'invert(30%) sepia(50%) saturate(400%) hue-rotate(100deg)' }} />
                  </button>
                  <button onClick={() => handleDelete(item.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <img src={DeleteIcon} alt="hapus" style={{ width: '16px', height: '16px', filter: 'invert(27%) sepia(94%) saturate(1234%) hue-rotate(340deg)' }} />
                  </button>
                </>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(3,43,29,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '16px', padding: '28px 32px',
            width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#032b1d', margin: 0 }}>
                {editId ? 'Edit Aktivitas' : 'Tambah Aktivitas'}
              </h2>
              <button onClick={() => setShowForm(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#9ca3af', lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Judul */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.07em', marginBottom: '6px' }}>JUDUL AKTIVITAS</label>
                <input
                  placeholder="Deskripsi singkat aktivitas"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '14px', color: '#032b1d', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#087448'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.07em', marginBottom: '6px' }}>DESKRIPSI</label>
                <textarea
                  placeholder="Detail lengkap aktivitas..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '14px', color: '#032b1d', outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  onFocus={e => e.target.style.borderColor = '#087448'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              {/* Tipe & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.07em', marginBottom: '6px' }}>TIPE</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '14px', color: '#032b1d', outline: 'none', background: '#FFFFFF' }}>
                    <option value="maintenance">Maintenance</option>
                    <option value="inspeksi">Inspeksi</option>
                    <option value="produksi">Produksi</option>
                    <option value="darurat">Darurat</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.07em', marginBottom: '6px' }}>STATUS</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '14px', color: '#032b1d', outline: 'none', background: '#FFFFFF' }}>
                    <option value="ongoing">Ongoing</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>
              </div>

              {/* Lokasi */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.07em', marginBottom: '6px' }}>LOKASI</label>
                <input
                  placeholder="Area atau lokasi kejadian"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '14px', color: '#032b1d', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#087448'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              {/* Urgency */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.07em', marginBottom: '6px' }}>URGENCY LEVEL</label>
                <select value={form.urgency_level} onChange={e => setForm({ ...form, urgency_level: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '14px', color: '#032b1d', outline: 'none', background: '#FFFFFF' }}>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Waktu */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.07em', marginBottom: '6px' }}>WAKTU KEJADIAN</label>
                <input
                  type="datetime-local"
                  value={form.event_time}
                  onChange={e => setForm({ ...form, event_time: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '14px', color: '#032b1d', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#087448'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button onClick={() => setShowForm(false)}
                style={{ padding: '10px 20px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#FFFFFF', color: '#6b7280', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                Batal
              </button>
              <button onClick={handleSubmit}
                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#087448', color: '#FFFFFF', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#16b36c'}
                onMouseLeave={e => e.currentTarget.style.background = '#087448'}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}