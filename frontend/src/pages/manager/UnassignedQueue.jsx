import React, { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, UserX } from 'lucide-react';
import { getTicketsApi } from '../../api/tickets';
import TicketTable from '../../components/tickets/TicketTable';
import Pagination from '../../components/ui/Pagination';

export default function UnassignedQueue() {
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await getTicketsApi({ page, limit: 10, unassigned: 'true' });
      if (response.data.success) {
        setTickets(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to load unassigned tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <UserX className="w-5 h-5 text-rose-400" /> Unassigned Ticket Queue
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Only new tickets without an assigned agent appear here. Red labels identify tickets requiring assignment.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchTickets}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold"
          style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="rounded-xl border p-3 flex items-center gap-2 text-xs" style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)', color: '#F87171' }}>
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span><strong>Unassigned</strong> is an assignment state, not an SLA breach. Assign an agent from the ticket actions.</span>
      </div>

      <TicketTable tickets={tickets} loading={loading} onRefresh={fetchTickets} />
      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
}
