import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { GraduationCap, Mail, Lock, User, ArrowRight, Sun, Moon } from 'lucide-react';

const inputStyle = {
  background: 'var(--input-bg)',
  border: '1px solid var(--input-border)',
  color: 'var(--input-text)',
};

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
      navigate('/requester/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setFormData({ ...formData, [key]: e.target.value });

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Background orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none"
        style={{ background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)' }} />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none"
        style={{ background: isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.05)' }} />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className="fixed top-5 right-5 z-50 p-2.5 rounded-xl border transition-all duration-300 shadow-lg"
        style={{
          background: isDark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)',
          borderColor: 'var(--color-border)',
          color: isDark ? '#A5B4FC' : '#4F46E5',
          backdropFilter: 'blur(8px)',
        }}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div
        className="w-full max-w-md rounded-2xl p-8 shadow-2xl relative z-10"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--color-border)' }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 border"
            style={{ background: 'rgba(99,102,241,0.15)', color: '#818CF8', borderColor: 'rgba(99,102,241,0.3)' }}>
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Create Account</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Register for University Help Desk portal</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg text-xs"
            style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#F87171' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3" style={{ color: 'var(--color-text-muted)' }} />
              <input type="text" required value={formData.name} onChange={set('name')}
                placeholder="John Doe"
                className="w-full rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                style={inputStyle} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text)' }}>University Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3" style={{ color: 'var(--color-text-muted)' }} />
              <input type="email" required value={formData.email} onChange={set('email')}
                placeholder="s12345@student.uhdms.edu"
                className="w-full rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                style={inputStyle} />
            </div>
          </div>

          {/* Type + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text)' }}>User Type</label>
              <select value={formData.requesterType} onChange={set('requesterType')}
                className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                style={inputStyle}>
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="staff">Staff</option>
                <option value="external">External User</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Phone (Optional)</label>
              <input type="text" value={formData.phone} onChange={set('phone')}
                placeholder="+1 555 000"
                className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                style={inputStyle} />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3" style={{ color: 'var(--color-text-muted)' }} />
              <input type="password" required minLength={6} value={formData.password} onChange={set('password')}
                placeholder="••••••••"
                className="w-full rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                style={inputStyle} />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Creating Account...' : 'Register'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--color-text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-500 font-semibold hover:text-indigo-400 hover:underline transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
