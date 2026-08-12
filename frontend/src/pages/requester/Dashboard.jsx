import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard';
import TicketTable from '../../components/tickets/TicketTable';
import { getDashboardStatsApi } from '../../api/reports';
import { getTicketsApi } from '../../api/tickets';
import { getAnnouncementsApi } from '../../api/announcements';
import { Ticket, PlusCircle, AlertCircle, Clock, CheckCircle2, Megaphone } from 'lucide-react';

export default function RequesterDashboard() {
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ticketsRes, annRes] = await Promise.all([
          getDashboardStatsApi(),
          getTicketsApi({ limit: 5 }),
          getAnnouncementsApi(),
        ]);
        if (statsRes.data.success) setStats(statsRes.data.data);
        if (ticketsRes.data.success) setRecentTickets(ticketsRes.data.data);
        if (annRes.data.success) setAnnouncements(annRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div
        className="rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border"
        style={{
          background: 'linear-gradient(135deg, var(--color-surface2), var(--card-bg))',
          borderColor: 'var(--color-border)',
        }}
      >
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Welcome to University Help Desk</h2>
          <p className="text-xs mt-1 max-w-xl" style={{ color: 'var(--color-text-muted)' }}>
            Submit, track, and manage your academic, IT, financial, and facility support requests in one centralized portal.
          </p>
        </div>
        <Link
          to="/requester/tickets/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Create Ticket
        </Link>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div
          className="rounded-xl p-4 space-y-2 border"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
            <Megaphone className="w-4 h-4" /> System Announcements
          </div>
          {announcements.map((a) => (
            <div
              key={a._id}
              className="p-3 rounded-lg border text-xs"
              style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}
            >
              <h4 className="font-semibold" style={{ color: 'var(--color-text)' }}>{a.title}</h4>
              <p className="mt-1" style={{ color: 'var(--color-text-muted)' }}>{a.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Tickets" value={stats?.totalTickets} icon={Ticket} color="indigo" />
        <StatCard title="New / Open" value={stats?.newTickets} icon={AlertCircle} color="amber" />
        <StatCard title="In Progress" value={stats?.inProgress} icon={Clock} color="blue" />
        <StatCard title="Pending User" value={stats?.pendingUser} icon={AlertCircle} color="purple" />
        <StatCard title="Resolved" value={stats?.resolved} icon={CheckCircle2} color="emerald" />
        <StatCard title="Closed" value={stats?.closed} icon={CheckCircle2} color="indigo" />
      </div>

      {/* Recent Tickets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Recent Support Requests</h3>
          <Link to="/requester/tickets" className="text-xs text-indigo-500 hover:underline">
            View All My Tickets →
          </Link>
        </div>
        <TicketTable tickets={recentTickets} loading={loading} />
      </div>
    </div>
  );
}
