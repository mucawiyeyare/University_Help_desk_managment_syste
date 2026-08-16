import React, { useState, useEffect } from 'react';
import { getTicketsApi, updateTicketApi } from '../../api/tickets';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/ui/Badge';
import { Link } from 'react-router-dom';
import { Ticket, Search, CheckCircle2, Clock, Eye, RefreshCw } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import TicketSLAStatus, { getTicketSLAState } from '../../components/tickets/TicketSLAStatus';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: '#94A3B8' },
  { value: 'assigned', label: 'Assigned', color: '#818CF8' },
  { value: 'in_progress', label: 'In Progress', color: '#3B82F6' },
  { value: 'pending_user', label: 'Pending User', color: '#F59E0B' },
  { value: 'resolved', label: 'Resolved', color: '#22C55E' },
  { value: 'closed', label: 'Closed', color: '#64748B' },
];

export default function AgentMyTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState({});

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (statusFilter) params.status = statusFilter;
      const res = await getTicketsApi(params);
      if (res.data.success) setTickets(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const handleStatusChange = async (ticketId, newStatus) => {
    setUpdating((prev) => ({ ...prev, [ticketId]: true }));
    try {
      const res = await updateTicketApi(ticketId, { status: newStatus });
      const updatedTicket = res.data.data;
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? { ...t, ...updatedTicket } : t))
      );
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdating((prev) => ({ ...prev, [ticketId]: false }));
    }
  };

  const filtered = tickets.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.ticketNumber?.toLowerCase().includes(q) ||
      t.subject?.toLowerCase().includes(q) ||
      t.requester?.name?.toLowerCase().includes(q) ||
      t.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Ticket className="w-5 h-5 text-indigo-500" /> My Assigned Tickets
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          All tickets directly assigned to you. Update status inline from this view.
        </p>
      </div>

      {/* Filters */}
      <div
        className="rounded-xl p-3 shadow-md border flex flex-col sm:flex-row items-start sm:items-center gap-3"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        <div className="relative flex-1 min-w-0 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticket #, subject, requester..."
            className="w-full rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none transition-all focus:ring-2 focus:ring-indigo-500/30"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border outline-none text-xs"
          style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <button
          onClick={fetchTickets}
          className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-indigo-400"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0" style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
          {filtered.length} Tickets
        </span>
      </div>

      {/* Tickets Table */}
      <div className="rounded-xl overflow-hidden shadow-xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Loading your tickets...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center" style={{ color: 'var(--color-text-muted)' }}>
            <Ticket className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No assigned tickets</p>
            <p className="text-xs mt-1">Tickets assigned to you by a manager will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr
                  className="text-[11px] uppercase tracking-wider font-semibold border-b"
                  style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                >
                  <th className="py-3 px-4">Ticket #</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Requester</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
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
                      <Link to={`/tickets/${t._id}`} className="hover:opacity-75">
                        {t.subject}
                      </Link>
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--color-text-muted)' }}>
                      {t.requester?.name || 'N/A'}
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
                        disabled={updating[t._id]}
                        onChange={(e) => handleStatusChange(t._id, e.target.value)}
                        className="text-xs px-2 py-1 rounded border outline-none cursor-pointer font-medium"
                        style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      {updating[t._id] && (
                        <span className="ml-2 text-[10px] text-indigo-400 animate-pulse">saving...</span>
                      )}
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--color-text-muted)' }}>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/tickets/${t._id}`}
                        className="p-1.5 rounded-lg inline-flex items-center justify-center transition-colors hover:bg-slate-500/10"
                        style={{ color: 'var(--color-text-muted)' }}
                        title="View Full Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
