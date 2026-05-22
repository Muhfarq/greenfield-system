import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ assets: 0, incidents: 0, activities: 0, users: 0 });
  const [incidentChart, setIncidentChart] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/activities', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const fetchData = async () => {
      try {
        const [a, i, ac, u] = await Promise.all([
          api.get('/assets'),
          api.get('/incidents'),
          api.get('/activities'),
          api.get('/auth/users'),
        ]);

        const openIncidents = i.data.filter(x => x.status === 'open' || x.status === 'in_progress');
        const ongoingActivities = ac.data.filter(x => x.status === 'ongoing');

        setStats({
          assets: a.data.length,
          incidents: openIncidents.length,
          activities: ongoingActivities.length,
          users: u.data.length,
        });

        const urgencyCount = { critical: 0, high: 0, normal: 0 };
        i.data.forEach(x => {
          urgencyCount[x.urgency_level] = (urgencyCount[x.urgency_level] || 0) + 1;
        });

        setIncidentChart([
          { name: 'Critical', value: urgencyCount.critical },
          { name: 'High', value: urgencyCount.high },
          { name: 'Normal', value: urgencyCount.normal },
        ]);

        setRecentActivities(ac.data.slice(-5).reverse());
      } catch (err) {
        console.error('Gagal memuat data dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return `${d.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'][d.getMonth()]} ${d.getFullYear()}`;
  };

  if (!user || user.role !== 'admin') return null;

  if (loading) return (
    <div className="dash-loading">
      <Sidebar />
      <div className="dash-loading-inner">Loading...</div>
    </div>
  );

  return (
    <div className="dash-page">
      <Sidebar />
      <div className="dash-content">
        <div className="dash-header">
          <div>
            <h1>Dashboard</h1>
            <p>Ringkasan operasional PT Greenfield</p>
          </div>
          <div className="dash-time">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        <div className="dash-cards">
          <div className="dash-card">
            <div className="dash-card-icon" style={{ background: '#d2f9e0', color: '#087448' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
            </div>
            <div className="dash-card-info">
              <span className="dash-card-value">{stats.assets}</span>
              <span className="dash-card-label">Total Aset</span>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="10"/></svg>
            </div>
            <div className="dash-card-info">
              <span className="dash-card-value">{stats.incidents}</span>
              <span className="dash-card-label">Insiden Open</span>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <div className="dash-card-info">
              <span className="dash-card-value">{stats.activities}</span>
              <span className="dash-card-label">Aktivitas Berlangsung</span>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
            <div className="dash-card-info">
              <span className="dash-card-value">{stats.users}</span>
              <span className="dash-card-label">Total User</span>
            </div>
          </div>
        </div>

        <div className="dash-grid">
          <div className="dash-panel">
            <h2 className="dash-panel-title">Insiden by Urgency</h2>
            <div className="dash-chart-wrap">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={incidentChart}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#087448" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dash-panel">
            <h2 className="dash-panel-title">Aktivitas Terbaru</h2>
            <div className="dash-activity-list">
              {recentActivities.length === 0 ? (
                <div className="dash-empty">Belum ada aktivitas</div>
              ) : recentActivities.map((act, idx) => (
                <div key={act.id || idx} className="dash-activity-item">
                  <div className="dash-activity-dot" />
                  <div className="dash-activity-body">
                    <span className="dash-activity-title">{act.title}</span>
                    <span className="dash-activity-time">{formatDate(act.created_at)}</span>
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