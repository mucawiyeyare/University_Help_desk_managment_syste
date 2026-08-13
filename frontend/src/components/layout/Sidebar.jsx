import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  PlusCircle,
  Ticket,
  BookOpen,
  Bell,
  Users,
  Building2,
  Layers,
  Clock,
  Megaphone,
  BarChart3,
  MessageSquareHeart,
  ShieldCheck,
  Settings,
  LogOut,
  UserCheck,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const role = user?.role || 'requester';

  const requesterNav = [
    { label: 'Dashboard', path: '/requester/dashboard', icon: LayoutDashboard },
    { label: 'Create Ticket', path: '/requester/tickets/new', icon: PlusCircle },
    { label: 'My Tickets', path: '/requester/tickets', icon: Ticket },
    { label: 'Knowledge Base', path: '/knowledge', icon: BookOpen },
    { label: 'Notifications', path: '/notifications', icon: Bell },
  ];

  const agentNav = [
    { label: 'Dashboard', path: '/agent/dashboard', icon: LayoutDashboard },
    { label: 'My Assigned Tickets', path: '/agent/my-tickets', icon: Ticket },
    { label: 'Knowledge Base', path: '/knowledge', icon: BookOpen },
    { label: 'Notifications', path: '/notifications', icon: Bell },
  ];

  const managerNav = [
    { label: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
    { label: 'Department Tickets', path: '/manager/tickets', icon: Ticket },
    { label: 'Unassigned Queue', path: '/manager/unassigned', icon: FolderOpen },
    { label: 'Agent Workload', path: '/manager/agents', icon: UserCheck },
    { label: 'Escalations', path: '/manager/escalations', icon: AlertTriangle },
    { label: 'Reports', path: '/manager/reports', icon: BarChart3 },
    { label: 'Notifications', path: '/notifications', icon: Bell },
  ];

  const adminNav = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'All Tickets', path: '/admin/tickets', icon: Ticket },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Departments', path: '/admin/departments', icon: Building2 },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'SLA Policies', path: '/admin/sla', icon: Clock },
    { label: 'Knowledge Base', path: '/admin/knowledge', icon: BookOpen },
    { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
    { label: 'Analytics & Reports', path: '/admin/reports', icon: BarChart3 },
    { label: 'User Feedback', path: '/admin/feedback', icon: MessageSquareHeart },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldCheck },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  let navItems = requesterNav;
  if (role === 'agent') navItems = agentNav;
  if (role === 'manager') navItems = managerNav;
  if (role === 'admin') navItems = adminNav;

  const roleLabel = {
    admin: 'Admin Portal',
    manager: 'Manager Portal',
    agent: 'Agent Portal',
    requester: 'Student Portal',
  }[role] || 'Portal';

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 transition-all duration-300 flex flex-col justify-between shadow-sm ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
      style={{
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--nav-border)',
      }}
    >
      <div>
        {/* ── Brand Header with Logo ── */}
        <div
          className="flex items-center gap-3 px-4 py-3.5"
          style={{
            borderBottom: '1px solid var(--nav-border)',
            background: isDark
              ? 'rgba(33,117,181,0.08)'
              : 'linear-gradient(135deg, rgba(242,247,250,1), rgba(230,244,237,0.8))',
          }}
        >
          {/* Hormuud University Exact Logo */}
          <div
            className="shrink-0 rounded-xl overflow-hidden shadow-sm flex items-center justify-center border"
            style={{
              width: '44px',
              height: '44px',
              background: isDark ? 'transparent' : '#FFFFFF',
              borderColor: isDark ? 'transparent' : 'var(--color-border)',
              padding: '2px',
            }}
          >
            <img
              src={isDark ? '/hormuud-logo-dark.png' : '/hormuud-logo.png'}
              alt="Hormuud University Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          {/* Brand Title */}
          <div className="min-w-0">
            <h1
              className="font-extrabold text-sm leading-tight truncate"
              style={{ color: 'var(--color-text)' }}
            >
              HU Help Desk
            </h1>
            <p
              className="text-[10px] font-bold truncate mt-0.5"
              style={{
                color: '#0F7D4B',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {roleLabel}
            </p>
          </div>
        </div>

        {/* ── Navigation List ── */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-150px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all duration-200 ${
                    isActive ? 'active-nav-item' : 'inactive-nav-item'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 transition-all duration-200"
                      style={{
                        background: isActive
                          ? 'rgba(33,117,181,0.15)'
                          : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(33,117,181,0.06)',
                        color: isActive ? '#2175B5' : 'var(--color-text-muted)',
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span
                      className="truncate"
                      style={{
                        color: isActive ? '#2175B5' : 'var(--color-text-muted)',
                        fontWeight: isActive ? '700' : '500',
                      }}
                    >
                      {item.label}
                    </span>
                    {isActive && (
                      <span
                        className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: '#0F7D4B' }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* ── User Profile Footer ── */}
      <div
        className="p-3"
        style={{ borderTop: '1px solid var(--nav-border)' }}
      >
        <div
          className="flex items-center justify-between p-2.5 rounded-xl border transition-all"
          style={{
            background: 'var(--color-surface2)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
              style={{
                background: 'linear-gradient(135deg, #2175B5, #0F7D4B)',
                color: '#FFFFFF',
                boxShadow: '0 2px 6px rgba(33,117,181,0.2)',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p
                className="text-xs font-semibold truncate"
                style={{ color: 'var(--color-text)' }}
              >
                {user?.name || 'User'}
              </p>
              <p
                className="text-[10px] truncate"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 rounded-lg transition-colors text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
