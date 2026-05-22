// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './Login.css'; 

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Logo & Title */}
      <div className="login-logo-section">
        <div className="login-logo-box">
          <span className="login-logo-letter">G</span>
        </div>
        <h1 className="login-title">PT Greenfield</h1>
        <p className="login-subtitle">Operations Management System</p>
      </div>

      {/* Card */}
      <div className="login-card">
        <h2 className="login-card-title">Masuk ke Sistem</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <div>
            <label className="login-field-label">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@greenfield.co.id"
              required
              className="login-input"
            />
          </div>

          <div>
            <label className="login-field-label">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              required
              className="login-input"
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="login-submit"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="login-footer">
        JWT · 8-hour session · Secured
      </p>
    </div>
  );
}
