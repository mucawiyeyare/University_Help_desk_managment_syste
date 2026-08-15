import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, KeyRound, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';

const getInputStyle = (isDark) => ({
  background: isDark ? '#111111' : '#F4FBF6',
  border: `1px solid ${isDark ? '#2D4A36' : '#B9DEC5'}`,
  color: isDark ? '#F4FFF7' : '#16331F',
});

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const inputStyle = getInputStyle(isDark);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login({ email, password });
      toast.success('Logged in successfully');
      const role = data.user?.role || 'requester';
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'manager') navigate('/manager/dashboard');
      else if (role === 'agent') navigate('/agent/dashboard');
      else navigate('/requester/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

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
              Sign in to access your support portal
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-xs" style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#F87171' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? '#B8D7C0' : '#285136' }}>University Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3" style={{ color: isDark ? '#86A891' : '#587060' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="your.email@uhdms.edu"
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 text-xs transition-all outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold" style={{ color: isDark ? '#B8D7C0' : '#285136' }}>Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-green-700 hover:text-green-600 hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3" style={{ color: isDark ? '#86A891' : '#587060' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl pl-10 pr-10 py-2.5 text-xs transition-all outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-2.5 transition-colors"
                  style={{ color: isDark ? '#86A891' : '#587060' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-700 hover:bg-green-600 disabled:bg-green-700/60 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>



          <p className="mt-5 text-center text-xs" style={{ color: isDark ? '#A7B8AC' : '#587060' }}>
            Don't have an account?{' '}
            <Link to="/register" className="text-green-700 font-semibold hover:text-green-600 hover:underline transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
