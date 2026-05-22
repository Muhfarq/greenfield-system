// src/components/Sidebar.jsx
import { useLocation, useNavigate } from 'react-router-dom';
// Pastikan path useAuth ini sesuai dengan struktur project Anda
import { useAuth } from '../context/AuthContext'; 

import DashboardIcon from '../assets/dashboard.svg'; // Tambahkan icon ini
import AktifitasIcon from '../assets/aktifitas.svg';
import AsetIcon from '../assets/aset.svg';
import InsidenIcon from '../assets/insiden.svg';
import KanbanIcon from '../assets/kanban.svg'; // Tambahkan icon ini
import UserIcon from '../assets/user.svg'; // Tambahkan icon ini

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon, adminOnly: false },
  { to: '/activities', label: 'Aktivitas', icon: AktifitasIcon, adminOnly: false },
  { to: '/assets', label: 'Aset', icon: AsetIcon, adminOnly: false },
  { to: '/incidents', label: 'Insiden', icon: InsidenIcon, adminOnly: false },
  { to: '/kanban', label: 'Kanban', icon: KanbanIcon, adminOnly: false },
  { to: '/users', label: 'Kelola User', icon: UserIcon, adminOnly: true },
];

export default function Sidebar({ incidentCount }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{
      width: '220px', minHeight: '100vh', background: '#032b1d',
      display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, zIndex: 10
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid #0a3d23' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', background: '#087448', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: '700', color: '#FFFFFF'
          }}>G</div>
          <div>
            <div style={{ color: '#FFFFFF', fontWeight: '600', fontSize: '15px' }}>Greenfeld</div>
            <div style={{ color: '#16b36c', fontSize: '11px' }}>OMS v2.0</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(item => {
          if (item.adminOnly && user?.role !== 'admin') return null;
          const active = location.pathname === item.to;
          return (
            <button key={item.to} onClick={() => navigate(item.to)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: active ? '#087448' : 'transparent',
                color: active ? '#FFFFFF' : '#d2f9e0',
                fontSize: '14px', fontWeight: active ? '600' : '400',
                textAlign: 'left', width: '100%', position: 'relative',
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#0a3d23' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <img
                src={item.icon} alt=""
                style={{
                  width: '18px', height: '18px',
                  filter: active ? 'brightness(0) invert(1)' : 'brightness(0) invert(0.8) sepia(1) hue-rotate(90deg) saturate(2)'
                }}
              />
              {item.label}
              {item.label === 'Insiden' && incidentCount > 0 && (
                <span style={{
                  marginLeft: 'auto', background: '#dc2626', color: '#FFFFFF',
                  fontSize: '10px', fontWeight: '700', borderRadius: '99px',
                  padding: '1px 6px', minWidth: '18px', textAlign: 'center'
                }}>{incidentCount}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid #0a3d23', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px', height: '32px', background: '#16b36c', borderRadius: '99px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: '700', color: '#032b1d', flexShrink: 0
        }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
          <div style={{ color: '#16b36c', fontSize: '11px', textTransform: 'capitalize' }}>{user?.role}</div>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', opacity: 0.7, display: 'flex', alignItems: 'center' }}
          title="Keluar"
        >
          <img src={UserIcon} alt="logout" style={{ width: '18px', height: '18px', filter: 'brightness(0) invert(1)' }} />
        </button>
      </div>
    </div>
  );
}