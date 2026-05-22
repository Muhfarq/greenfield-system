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
import Logo from '../assets/Logo.png';

import './Sidebar.css';

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

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  const toggleCollapsed = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebarCollapsed', next);
      return next;
    });
  };

  return (
    <div className={`sidebar${isCollapsed ? ' collapsed' : ''}`}>

      {/* Header & Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-badge">
            <img src={Logo} alt="Greenfield" style={{ width: '60px', height: '40px' }} />
          </div>

          {!isCollapsed && (
            <div className="sidebar-brand">
              <div className="sidebar-brand-title">Greenfields</div>
              <div className="sidebar-brand-version">OMS v2.0</div>
            </div>
          )}
        </div>

        {/* Tombol Toggle Arrow */}
        <button
          onClick={toggleCollapsed}
          className="sidebar-toggle"
        >
          <img
            src={ArrowIcon}
            alt="Toggle Sidebar"
          />
        </button>
      </div>

      {/* Navigasi */}
      <nav className="sidebar-nav">
        {navItems.map(item => {
          if (item.adminOnly && user?.role !== 'admin') return null;
          const active = location.pathname === item.to;

          return (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              title={isCollapsed ? item.label : ''}
              className={`sidebar-nav-btn${active ? ' active' : ''}`}
            >
              <img
                src={item.icon}
                alt=""
                className="sidebar-nav-icon"
              />

              {!isCollapsed && (
                <span className="sidebar-nav-label">{item.label}</span>
              )}

              {/* Badge Insiden */}
              {item.label === 'Insiden' && incidentCount > 0 && (
                <span className="sidebar-nav-badge">
                  {incidentCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Profil User & Logout */}
      <div className="sidebar-user">
        <div className="sidebar-user-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        {!isCollapsed && (
          <>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="sidebar-logout"
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
