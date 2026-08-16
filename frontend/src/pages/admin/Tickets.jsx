import React, { useState, useEffect } from 'react';
import { getTicketsApi, deleteTicketApi, updateTicketApi, assignTicketApi } from '../../api/tickets';
import { getUsersApi } from '../../api/users';
import { getDepartmentsApi } from '../../api/departments';
import Badge from '../../components/ui/Badge';
import TicketSLAStatus, { getTicketAssignmentState, getTicketSLAState } from '../../components/tickets/TicketSLAStatus';
import Pagination from '../../components/ui/Pagination';
import {
  Ticket,
  Search,
  Trash2,
  UserCheck,
  Building2,
  Filter,
  CheckCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ page: 1, limit: 10, search: '', status: '', priority: '', department: '' });
  const [agents, setAgents] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  // Assign Modal state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [assignDept, setAssignDept] = useState('');
  const [assignAgent, setAssignAgent] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await getTicketsApi(filters);
      if (res.data.success) {
        setTickets(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetaData = async () => {
    try {
      const [userRes, deptRes] = await Promise.all([
        getUsersApi({ role: 'agent', limit: 50 }),
        getDepartmentsApi(),
      ]);
      if (userRes.data.success) setAgents(userRes.data.data);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMetaData();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const handleDelete = async (id, number) => {
    if (!window.confirm(`Are you sure you want to permanently delete Ticket #${number}?`)) return;
    try {
      await deleteTicketApi(id);
      fetchTickets();
    } catch (err) {
      alert('Failed to delete ticket: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleQuickStatusChange = async (id, newStatus) => {
    try {
      await updateTicketApi(id, { status: newStatus });
      fetchTickets();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const openAssignModal = (ticket) => {
    setSelectedTicket(ticket);
    setAssignDept(ticket.department?._id || ticket.department || '');
    setAssignAgent(ticket.assignedAgent?._id || ticket.assignedAgent || '');
    setModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setActionLoading(true);
    try {
      await assignTicketApi(selectedTicket._id, {
        department: assignDept || undefined,
        assignedAgent: assignAgent || undefined,
      });
      setModalOpen(false);
      fetchTickets();
    } catch (err) {
      alert('Failed to assign ticket: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Ticket className="w-6 h-6 text-indigo-500" /> Admin Ticket Management (Full CRUD)
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Overview, assign, update, and manage all help desk tickets across the entire university system.
          </p>
        </div>
        <button
          onClick={fetchTickets}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
          style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 shadow-md" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            placeholder="Search #, subject, requester..."
            className="w-full rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="px-3 py-1.5 rounded-lg text-xs outline-none"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="pending_user">Pending User</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
            className="px-3 py-1.5 rounded-lg text-xs outline-none"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value, page: 1 })}
            className="px-3 py-1.5 rounded-lg text-xs outline-none"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="rounded-xl overflow-hidden shadow-xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading all system tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>No tickets found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider font-semibold border-b" style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                  <th className="py-3 px-4">Ticket #</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Requester</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Agent</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr
                    key={t._id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid var(--color-border)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="py-3 px-4 font-mono font-bold" style={{ color: 'var(--color-accent)' }}>
                      <Link to={`/tickets/${t._id}`} className="hover:underline">{t.ticketNumber}</Link>
                    </td>
                    <td className="py-3 px-4 font-semibold max-w-xs truncate" style={{ color: 'var(--color-text)' }}>
                      <Link to={`/tickets/${t._id}`} className="hover:opacity-75">{t.subject}</Link>
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--color-text-muted)' }}>
                      {t.requester?.name || 'Unknown'}
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--color-text-muted)' }}>
                      {t.department?.name || 'General'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge type="priority" value={t.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={t.status}
                        onChange={(e) => handleQuickStatusChange(t._id, e.target.value)}
                        className="text-xs px-2 py-1 rounded border outline-none cursor-pointer font-medium"
                        style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
                      >
                        <option value="new">New</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="pending_user">Pending User</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {t.assignedAgent?.name ? (
                        <span className="font-semibold" style={{ color: '#0F7D4B' }}>{t.assignedAgent.name}</span>
                      ) : (
                        <span className="italic text-amber-500 font-medium">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          to={`/tickets/${t._id}`}
                          title="View Detail"
                          className="p-1.5 rounded-lg transition-colors hover:bg-slate-500/10"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openAssignModal(t)}
                          title="Assign Agent/Dept"
                          className="p-1.5 rounded-lg transition-colors text-amber-500 hover:bg-amber-500/10"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t._id, t.ticketNumber)}
                          title="Delete Ticket"
                          className="p-1.5 rounded-lg transition-colors hover:bg-rose-500/10 text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination pagination={pagination} onPageChange={(p) => setFilters({ ...filters, page: p })} />

      {/* Assign Modal */}
      {modalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl p-6 shadow-2xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                <UserCheck className="w-4 h-4 text-amber-500" /> Assign Ticket #{selectedTicket.ticketNumber}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block mb-1 font-semibold" style={{ color: 'var(--color-text-muted)' }}>Target Department</label>
                <select
                  value={assignDept}
                  onChange={(e) => setAssignDept(e.target.value)}
                  className="w-full p-2 rounded-lg outline-none border"
                  style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold" style={{ color: 'var(--color-text-muted)' }}>Assigned Agent</label>
                <select
                  value={assignAgent}
                  onChange={(e) => setAssignAgent(e.target.value)}
                  className="w-full p-2 rounded-lg outline-none border"
                  style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
                >
                  <option value="">Select Agent</option>
                  {agents.map((a) => (
                    <option key={a._id} value={a._id}>{a.name} ({a.department?.name || 'No Dept'})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border text-xs"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md text-xs"
                >
                  {actionLoading ? 'Saving...' : 'Save Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
