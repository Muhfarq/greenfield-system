import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Assets.css';

const conditionStyles = {
  baik: 'badge-green',
  perlu_perhatian: 'badge-amber',
  rusak: 'badge-red',
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
    <div className="page-wrap">
      <Sidebar />
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Manajemen Aset</h1>
          <p className="page-subtitle">Inventaris dan kondisi aset perusahaan</p>
        </div>

        <div className="toolbar">
          <div className="search-wrap">
            <div className="search-icon">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input type="text" placeholder="Cari nama atau kode aset..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="search-input" />
          </div>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }} className="btn-primary-sm">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Tambah Aset
          </button>
        </div>

        <div className="table-wrap">
          {loading ? (
            <p className="act-empty">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="act-empty">Belum ada aset</p>
          ) : (
            <table className="assets-table">
              <thead className="table-header">
                <tr>
                  <th>Nama / Kode</th>
                  <th>Kategori</th>
                  <th>Lokasi</th>
                  <th>Kondisi</th>
                  <th>Insiden Open</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td className="assets-td">
                      <div className="assets-cell-name">{item.name}</div>
                      <div className="assets-cell-code">{item.asset_code}</div>
                    </td>
                    <td className="assets-cell-category">
                      <span className={'badge-green capitalize'}>{item.category}</span>
                    </td>
                    <td className="assets-cell-location">
                      {item.location || '-'}
                    </td>
                    <td className="assets-cell-condition">
                      <span className={`${conditionStyles[item.condition] || 'badge-green'} capitalize`}>
                        {item.condition.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="assets-cell-incidents">
                      {item.open_incidents > 0 ? (
                        <span className="assets-incident-open">{item.open_incidents} open</span>
                      ) : (
                        <span className="assets-incident-none">—</span>
                      )}
                    </td>
                    <td className="assets-cell-actions-wrap">
                      <div className="table-actions">
                        {(user?.role === 'admin' || item.user_id === user?.id) && (
                          <>
                            <button onClick={() => handleEdit(item)} className="assets-action-btn">
                              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="assets-action-btn">
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
                <h2 className="modal-title">{editId ? 'Edit Aset' : 'Tambah Aset'}</h2>
                <button onClick={() => { setShowForm(false); setEditId(null); }} className="modal-close">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="modal-body form-body">
                <div className="form-grid">
                  <div>
                    <label className="form-label">Nama Aset</label>
                    <input placeholder="Nama lengkap aset" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Kode Aset</label>
                    <input placeholder="EXC-001" value={form.asset_code}
                      onChange={(e) => setForm({ ...form, asset_code: e.target.value })} className="form-input" />
                  </div>
                </div>
                <div className="form-grid">
                  <div>
                    <label className="form-label">Kategori</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="form-select">
                      <option value="Mesin">Mesin</option>
                      <option value="Kendaraan">Kendaraan</option>
                      <option value="Peralatan">Peralatan</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Kondisi</label>
                    <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="form-select">
                      <option value="baik">Baik</option>
                      <option value="perlu_perhatian">Perlu Perhatian</option>
                      <option value="rusak">Rusak</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">Lokasi</label>
                  <input placeholder="Area atau gedung" value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Catatan</label>
                  <textarea placeholder="Informasi tambahan..." value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })} className="form-textarea textarea-sm" />
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
