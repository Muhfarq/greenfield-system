import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="text-green-500 font-semibold text-lg">Greenfield</span>
        <div className="flex gap-1">
          {links.map((link) => {
            if (link.adminOnly && user?.role !== 'admin') return null;
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  active
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">
          {user?.name}
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
            user?.role === 'admin'
              ? 'bg-purple-500/20 text-purple-300'
              : 'bg-green-500/20 text-green-300'
          }`}>
            {user?.role}
          </span>
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-red-400 transition"
        >
          Keluar
        </button>
      </div>
    </nav>
  );
}
