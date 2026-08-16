import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import { Paperclip, Search, UserCheck, Eye, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateTicketApi, assignTicketApi } from '../../api/tickets';
import { getAgentsApi } from '../../api/users';
import TicketSLAStatus, { getTicketAssignmentState, getTicketSLAState } from './TicketSLAStatus';

export default function TicketTable({ tickets = [], loading, showSearch = true, onRefresh }) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [localTickets, setLocalTickets] = useState(tickets);
  
  // Assign Modal
  const [assignModalTicket, setAssignModalTicket] = useState(null);
  const [deptAgents, setDeptAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [assigning, setAssigning] = useState(false);

  const isStaff = ['agent', 'manager', 'admin'].includes(user?.role);
  const isManagerOrAdmin = ['manager', 'admin'].includes(user?.role);

  useEffect(() => {
    setLocalTickets(tickets);
  }, [tickets]);

  const handleQuickStatusChange = async (ticketId, newStatus) => {
    try {
      const res = await updateTicketApi(ticketId, { status: newStatus });
      const updatedTicket = res.data.data;
      setLocalTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? { ...t, ...updatedTicket } : t))
      );
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to update ticket status');
    }
  };

  const openAssignModal = async (ticket) => {
    setAssignModalTicket(ticket);
    setSelectedAgent(ticket.assignedAgent?._id || ticket.assignedAgent || '');
    try {
      const res = await getAgentsApi();
      if (res.data.success) setDeptAgents(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignModalTicket) return;
    setAssigning(true);
    try {
      await assignTicketApi(assignModalTicket._id, { agentId: selectedAgent });
      setAssignModalTicket(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to assign agent: ' + (err.response?.data?.message || err.message));
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div
        className="rounded-xl p-8 text-center text-sm border"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--color-text-muted)' }}
      >
        Loading tickets...
      </div>
    );
  }

  const filteredTickets = (localTickets || []).filter((t) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      t.ticketNumber?.toLowerCase().includes(q) ||
      t.subject?.toLowerCase().includes(q) ||
      t.category?.name?.toLowerCase().includes(q) ||
      t.department?.name?.toLowerCase().includes(q) ||
      t.priority?.toLowerCase().includes(q) ||
      t.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="rounded-xl overflow-hidden shadow-xl border"
      style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
    >
      {/* Search Header Bar */}
      {showSearch && (
        <div className="p-3 border-b flex items-center justify-between gap-3" style={{ borderColor: 'var(--color-border)' }}>
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tickets by #, subject, category, priority..."
              className="w-full rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none transition-all focus:ring-2 focus:ring-indigo-500/30"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
            />
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full border" style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
            {filteredTickets.length} {filteredTickets.length === 1 ? 'Ticket' : 'Tickets'}
          </span>
        </div>
      )}

      {filteredTickets.length === 0 ? (
        <div className="p-12 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
          No tickets found matching your query.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr
                className="text-[11px] uppercase tracking-wider font-semibold border-b"
                style={{
                  background: 'var(--color-surface2)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-muted)',
                }}
              >
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
              {filteredTickets.map((t) => (
                <tr
                  key={t._id}
                  className="transition-colors"
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="py-3 px-4 font-mono font-bold" style={{ color: 'var(--color-accent)' }}>
                    <Link to={`/tickets/${t._id}`} className="hover:underline">
                      {t.ticketNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-semibold max-w-xs truncate" style={{ color: 'var(--color-text)' }}>
                    <Link to={`/tickets/${t._id}`} className="hover:opacity-75 transition-opacity">
                      {t.subject}
                    </Link>
                    {t.attachments?.length > 0 && (
                      <Paperclip className="inline-block w-3 h-3 ml-1.5" style={{ color: 'var(--color-text-muted)' }} />
                    )}
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
                    {isStaff ? (
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
                    ) : (
                      <Badge type="status" value={t.status} />
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs">
                    {t.assignedAgent?.name ? (
                      <span className="font-semibold" style={{ color: '#0F7D4B' }}>{t.assignedAgent.name}</span>
                    ) : (
                      <span className="text-amber-500 italic font-medium">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        to={`/tickets/${t._id}`}
                        className="p-1.5 rounded-lg transition-colors hover:bg-slate-500/10"
                        style={{ color: 'var(--color-text-muted)' }}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {isManagerOrAdmin && (
                        <button
                          onClick={() => openAssignModal(t)}
                          className="p-1.5 rounded-lg transition-colors text-amber-500 hover:bg-amber-500/10"
                          title="Assign Agent"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Assign Modal */}
      {assignModalTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl p-6 shadow-2xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                <UserCheck className="w-4 h-4 text-amber-500" /> Assign Agent to Ticket #{assignModalTicket.ticketNumber}
              </h3>
              <button onClick={() => setAssignModalTicket(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block mb-1 font-semibold" style={{ color: 'var(--color-text-muted)' }}>Select Agent</label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full p-2.5 rounded-lg outline-none border"
                  style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
                >
                  <option value="">Unassigned</option>
                  {deptAgents.map((a) => (
                    <option key={a._id} value={a._id}>{a.name} ({a.department?.name || 'Department Agent'})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setAssignModalTicket(null)}
                  className="px-3 py-1.5 rounded-lg border text-xs"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md text-xs"
                >
                  {assigning ? 'Assigning...' : 'Save Agent Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
