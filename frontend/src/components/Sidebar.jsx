// src/components/Sidebar.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

import DashboardIcon from '../assets/Dashboard.svg';
import AktifitasIcon from '../assets/aktifitas.svg';
import AsetIcon from '../assets/aset.svg';
import InsidenIcon from '../assets/insiden.svg';
import KanbanIcon from '../assets/kanban.svg';
import UserIcon from '../assets/user.svg';
import ArrowIcon from '../assets/arrow.svg'; 

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon, adminOnly: false },
  { to: '/activities', label: 'Aktivitas', icon: AktifitasIcon, adminOnly: false },
  { to: '/assets', label: 'Aset', icon: AsetIcon, adminOnly: false },
  { to: '/incidents', label: 'Insiden', icon: InsidenIcon, adminOnly: false },
  { to: '/kanban', label: 'Kanban', icon: KanbanIcon, adminOnly: false },
  { to: '/users', label: 'Kelola User', icon: UserIcon, adminOnly: true },
];

export default function Sidebar({ incidentCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State untuk mode collapse
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarWidth = isCollapsed ? '80px' : '220px';

  return (
    <div style={{
      width: sidebarWidth, 
      minHeight: '100vh', 
      background: '#032b1d',
      display: 'flex', 
      flexDirection: 'column', 
      position: 'fixed', 
      left: 0, 
      top: 0, 
      zIndex: 10,
      transition: 'width 0.3s ease-in-out' // Animasi transisi lebar
    }}>
      
      {/* Header & Logo */}
      <div style={{ 
        padding: isCollapsed ? '20px 0' : '20px 16px', 
        borderBottom: '1px solid #0a3d23',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        flexDirection: isCollapsed ? 'column' : 'row',
        gap: isCollapsed ? '15px' : '0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', background: '#087448', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: '700', color: '#FFFFFF', flexShrink: 0
          }}>G</div>
          
          {!isCollapsed && (
            <div style={{ whiteSpace: 'nowrap', opacity: isCollapsed ? 0 : 1, transition: 'opacity 0.2s' }}>
              <div style={{ color: '#FFFFFF', fontWeight: '600', fontSize: '15px' }}>Greenfeld</div>
              <div style={{ color: '#16b36c', fontSize: '11px' }}>OMS v2.0</div>
            </div>
          )}
        </div>

        {/* Tombol Toggle Arrow */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ 
            background: 'none', border: 'none', cursor: 'pointer', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '4px'
          }}
        >
          <img 
            src={ArrowIcon} 
            alt="Toggle Sidebar" 
            style={{ 
              width: '16px', 
              height: '16px', 
              opacity: 0.7,
              transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)', // Berputar sesuai mode
              transition: 'transform 0.3s ease'
            }} 
          />
        </button>
      </div>

      {/* Navigasi */}
      <nav style={{ padding: '12px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(item => {
          if (item.adminOnly && user?.role !== 'admin') return null;
          const active = location.pathname === item.to;
          
          return (
            <button key={item.to} onClick={() => navigate(item.to)}
              title={isCollapsed ? item.label : ''} // Memunculkan tooltip saat dicollapse
              style={{
                display: 'flex', alignItems: 'center', 
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '10px',
                padding: '10px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: active ? '#087448' : 'transparent',
                color: active ? '#FFFFFF' : '#d2f9e0',
                fontSize: '14px', fontWeight: active ? '600' : '400',
                textAlign: 'left', width: '100%', position: 'relative',
                transition: 'background 0.15s, justify-content 0.3s'
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#0a3d23' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <img
                src={item.icon} alt=""
                style={{
                  width: '18px', height: '18px', flexShrink: 0,
                  filter: active
                    ? 'brightness(0) invert(1)'
                    : 'brightness(0) invert(0.7) sepia(1) hue-rotate(90deg) saturate(2)'
                }}
              />
              
              {!isCollapsed && (
                <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
              )}

              {/* Badge Insiden */}
              {item.label === 'Insiden' && incidentCount > 0 && (
                <span style={{
                  marginLeft: isCollapsed ? '0' : 'auto', 
                  position: isCollapsed ? 'absolute' : 'static',
                  top: isCollapsed ? '4px' : 'auto',
                  right: isCollapsed ? '4px' : 'auto',
                  background: '#dc2626', color: '#FFFFFF',
                  fontSize: '10px', fontWeight: '700', borderRadius: '99px',
                  padding: '1px 6px', minWidth: '18px', textAlign: 'center'
                }}>
                  {incidentCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Profil User & Logout */}
      <div style={{ 
        padding: '14px 16px', 
        borderTop: '1px solid #0a3d23', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        gap: '10px' 
      }}>
        <div style={{
          width: '32px', height: '32px', background: '#16b36c', borderRadius: '99px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: '700', color: '#032b1d', flexShrink: 0
        }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        
        {!isCollapsed && (
          <>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ color: '#16b36c', fontSize: '11px', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', opacity: 0.7, display: 'flex', alignItems: 'center' }}
              title="Keluar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d2f9e0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}