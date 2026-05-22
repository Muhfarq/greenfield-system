import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
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
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon, adminOnly: true },
  { to: '/activities', label: 'Aktivitas', icon: AktifitasIcon, adminOnly: false },
  { to: '/assets', label: 'Aset', icon: AsetIcon, adminOnly: false },
  { to: '/incidents', label: 'Insiden', icon: InsidenIcon, adminOnly: false },
  { to: '/kanban', label: 'Kanban', icon: KanbanIcon, adminOnly: false },
  { to: '/users', label: 'Kelola User', icon: UserIcon, adminOnly: true },
];

export default function Sidebar({ incidentCount = 0 }) {
  const { user, logout } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="sidebar" style={{ width: isCollapsed ? '80px' : '220px' }}>

      <div className={`sidebar-header${isCollapsed ? ' collapsed' : ''}`}>
        <div className="sidebar-logo-section">
          <img src={Logo} alt="Greenfield" className="sidebar-logo" />

          {!isCollapsed && (
            <div className="sidebar-brand-text">
              <div className="sidebar-brand-name">Greenfeld</div>
              <div className="sidebar-brand-version">OMS v2.0</div>
            </div>
          )}
        </div>

        <button onClick={toggleSidebar} className="sidebar-toggle">
          <img src={ArrowIcon} alt="Toggle Sidebar" className={`sidebar-arrow${isCollapsed ? ' collapsed' : ''}`} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => {
          if (item.adminOnly && user?.role !== 'admin') return null;
          const active = location.pathname === item.to;

          return (
            <button key={item.to} onClick={() => navigate(item.to)}
              title={isCollapsed ? item.label : ''}
              className={`sidebar-nav-item${active ? ' active' : ''}${isCollapsed ? ' collapsed' : ''}`}
            >
              <img src={item.icon} alt="" className="sidebar-nav-icon" />

              {!isCollapsed && (
                <span className="sidebar-nav-label">{item.label}</span>
              )}

              {item.label === 'Insiden' && incidentCount > 0 && (
                <span className={`sidebar-badge${isCollapsed ? ' collapsed' : ''}`}>
                  {incidentCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className={`sidebar-user${isCollapsed ? ' collapsed' : ''}`}>
        <div className="sidebar-avatar">
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
              <svg viewBox="0 0 24 24" fill="none" stroke="#d2f9e0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
