import React, { useState, useEffect } from 'react';
import StatCard from '../../components/ui/StatCard';
import TicketTable from '../../components/tickets/TicketTable';
import { getDashboardStatsApi } from '../../api/reports';
import { getTicketsApi } from '../../api/tickets';
import { Users, Building2, Ticket, CheckCircle2, AlertTriangle, Clock, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ticketsRes] = await Promise.all([
          getDashboardStatsApi(),
          getTicketsApi({ limit: 10 }),
        ]);
        if (statsRes.data.success) setStats(statsRes.data.data);
        if (ticketsRes.data.success) setTickets(ticketsRes.data.data);
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
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <BarChart3 className="w-5 h-5" style={{ color: '#1A56A7' }} />
            System Overview
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Platform-wide metrics, SLA analytics & governance for Hormuud University Help Desk.
          </p>
        </div>
      </div>

      {/* ── Stat Cards Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="Total Users"     value={stats?.totalUsers}                   icon={Users}         color="blue"   />
        <StatCard title="Support Agents"  value={stats?.totalAgents}                  icon={Users}         color="green"  />
        <StatCard title="Departments"     value={stats?.totalDepts}                   icon={Building2}     color="sky"    />
        <StatCard title="Total Tickets"   value={stats?.totalTickets}                 icon={Ticket}        color="blue"   />
        <StatCard title="Open Queue"      value={stats?.openTickets}                  icon={Clock}         color="amber"  />
        <StatCard title="Resolved"        value={stats?.resolved}                     icon={CheckCircle2}  color="green"  />
        <StatCard title="SLA Compliance"  value={`${stats?.slaCompliance ?? 100}%`}   icon={CheckCircle2}  color="teal"   />
        <StatCard title="Overdue SLA"     value={stats?.overdue}                      icon={AlertTriangle} color="rose"   />
      </div>

      {/* ── Recent Tickets ── */}
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Ticket className="w-4 h-4" style={{ color: '#1A56A7' }} />
          Recent Tickets
        </h3>
        <TicketTable tickets={tickets} loading={loading} />
      </div>
    </div>
  );
}
