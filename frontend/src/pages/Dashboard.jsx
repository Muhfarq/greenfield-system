import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import './Dashboard.css';

const COLORS = {
  green: '#087448', blue: '#1d4ed8', red: '#dc2626', purple: '#7c3aed',
  amber: '#d97706', teal: '#0d9488', pink: '#db2777', gray: '#6b7280',
};

const urgencyColors = { critical: '#dc2626', high: '#d97706', normal: '#6b7280' };
const incidentStatusColors = { open: '#dc2626', in_progress: '#d97706', resolved: '#087448' };
const taskStatusColors = { todo: '#dbeafe', in_progress: '#fef3c7', done: '#d2f9e0' };
const taskLabelColors = { todo: '#1d4ed8', in_progress: '#d97706', done: '#087448' };

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return `${d.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'][d.getMonth()]} ${d.getFullYear()}`;
}

function getLast30Days() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="dash-tooltip">
        <p className="dash-tooltip-label">{label || payload[0].name}</p>
        {payload.map((p, i) => (
          <p key={i} className="dash-tooltip-item" style={{ color: p.color || '#6b7280' }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [data, setData] = useState({ activities: [], assets: [], incidents: [], tasks: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [actRes, assetRes, incRes, taskRes, userRes] = await Promise.all([
          api.get('/activities'),
          api.get('/assets'),
          api.get('/incidents'),
          api.get('/tasks'),
          api.get('/auth/users'),
        ]);
        setData({
          activities: actRes.data,
          assets: assetRes.data,
          incidents: incRes.data,
          tasks: taskRes.data,
          users: userRes.data,
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
        <div className="dash-loading-inner">Memuat data dashboard...</div>
      </div>
    );
  }

  const { activities, assets, incidents, tasks, users } = data;

  // --- KPI Cards ---
  const totalAset = assets.length;
  const asetBermasalah = assets.filter(a => a.condition && a.condition !== 'baik').length;
  const insidenOpen = incidents.filter(i => i.status === 'open').length;
  const now = new Date();
  const taskOverdue = tasks.filter(t => {
    if (t.status === 'done') return false;
    if (!t.due_date) return false;
    return new Date(t.due_date) < now;
  }).length;

  // --- Incidents by Status ---
  const incStatusData = [
    { name: 'Open', value: incidents.filter(i => i.status === 'open').length, color: '#dc2626' },
    { name: 'In Progress', value: incidents.filter(i => i.status === 'in_progress').length, color: '#d97706' },
    { name: 'Resolved', value: incidents.filter(i => i.status === 'resolved').length, color: '#087448' },
  ].filter(d => d.value > 0);

  // --- Urgency Overview (incidents + activities) ---
  const urgencyCount = { normal: 0, high: 0, critical: 0 };
  incidents.forEach(i => { if (urgencyCount[i.urgency_level] !== undefined) urgencyCount[i.urgency_level]++; });
  activities.forEach(a => { if (urgencyCount[a.urgency_level] !== undefined) urgencyCount[a.urgency_level]++; });
  const urgencyData = [
    { name: 'Normal', value: urgencyCount.normal, color: '#6b7280' },
    { name: 'High', value: urgencyCount.high, color: '#d97706' },
    { name: 'Critical', value: urgencyCount.critical, color: '#dc2626' },
  ].filter(d => d.value > 0);

  // --- Task Progress per Status ---
  const taskStatusCount = { todo: 0, in_progress: 0, done: 0 };
  tasks.forEach(t => {
    const s = t.status || 'todo';
    if (taskStatusCount[s] !== undefined) taskStatusCount[s]++;
    else taskStatusCount.todo++;
  });
  const taskProgressData = [
    { name: 'To Do', value: taskStatusCount.todo, fill: '#1d4ed8' },
    { name: 'In Progress', value: taskStatusCount.in_progress, fill: '#d97706' },
    { name: 'Done', value: taskStatusCount.done, fill: '#087448' },
  ];
  const totalTasks = tasks.length;

  // --- Asset Condition Summary ---
  const condCount = {};
  assets.forEach(a => {
    const c = a.condition || 'tidak diketahui';
    condCount[c] = (condCount[c] || 0) + 1;
  });
  const condLabels = { baik: 'Baik', perlu_perhatian: 'Perlu Perhatian', rusak: 'Rusak' };
  const conditionColors = { baik: '#087448', perlu_perhatian: '#d97706', rusak: '#dc2626' };
  const assetConditionData = Object.entries(condCount).map(([k, v]) => ({
    name: condLabels[k] || k, value: v, fill: conditionColors[k] || '#6b7280',
  }));

  // --- 30 days boundary ---
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // --- Incident Trend (30 days) ---
  const last30 = getLast30Days();
  const incByDay = {};
  incidents.forEach(i => {
    const day = i.created_at?.slice(0, 10);
    if (day && last30.includes(day)) {
      incByDay[day] = (incByDay[day] || 0) + 1;
    }
  });
  const incidentTrendData = last30.map(day => ({
    date: day.slice(5), value: incByDay[day] || 0,
  }));

  // --- Task Completion Rate per Operator ---
  const operatorTasks = {};
  tasks.forEach(t => {
    const name = t.assigned_to_name || 'Unassigned';
    if (!operatorTasks[name]) operatorTasks[name] = { total: 0, done: 0 };
    operatorTasks[name].total++;
    if (t.status === 'done') operatorTasks[name].done++;
  });
  const taskCompletionData = Object.entries(operatorTasks).map(([name, vals]) => ({
    name: name.split(' ')[0], total: vals.total, done: vals.done,
  }));

  // --- Production Activity Timeline ---
  const prodActs = activities
    .filter(a => a.type === 'produksi')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8);

  return (
    <div className="dash-page">
      <Sidebar />
      <div className="dash-content">
        <div className="dash-header">
          <div>
            <h1>Dashboard</h1>
            <p>Ringkasan aktivitas dan status sistem</p>
          </div>
          <div className="dash-time">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="dash-cards">
          <div className="dash-card">
            <div className="dash-card-icon dash-card-icon-blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div className="dash-card-info">
              <span className="dash-card-value">{totalAset}</span>
              <span className="dash-card-label">Total Aset</span>
            </div>
          </div>
          <div className="dash-card dash-card-click" onClick={() => setDetailModal('aset')} title="Klik untuk lihat detail">
            <div className="dash-card-icon dash-card-icon-red">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v2m0 4h.01M10.29 3.86l-7.58 11.35A1 1 0 003.58 17h16.84a1 1 0 00.87-1.49L13.71 3.86a1 1 0 00-1.72 0z" />
              </svg>
            </div>
            <div className="dash-card-info">
              <span className="dash-card-value" style={{ color: asetBermasalah > 0 ? '#dc2626' : undefined }}>{asetBermasalah}</span>
              <span className="dash-card-label">Aset Bermasalah</span>
            </div>
          </div>
          <div className="dash-card dash-card-click" onClick={() => setDetailModal('insiden')} title="Klik untuk lihat detail">
            <div className="dash-card-icon dash-card-icon-red">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="dash-card-info">
              <span className="dash-card-value" style={{ color: insidenOpen > 0 ? '#dc2626' : undefined }}>{insidenOpen}</span>
              <span className="dash-card-label">Insiden Open</span>
            </div>
          </div>
          <div className="dash-card dash-card-click" onClick={() => setDetailModal('task')} title="Klik untuk lihat detail">
            <div className="dash-card-icon dash-card-icon-amber">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="dash-card-info">
              <span className="dash-card-value" style={{ color: taskOverdue > 0 ? '#dc2626' : undefined }}>{taskOverdue}</span>
              <span className="dash-card-label">Task Overdue</span>
            </div>
          </div>
        </div>

        {/* Row: Incidents by Status + Urgency Overview */}
        <div className="dash-grid">
          <div className="dash-panel">
            <h3 className="dash-panel-title">Insiden by Status</h3>
            {incStatusData.length === 0 ? (
              <div className="dash-empty">Belum ada data</div>
            ) : (
              <>
                <div className="dash-chart-wrap dash-center">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={incStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                        dataKey="value" paddingAngle={3}>
                        {incStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="dash-legend">
                  {incStatusData.map(d => (
                    <div key={d.name} className="dash-legend-item">
                      <span className="dash-legend-dot" style={{ background: d.color }} />
                      {d.name}: {d.value}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="dash-panel">
            <h3 className="dash-panel-title">Urgency Level Overview</h3>
            {urgencyData.length === 0 ? (
              <div className="dash-empty">Belum ada data</div>
            ) : (
              <>
                <div className="dash-chart-wrap dash-center">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={urgencyData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                        dataKey="value" paddingAngle={3}>
                        {urgencyData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="dash-legend">
                  {urgencyData.map(d => (
                    <div key={d.name} className="dash-legend-item">
                      <span className="dash-legend-dot" style={{ background: d.color }} />
                      {d.name}: {d.value}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Row: Task Progress + Asset Condition */}
        <div className="dash-grid">
          <div className="dash-panel">
            <h3 className="dash-panel-title">Kanban Task Progress</h3>
            {totalTasks === 0 ? (
              <div className="dash-empty">Belum ada task</div>
            ) : (
              <>
                <div className="progress-bar-track progress-track">
                  {taskProgressData.map(d => d.value > 0 && (
                    <div key={d.name} className="progress-bar-fill" style={{
                      width: `${(d.value / totalTasks) * 100}%`,
                      background: d.fill,
                    }} title={`${d.name}: ${d.value}`} />
                  ))}
                </div>
                <div className="progress-bar-label">
                  <span>Total: {totalTasks} task</span>
                  <span>{Math.round((taskStatusCount.done / totalTasks) * 100)}% selesai</span>
                </div>
                <div className="dash-legend legend-margin">
                  {taskProgressData.map(d => d.value > 0 && (
                    <div key={d.name} className="dash-legend-item">
                      <span className="dash-legend-dot" style={{ background: d.fill }} />
                      {d.name}: {d.value}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="dash-panel">
            <h3 className="dash-panel-title">Asset Condition</h3>
            {assetConditionData.length === 0 ? (
              <div className="dash-empty">Belum ada data aset</div>
            ) : (
              <div className="dash-chart-wrap">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={assetConditionData} layout="vertical" margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fill: '#032b1d' }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                      {assetConditionData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

          {/* Row: Operator Task Performance + Incident Trend */}
          <div className="dash-grid">
            <div className="dash-panel">
              <h3 className="dash-panel-title">Penyelesaian Task per Operator (30 Hari)</h3>
              {(() => {
                const opTasks = {};
                tasks.filter(t => new Date(t.created_at) >= thirtyDaysAgo).forEach(t => {
                  const name = t.assigned_to_name || 'Unassigned';
                  if (!opTasks[name]) opTasks[name] = { total: 0, done: 0 };
                  opTasks[name].total++;
                  if (t.status === 'done') opTasks[name].done++;
                });
                const sorted = Object.entries(opTasks)
                  .map(([name, v]) => ({ name: name.split(' ')[0], total: v.total, done: v.done, rate: v.total > 0 ? Math.round((v.done / v.total) * 100) : 0 }))
                  .sort((a, b) => b.done - a.done || b.rate - a.rate);
                return sorted.length === 0 ? (
                  <div className="dash-empty">Belum ada task 30 hari terakhir</div>
                ) : (
                  <div className="dash-chart-wrap">
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={sorted} layout="vertical" margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fill: '#032b1d' }} axisLine={false} tickLine={false} width={70} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend formatter={val => val === 'done' ? 'Selesai' : 'Total Task'} />
                        <Bar dataKey="total" fill="#e5e7eb" radius={[0, 6, 6, 0]} barSize={22} name="total" />
                        <Bar dataKey="done" fill="#087448" radius={[0, 6, 6, 0]} barSize={22} name="done" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}
            </div>

          <div className="dash-panel">
            <h3 className="dash-panel-title">Tren Insiden (30 Hari)</h3>
            {incidentTrendData.every(d => d.value === 0) ? (
              <div className="dash-empty">Belum ada insiden 30 hari terakhir</div>
            ) : (
              <div className="dash-chart-wrap">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={incidentTrendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} interval={4} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="value" stroke="#dc2626" strokeWidth={2}
                      dot={{ r: 3, fill: '#dc2626' }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Row: Task Completion Rate + Production Timeline */}
        <div className="dash-grid">
          <div className="dash-panel">
            <h3 className="dash-panel-title">Task Completion per Operator</h3>
            {taskCompletionData.length === 0 ? (
              <div className="dash-empty">Belum ada data task</div>
            ) : (
              <div className="dash-chart-wrap">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={taskCompletionData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend formatter={val => val === 'done' ? 'Selesai' : 'Total'} />
                    <Bar dataKey="total" fill="#e5e7eb" radius={[6, 6, 0, 0]} barSize={24} name="total" />
                    <Bar dataKey="done" fill="#087448" radius={[6, 6, 0, 0]} barSize={24} name="done" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="dash-panel">
            <h3 className="dash-panel-title">Produksi Timeline</h3>
            {prodActs.length === 0 ? (
              <div className="dash-empty">Belum ada aktivitas produksi</div>
            ) : (
              <div className="dash-timeline">
                {prodActs.map(a => (
                  <div key={a.id} className="dash-timeline-item">
                    <div className="dash-timeline-cell">
                      <div className="dash-timeline-title">{a.title}</div>
                      <div className="dash-timeline-date">{formatDate(a.created_at)}</div>
                    </div>
                    <div className="dash-timeline-bar" style={{
                      background: a.status === 'ongoing' ? '#087448' : '#9ca3af',
                    }}>
                      {a.status === 'ongoing' ? 'Ongoing' : 'Selesai'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {detailModal && (
          <div className="dash-modal-overlay" onClick={() => setDetailModal(null)}>
            <div className="dash-modal-card" onClick={e => e.stopPropagation()}>
              <div className="dash-modal-header">
                <h2 className="dash-modal-title">
                  {detailModal === 'aset' && 'Daftar Aset Bermasalah'}
                  {detailModal === 'insiden' && 'Daftar Insiden Open'}
                  {detailModal === 'task' && 'Daftar Task Overdue'}
                </h2>
                <button onClick={() => setDetailModal(null)} className="dash-modal-close">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="dash-modal-body">
                {detailModal === 'aset' && (
                  <table className="dash-modal-table">
                    <thead><tr>
                      <th>Nama Aset</th><th>Kode</th><th>Kondisi</th><th>Lokasi</th>
                    </tr></thead>
                    <tbody>
                      {assets.filter(a => a.condition && a.condition !== 'baik').map(a => (
                        <tr key={a.id}>
                          <td className="dash-modal-cell-bold">{a.name}</td>
                          <td className="dash-modal-mono">{a.asset_code}</td>
                          <td><span className={`dash-modal-badge ${a.condition === 'rusak' ? 'badge-red' : 'badge-amber'}`}>{a.condition.replace('_', ' ')}</span></td>
                          <td>{a.location || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {detailModal === 'insiden' && (
                  <table className="dash-modal-table">
                    <thead><tr>
                      <th>Judul</th><th>Urgency</th><th>Aset</th><th>Dibuat</th>
                    </tr></thead>
                    <tbody>
                      {incidents.filter(i => i.status === 'open').map(i => (
                        <tr key={i.id}>
                          <td className="dash-modal-cell-bold">{i.title}</td>
                          <td><span className={`dash-modal-badge ${i.urgency_level === 'critical' ? 'badge-red' : i.urgency_level === 'high' ? 'badge-amber' : 'badge-green'}`}>{i.urgency_level}</span></td>
                          <td>{i.asset_name || '-'}</td>
                          <td className="dash-modal-mono">{formatDate(i.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {detailModal === 'task' && (
                  <table className="dash-modal-table">
                    <thead><tr>
                      <th>Judul Task</th><th>Assignee</th><th>Priority</th><th>Deadline</th>
                    </tr></thead>
                    <tbody>
                      {tasks.filter(t => {
                        if (t.status === 'done') return false;
                        if (!t.due_date) return false;
                        return new Date(t.due_date) < now;
                      }).map(t => (
                        <tr key={t.id}>
                          <td className="dash-modal-cell-bold">{t.title}</td>
                          <td>{t.assigned_to_name || '-'}</td>
                          <td><span className={`dash-modal-badge ${t.priority === 'high' ? 'badge-red' : t.priority === 'medium' ? 'badge-amber' : 'badge-green'}`}>{t.priority}</span></td>
                          <td className="dash-modal-mono">{t.due_date?.substring(0, 10) || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
