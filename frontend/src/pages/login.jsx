// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

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
    <div style={{ minHeight: '100vh', background: '#032b1d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>

      {/* Logo & Title */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '64px', height: '64px', background: '#087448',
          borderRadius: '16px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 16px'
        }}>
          <span style={{ color: '#FFFFFF', fontSize: '28px', fontWeight: '600' }}>G</span>
        </div>
        <h1 style={{ color: '#FFFFFF', fontSize: '22px', fontWeight: '600', margin: '0 0 6px' }}>
          PT Greenfield
        </h1>
        <p style={{ color: '#16b36c', fontSize: '14px', margin: 0 }}>
          Operations Management System
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: '#FFFFFF', borderRadius: '16px',
        padding: '32px', width: '100%', maxWidth: '400px'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#032b1d', margin: '0 0 24px' }}>
          Masuk ke Sistem
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6b7280', letterSpacing: '0.08em', marginBottom: '6px' }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@greenfield.co.id"
              required
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                border: '1.5px solid #e5e7eb', fontSize: '14px', color: '#032b1d',
                outline: 'none', boxSizing: 'border-box', background: '#FFFFFF'
              }}
              onFocus={e => e.target.style.borderColor = '#087448'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6b7280', letterSpacing: '0.08em', marginBottom: '6px' }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              required
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                border: '1.5px solid #e5e7eb', fontSize: '14px', color: '#032b1d',
                outline: 'none', boxSizing: 'border-box', background: '#FFFFFF'
              }}
              onFocus={e => e.target.style.borderColor = '#087448'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {error && (
            <p style={{ fontSize: '13px', color: '#dc2626', margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px', borderRadius: '8px',
              background: loading ? '#087448aa' : '#087448',
              color: '#FFFFFF', fontSize: '15px', fontWeight: '600',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '4px', transition: 'background 0.2s'
            }}
            onMouseEnter={e => { if (!loading) e.target.style.background = '#16b36c' }}
            onMouseLeave={e => { if (!loading) e.target.style.background = '#087448' }}
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p style={{ color: '#087448', fontSize: '12px', marginTop: '24px', opacity: 0.7 }}>
        JWT · 8-hour session · Secured
      </p>
    </div>
  );
}