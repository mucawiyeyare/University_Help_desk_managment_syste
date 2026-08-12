import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Requester Pages
import RequesterDashboard from './pages/requester/Dashboard';
import CreateTicket from './pages/requester/CreateTicket';
import MyTickets from './pages/requester/MyTickets';
import TicketDetail from './pages/requester/TicketDetail';

// Agent Pages
import AgentDashboard from './pages/agent/Dashboard';
import AgentMyTickets from './pages/agent/MyTickets';

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminTickets from './pages/admin/Tickets';
import UserManagement from './pages/admin/Users';
import DepartmentManagement from './pages/admin/Departments';
import CategoryManagement from './pages/admin/Categories';
import SLAPolicies from './pages/admin/SLAPolicies';
import KnowledgeAdmin from './pages/admin/KnowledgeAdmin';
import AdminAnnouncements from './pages/admin/Announcements';
import ReportsAnalytics from './pages/admin/Reports';
import AdminFeedback from './pages/admin/Feedback';
import AdminAuditLogs from './pages/admin/AuditLogs';
import AdminSettings from './pages/admin/Settings';

// Shared Pages
import KnowledgeBase from './pages/KnowledgeBase';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading UHDMS System...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
};

const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'manager') return <Navigate to="/manager/dashboard" replace />;
  if (user.role === 'agent') return <Navigate to="/agent/dashboard" replace />;
  return <Navigate to="/requester/dashboard" replace />;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Root Role Redirect */}
            <Route path="/" element={<RoleBasedRedirect />} />

            {/* Requester Routes */}
            <Route
              path="/requester/dashboard"
              element={
                <ProtectedRoute allowedRoles={['requester']}>
                  <RequesterDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/requester/tickets/new"
              element={
                <ProtectedRoute allowedRoles={['requester', 'agent', 'manager', 'admin']}>
                  <CreateTicket />
                </ProtectedRoute>
              }
            />
            <Route
              path="/requester/tickets"
              element={
                <ProtectedRoute allowedRoles={['requester']}>
                  <MyTickets />
                </ProtectedRoute>
              }
            />

            {/* Agent Routes */}
            <Route
              path="/agent/dashboard"
              element={
                <ProtectedRoute allowedRoles={['agent', 'manager', 'admin']}>
                  <AgentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent/queue"
              element={
                <ProtectedRoute allowedRoles={['agent', 'manager', 'admin']}>
                  <AgentMyTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent/my-tickets"
              element={
                <ProtectedRoute allowedRoles={['agent', 'manager', 'admin']}>
                  <AgentMyTickets />
                </ProtectedRoute>
              }
            />

            {/* Manager Routes */}
            <Route
              path="/manager/dashboard"
              element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/tickets"
              element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <MyTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/unassigned"
              element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <MyTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/agents"
              element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/escalations"
              element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <MyTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/reports"
              element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <ReportsAnalytics />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tickets"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/departments"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DepartmentManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CategoryManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/sla"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SLAPolicies />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/knowledge"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <KnowledgeAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/announcements"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAnnouncements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ReportsAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/feedback"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminFeedback />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAuditLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />

            {/* Shared Protected Routes */}
            <Route
              path="/tickets/:id"
              element={
                <ProtectedRoute allowedRoles={['requester', 'agent', 'manager', 'admin']}>
                  <TicketDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/knowledge"
              element={
                <ProtectedRoute allowedRoles={['requester', 'agent', 'manager', 'admin']}>
                  <KnowledgeBase />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute allowedRoles={['requester', 'agent', 'manager', 'admin']}>
                  <RequesterDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['requester', 'agent', 'manager', 'admin']}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
