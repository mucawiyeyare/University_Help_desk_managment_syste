import React, { useState, useEffect } from 'react';
import TicketTable from '../../components/tickets/TicketTable';
import TicketFilters from '../../components/tickets/TicketFilters';
import Pagination from '../../components/ui/Pagination';
import { getTicketsApi } from '../../api/tickets';
import { Ticket, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ page: 1, limit: 10 });

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

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Ticket className="w-5 h-5 text-indigo-500" /> My Support Requests
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Track status and conversation history for all your submitted tickets.
          </p>
        </div>
        <Link
          to="/requester/tickets/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" /> Create New Ticket
        </Link>
      </div>

      <TicketFilters filters={filters} setFilters={setFilters} />
      <TicketTable tickets={tickets} loading={loading} />
      <Pagination pagination={pagination} onPageChange={(page) => setFilters({ ...filters, page })} />
    </div>
  );
}
