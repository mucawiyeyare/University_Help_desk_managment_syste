import React, { useState, useEffect } from 'react';
import { getAuditLogsApi } from '../../api/audit';
import { ShieldCheck, Search, Calendar, User, Activity, FileText } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionSearch, setActionSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getAuditLogsApi({
        page,
        action: actionSearch || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      if (res.data.success) {
        setLogs(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [actionSearch, dateFrom, dateTo]);

  const getActionBadge = (action) => {
    const act = (action || '').toUpperCase();
    if (act.includes('DELETE') || act.includes('REMOVE')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">{act}</span>;
    }
    if (act.includes('CREATE') || act.includes('ADD')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">{act}</span>;
    }
    if (act.includes('UPDATE') || act.includes('ASSIGN')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">{act}</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">{act}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <ShieldCheck className="w-6 h-6 text-emerald-500" /> Security & System Audit Logs
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Immutable security event timeline tracking user authentication, settings modifications, and ticket updates.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 shadow-md" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={actionSearch}
            onChange={(e) => setActionSearch(e.target.value)}
            placeholder="Search action or event type..."
            className="w-full rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-1.5 rounded-lg border outline-none"
            style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
          />
          <span style={{ color: 'var(--color-text-muted)' }}>to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-1.5 rounded-lg border outline-none"
            style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-xl overflow-hidden shadow-xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading security logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>No audit logs recorded matching your search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider font-semibold border-b" style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">User / Actor</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Target Entity</th>
                  <th className="py-3.5 px-4">Details</th>
                  <th className="py-3.5 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b transition-colors hover:bg-indigo-500/5" style={{ borderColor: 'var(--color-border)' }}>
                    <td className="py-3.5 px-4 text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-medium" style={{ color: 'var(--color-text)' }}>
                      {log.actor?.name || 'System / Guest'}
                      {log.actor?.email && <span className="block text-[10px] text-slate-400">{log.actor.email}</span>}
                    </td>
                    <td className="py-3.5 px-4">{getActionBadge(log.action)}</td>
                    <td className="py-3.5 px-4 font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {log.targetEntity || log.entity || 'System'}
                    </td>
                    <td className="py-3.5 px-4 text-xs max-w-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                      {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details || log.description || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination pagination={pagination} onPageChange={(p) => fetchLogs(p)} />
    </div>
  );
}
