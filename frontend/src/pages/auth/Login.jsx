import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, KeyRound, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      const msg = err.response?.data?.message || 'Invalid email or password';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300"
      style={{ background: isDark ? '#071628' : '#F0F7FF' }}
    >
      {/* Background gradient blobs */}
      <div
        className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full blur-[130px] pointer-events-none"
        style={{ background: isDark ? 'rgba(26,86,167,0.15)' : 'rgba(26,86,167,0.08)' }}
      />
      <div
        className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] rounded-full blur-[130px] pointer-events-none"
        style={{ background: isDark ? 'rgba(26,122,74,0.15)' : 'rgba(26,122,74,0.08)' }}
      />

      {/* Decorative top banner stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: 'linear-gradient(90deg, #1A56A7, #1A7A4A, #1A56A7)' }}
      />

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className="fixed top-5 right-5 z-50 p-2.5 rounded-xl border transition-all duration-300 shadow-lg"
        style={{
          background: isDark ? 'rgba(13,33,51,0.9)' : 'rgba(255,255,255,0.9)',
          borderColor: isDark ? 'rgba(43,125,200,0.4)' : 'rgba(26,86,167,0.2)',
          color: isDark ? '#7DD3FC' : '#1A56A7',
          backdropFilter: 'blur(8px)',
        }}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Login Card */}
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden"
        style={{
          background: isDark ? '#0D2133' : '#FFFFFF',
          border: `1px solid ${isDark ? 'rgba(43,125,200,0.25)' : '#D4E8F8'}`,
        }}
      >
        {/* Card top accent bar */}
        <div
          className="h-1.5 w-full"
          style={{ background: 'linear-gradient(90deg, #1A56A7 0%, #1A7A4A 50%, #1A56A7 100%)' }}
        />

        <div className="p-8">
          {/* Logo & Title */}
          <div className="flex flex-col items-center mb-7 text-center">
            {/* University Logo */}
            <div
              className="mb-4 rounded-2xl overflow-hidden flex items-center justify-center"
              style={{
                width: '100px',
                height: '115px',
                background: isDark ? 'transparent' : '#FFFFFF',
                padding: '6px',
                border: '1.5px solid rgba(15,125,75,0.25)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              }}
            >
              <img
                src={isDark ? '/hormuud-logo-dark.png' : '/hormuud-logo.png'}
                alt="Hormuud University Official Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            <h1
              className="text-2xl font-extrabold tracking-tight"
              style={{ color: isDark ? '#FFFFFF' : '#0D2844' }}
            >
              Hormuud University
            </h1>
            <p
              className="text-sm font-semibold mt-0.5"
              style={{ color: '#1A56A7' }}
            >
              Help Desk Management System
            </p>
            <p
              className="text-xs mt-1.5 px-4"
              style={{ color: isDark ? 'rgba(232,244,255,0.55)' : '#4A6580' }}
            >
              Sign in to access your support portal
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-4 p-3 rounded-xl text-xs flex items-center gap-2"
              style={{
                background: 'rgba(220,38,38,0.1)',
                border: '1px solid rgba(220,38,38,0.3)',
                color: '#DC2626',
              }}
            >
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                className="block text-xs font-semibold mb-1.5"
                style={{ color: isDark ? '#A8CCDF' : '#2C4A6B' }}
              >
                University Email
              </label>
              <div className="relative">
                <Mail
                  className="w-4 h-4 absolute left-3.5 top-3"
                  style={{ color: isDark ? '#7AABCC' : '#4A6580' }}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@uhdms.edu"
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 text-xs transition-all outline-none"
                  style={{
                    background: isDark ? 'rgba(13,33,51,0.85)' : 'rgba(240,247,255,0.9)',
                    border: `1px solid ${isDark ? '#1A3A55' : '#BFD9F0'}`,
                    color: isDark ? '#E8F4FF' : '#0D2844',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#1A56A7';
                    e.target.style.boxShadow = '0 0 0 3px rgba(26,86,167,0.12)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = isDark ? '#1A3A55' : '#BFD9F0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  className="block text-xs font-semibold"
                  style={{ color: isDark ? '#A8CCDF' : '#2C4A6B' }}
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium transition-colors"
                  style={{ color: '#1A56A7' }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  className="w-4 h-4 absolute left-3.5 top-3"
                  style={{ color: isDark ? '#7AABCC' : '#4A6580' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl pl-10 pr-10 py-2.5 text-xs transition-all outline-none"
                  style={{
                    background: isDark ? 'rgba(13,33,51,0.85)' : 'rgba(240,247,255,0.9)',
                    border: `1px solid ${isDark ? '#1A3A55' : '#BFD9F0'}`,
                    color: isDark ? '#E8F4FF' : '#0D2844',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#1A56A7';
                    e.target.style.boxShadow = '0 0 0 3px rgba(26,86,167,0.12)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = isDark ? '#1A3A55' : '#BFD9F0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 transition-colors"
                  style={{ color: isDark ? '#7AABCC' : '#4A6580' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white rounded-xl font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading
                  ? 'rgba(26,86,167,0.6)'
                  : 'linear-gradient(135deg, #1A56A7 0%, #1A7A4A 100%)',
                boxShadow: '0 4px 20px rgba(26,86,167,0.3)',
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div
            className="mt-5 p-3 rounded-xl text-[11px]"
            style={{
              background: isDark ? 'rgba(26,86,167,0.08)' : 'rgba(240,247,255,0.9)',
              border: `1px solid ${isDark ? 'rgba(43,125,200,0.2)' : '#BFD9F0'}`,
            }}
          >
            <p
              className="font-semibold mb-1.5 flex items-center gap-1"
              style={{ color: isDark ? '#E8F4FF' : '#0D2844' }}
            >
              <KeyRound className="w-3.5 h-3.5" style={{ color: '#1A56A7' }} /> Quick Demo Credentials:
            </p>
            <div className="space-y-1" style={{ color: isDark ? '#7AABCC' : '#4A6580' }}>
              {[
                { label: 'Admin:', email: 'admin@uhdms.edu', pwd: 'Admin@123456' },
                { label: 'Manager:', email: 'manager.it@uhdms.edu', pwd: 'Password@123' },
                { label: 'Agent:', email: 'agent.it@uhdms.edu', pwd: 'Password@123' },
                { label: 'Student:', email: 'student@uhdms.edu', pwd: 'Password@123' },
              ].map(({ label, email: e, pwd }) => (
                <div key={label} className="flex justify-between items-center">
                  <span>{label}</span>
                  <button
                    type="button"
                    onClick={() => { setEmail(e); setPassword(pwd); }}
                    className="font-medium transition-colors hover:underline"
                    style={{ color: '#1A56A7' }}
                  >
                    {e}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-5 text-center text-xs" style={{ color: isDark ? '#7AABCC' : '#4A6580' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold transition-colors"
              style={{ color: '#1A56A7' }}
            >
              Register here
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <p
        className="absolute bottom-4 text-[10px]"
        style={{ color: isDark ? 'rgba(122,171,204,0.5)' : 'rgba(74,101,128,0.6)' }}
      >
        © 2025 Hormuud University — Help Desk Management System
      </p>
    </div>
  );
}
