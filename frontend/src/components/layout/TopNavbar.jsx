import React, { useState } from 'react';
import { Menu, Bell, User, LogOut, CheckCircle2, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import UserAvatar from '../ui/UserAvatar';

export default function TopNavbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const { theme, toggleTheme, isDark } = useTheme();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navigate = useNavigate();

  return (
    <header
      className="h-16 sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 transition-colors duration-300"
      style={{
        background: 'var(--nav-bg)',
        borderBottom: '1px solid var(--nav-border)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Left: Hamburger + Logo + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg md:hidden transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo (visible in top navbar on small screens) */}
        <div className="flex items-center gap-2.5">
          <div
            className="hidden sm:flex items-center justify-center rounded-lg overflow-hidden shrink-0"
            style={{
              width: '38px',
              height: '38px',
              background: isDark ? 'transparent' : '#FFFFFF',
              border: isDark ? '1px solid transparent' : '1px solid var(--color-border)',
              boxShadow: isDark ? 'none' : '0 2px 6px rgba(0,0,0,0.08)',
              padding: '2px',
            }}
          >
            <img
              src={isDark ? '/hormuud-logo-dark.png' : '/hormuud-logo.png'}
              alt="HU Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div className="hidden sm:block">
            <h2 className="text-sm font-bold leading-tight" style={{ color: 'var(--color-text)' }}>
              HU Help Desk Management
            </h2>
            <p className="text-[10px] font-medium" style={{ color: 'var(--color-accent2)' }}>
              Hormuud University
            </p>
          </div>
        </div>
      </div>

      {/* Right: Theme toggle + Bell + User */}
      <div className="flex items-center gap-2">

        {/* ── Theme Toggle ── */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="theme-toggle-btn relative p-2 rounded-xl border transition-all duration-300 group"
          style={{
            background: isDark ? 'rgba(43,125,200,0.12)' : 'rgba(26,86,167,0.08)',
            borderColor: isDark ? 'rgba(43,125,200,0.35)' : 'rgba(26,86,167,0.2)',
            color: isDark ? '#7DD3FC' : '#1A56A7',
          }}
        >
          <span className="relative flex items-center justify-center w-5 h-5">
            <Sun
              className="w-5 h-5 absolute transition-all duration-300"
              style={{
                opacity: isDark ? 1 : 0,
                transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0)',
              }}
            />
            <Moon
              className="w-5 h-5 absolute transition-all duration-300"
              style={{
                opacity: isDark ? 0 : 1,
                transform: isDark ? 'rotate(-90deg) scale(0)' : 'rotate(0deg) scale(1)',
              }}
            />
          </span>
        </button>

        {/* ── Notification Bell ── */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifDropdown(!showNotifDropdown); setShowUserDropdown(false); }}
            className="p-2 rounded-lg relative transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 w-4 h-4 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse"
                style={{ background: '#1A56A7' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div
              className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl shadow-2xl z-50 overflow-hidden border"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div
                className="p-3 flex items-center justify-between border-b"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs flex items-center gap-1"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    <CheckCircle2 className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>No notifications</div>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <div
                      key={n._id}
                      className="p-3 text-xs border-b transition-colors"
                      style={{
                        borderColor: 'var(--color-border)',
                        background: !n.isRead
                          ? (isDark ? 'rgba(26,86,167,0.1)' : 'rgba(224,239,252,0.7)')
                          : 'transparent',
                        borderLeft: !n.isRead ? '2px solid #1A56A7' : 'none',
                      }}
                    >
                      <p className="font-medium" style={{ color: 'var(--color-text)' }}>{n.title}</p>
                      <p className="mt-1" style={{ color: 'var(--color-text-muted)' }}>{n.message}</p>
                      <span className="text-[10px] mt-1 block" style={{ color: 'var(--color-text-muted)' }}>
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── User Dropdown ── */}
        <div className="relative">
          <button
            onClick={() => { setShowUserDropdown(!showUserDropdown); setShowNotifDropdown(false); }}
            className="flex items-center gap-2 p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--color-text-soft)' }}
          >
            <UserAvatar
              avatar={user?.avatar}
              name={user?.name}
              className="w-8 h-8 text-xs"
              style={{ border: '2px solid var(--color-border)' }}
            />
            <span className="text-sm font-medium hidden sm:inline" style={{ color: 'var(--color-text)' }}>
              {user?.name?.split(' ')[0]}
            </span>
          </button>

          {showUserDropdown && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl z-50 py-1 border"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{user?.name}</p>
                <p
                  className="text-[10px] capitalize font-medium"
                  style={{ color: 'var(--color-accent)' }}
                >
                  {user?.role}
                </p>
              </div>
              <Link
                to="/profile"
                onClick={() => setShowUserDropdown(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs transition-colors"
                style={{ color: 'var(--color-text-soft)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <User className="w-4 h-4" /> My Profile
              </Link>
              <button
                onClick={() => { setShowUserDropdown(false); logout(); navigate('/login'); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-500 transition-colors"
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
