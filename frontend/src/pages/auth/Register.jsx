import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Mail, Lock, User, ArrowRight, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';

const getInputStyle = (isDark) => ({
  background: isDark ? '#111111' : '#F4FBF6',
  border: `1px solid ${isDark ? '#2D4A36' : '#B9DEC5'}`,
  color: isDark ? '#F4FFF7' : '#16331F',
});

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', requesterType: 'student', phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      toast.success('Account created! Welcome to UHDMS.');
      navigate('/requester/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setFormData({ ...formData, [key]: e.target.value });
  const inputStyle = getInputStyle(isDark);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative transition-colors duration-300"
      style={{ background: isDark ? '#000000' : '#F1FAF3' }}
    >
      <button
        onClick={toggleTheme}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className="fixed top-5 right-5 z-50 p-2.5 rounded-xl border transition-colors shadow-lg"
        style={{
          background: isDark ? '#111111' : '#FFFFFF',
          borderColor: isDark ? '#2D4A36' : '#B9DEC5',
          color: isDark ? '#86EFAC' : '#15803D',
        }}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div
        className="w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden"
        style={{
          background: isDark ? '#0B0B0B' : '#FFFFFF',
          border: `1px solid ${isDark ? '#245232' : '#B9DEC5'}`,
        }}
      >
        <div className="h-1.5 w-full" style={{ background: '#15803D' }} />

        <div className="p-8">
          <div className="flex flex-col items-center mb-7 text-center">
            <div
              className="mb-4 rounded-2xl overflow-hidden flex items-center justify-center"
              style={{
                width: '100px',
                height: '115px',
                background: isDark ? '#0B0B0B' : '#FFFFFF',
                padding: '6px',
                border: '1.5px solid rgba(21,128,61,0.35)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              }}
            >
              <img
                src={isDark ? '/hormuud-logo-dark.png' : '/hormuud-logo.png'}
                alt="Hormuud University Official Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: isDark ? '#FFFFFF' : '#16331F' }}>
              Hormuud University
            </h1>
            <p className="text-sm font-semibold mt-0.5" style={{ color: '#15803D' }}>
              Help Desk Management System
            </p>
            <p className="text-xs mt-1.5 px-4" style={{ color: isDark ? '#A7B8AC' : '#587060' }}>
              Create your account to access the support portal
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-xs" style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#F87171' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? '#B8D7C0' : '#285136' }}>Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3" style={{ color: isDark ? '#86A891' : '#587060' }} />
                <input type="text" required value={formData.name} onChange={set('name')} placeholder="John Doe"
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 text-xs transition-all outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                  style={inputStyle} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? '#B8D7C0' : '#285136' }}>University Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3" style={{ color: isDark ? '#86A891' : '#587060' }} />
                <input type="email" required value={formData.email} onChange={set('email')} placeholder="s12345@student.uhdms.edu"
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 text-xs transition-all outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                  style={inputStyle} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? '#B8D7C0' : '#285136' }}>Phone (Optional)</label>
              <input type="text" value={formData.phone} onChange={set('phone')} placeholder="+252 61 000 0000"
                className="w-full rounded-xl px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                style={inputStyle} />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? '#B8D7C0' : '#285136' }}>Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3" style={{ color: isDark ? '#86A891' : '#587060' }} />
                <input type="password" required minLength={6} value={formData.password} onChange={set('password')} placeholder="••••••••"
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 text-xs transition-all outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                  style={inputStyle} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-green-700 hover:bg-green-600 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs mt-5" style={{ color: isDark ? '#A7B8AC' : '#587060' }}>
            Already have an account?{' '}
            <Link to="/login" className="text-green-700 font-semibold hover:text-green-600 hover:underline transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
