import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { to: '/dashboard', label: 'Dashboard', adminOnly: true },
    { to: '/activities', label: 'Aktivitas', adminOnly: false },
    { to: '/assets', label: 'Aset', adminOnly: false },
    { to: '/incidents', label: 'Insiden', adminOnly: false },
    { to: '/kanban', label: 'Kanban', adminOnly: false },
    { to: '/users', label: 'Kelola User', adminOnly: true },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-brand">Greenfield</span>
        <div className="navbar-links">
          {links.map((link) => {
            if (link.adminOnly && user?.role !== 'admin') return null;
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`navbar-link${active ? ' active' : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="navbar-right">
        <span className="navbar-user-name">
          {user?.name}
          <span className={`navbar-role-badge ${user?.role === 'admin' ? 'admin' : 'operator'}`}>
            {user?.role}
          </span>
        </span>
        <button
          onClick={handleLogout}
          className="navbar-logout"
        >
          Keluar
        </button>
      </div>
    </nav>
  );
}
