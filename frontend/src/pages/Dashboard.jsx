import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2,'0')}.${String(d.getMinutes()).padStart(2,'0')}`;
}

function timeAgo(ts) {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  return `${days} hari lalu`;
}

const cardIcons = {
  activities: { bg: '#d2f9e0', color: '#087448', path: 'M13 10V3L4 14h7v7l9-11h-7z' },
  assets: { bg: '#dbeafe', color: '#1d4ed8', path: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
  incidents: { bg: '#fee2e2', color: '#dc2626', path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z' },
  tasks: { bg: '#ede9fe', color: '#7c3aed', path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
};

const typeColors = {
  darurat: '#dc2626',
  maintenance: '#1d4ed8',
  inspeksi: '#7c3aed',
  produksi: '#087448',
};

const urgencyColors = {
  critical: '#dc2626',
  high: '#d97706',
  normal: '#6b7280',
};

export default function Dashboard() {
  const [data, setData] = useState({
    activities: [],
    assets: [],
    incidents: [],
    tasks: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [actRes, assetRes, incRes, taskRes] = await Promise.all([
          api.get('/activities'),
          api.get('/assets'),
          api.get('/incidents'),
          api.get('/tasks'),
        ]);
        setData({
          activities: actRes.data,
          assets: assetRes.data,
          incidents: incRes.data,
          tasks: taskRes.data,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="dash-loading">
        <Sidebar />
        <div className="dash-loading-inner">Memuat data...</div>
      </div>
    );
  }

  const { activities, assets, incidents, tasks } = data;

  const chartData = [
    { name: 'Aktivitas', value: activities.length, fill: '#087448' },
    { name: 'Aset', value: assets.length, fill: '#1d4ed8' },
    { name: 'Insiden', value: incidents.length, fill: '#dc2626' },
    { name: 'Tugas', value: tasks.length, fill: '#7c3aed' },
  ];

  const allActivities = [
    ...activities.map(a => ({ ...a, _type: 'activity' })),
    ...incidents.map(i => ({ ...i, _type: 'incident' })),
    ...tasks.map(t => ({ ...t, _type: 'task' })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8);

  return (
    <div className="dash-page">
      <Sidebar />
      <div className="dash-content">
        <div className="dash-header">
          <div>
            <h1>Dashboard</h1>
            <p>Ringkasan aktivitas dan status sistem</p>
          </div>
          <div className="dash-time">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>

        <div className="dash-cards">
          <div className="dash-card">
            <div className="dash-card-icon" style={{ background: cardIcons.activities.bg }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={cardIcons.activities.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={cardIcons.activities.path} />
              </svg>
            </div>
            <div className="dash-card-info">
              <span className="dash-card-value">{activities.length}</span>
              <span className="dash-card-label">Total Aktivitas</span>
            </div>
          </div>
          <div className="dash-card">
            <div className="dash-card-icon" style={{ background: cardIcons.assets.bg }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={cardIcons.assets.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={cardIcons.assets.path} />
              </svg>
            </div>
            <div className="dash-card-info">
              <span className="dash-card-value">{assets.length}</span>
              <span className="dash-card-label">Total Aset</span>
            </div>
          </div>
          <div className="dash-card">
            <div className="dash-card-icon" style={{ background: cardIcons.incidents.bg }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={cardIcons.incidents.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={cardIcons.incidents.path} />
              </svg>
            </div>
            <div className="dash-card-info">
              <span className="dash-card-value">{incidents.length}</span>
              <span className="dash-card-label">Total Insiden</span>
            </div>
          </div>
          <div className="dash-card">
            <div className="dash-card-icon" style={{ background: cardIcons.tasks.bg }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={cardIcons.tasks.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={cardIcons.tasks.path} />
              </svg>
            </div>
            <div className="dash-card-info">
              <span className="dash-card-value">{tasks.length}</span>
              <span className="dash-card-label">Total Tugas</span>
            </div>
          </div>
        </div>

        <div className="dash-grid">
          <div className="dash-panel">
            <h3 className="dash-panel-title">Statistik Data</h3>
            <div className="dash-chart-wrap">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                    formatter={(val) => [val, 'Jumlah']}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dash-panel">
            <h3 className="dash-panel-title">Aktivitas Terbaru</h3>
            <div className="dash-activity-list">
              {allActivities.length === 0 ? (
                <div className="dash-empty">Belum ada aktivitas</div>
              ) : allActivities.map((item, idx) => (
                <div key={`${item._type}-${item.id}`} className="dash-activity-item">
                  <div className="dash-activity-dot" style={{
                    background: item._type === 'activity' ? '#087448'
                      : item._type === 'incident' ? '#dc2626' : '#7c3aed'
                  }} />
                  <div className="dash-activity-body">
                    <span className="dash-activity-title">{item.title}</span>
                    <span className="dash-activity-time">{timeAgo(item.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
