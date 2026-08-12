import React, { useState, useEffect } from 'react';
import StatCard from '../../components/ui/StatCard';
import TicketTable from '../../components/tickets/TicketTable';
import { getDashboardStatsApi, getAgentPerformanceApi } from '../../api/reports';
import { getTicketsApi } from '../../api/tickets';
import { getAgentsApi } from '../../api/users';
import { Building2, Ticket, Users, AlertTriangle, CheckCircle2, Clock, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [agentSearch, setAgentSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, ticketsRes, agentsRes] = await Promise.all([
        getDashboardStatsApi(),
        getTicketsApi({ limit: 20 }),
        // getAgents scoped to manager's department by backend
        getAgentsApi(),
      ]);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (ticketsRes.data.success) setTickets(ticketsRes.data.data);
      if (agentsRes.data.success) setAgents(agentsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAgents = agents.filter((a) => {
    if (!agentSearch.trim()) return true;
    const q = agentSearch.toLowerCase();
    return a.name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Building2 className="w-5 h-5" style={{ color: '#1A56A7' }} /> Department Overview
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Monitor department ticket queue, agent workload, and SLA performance. Assign tickets to your department agents.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Dept Tickets" value={stats?.totalTickets} icon={Ticket} color="blue" />
        <StatCard title="Open Queue" value={stats?.openTickets} icon={Clock} color="amber" />
        <StatCard title="In Progress" value={stats?.inProgress} icon={Clock} color="sky" />
        <StatCard title="SLA Compliance" value={`${stats?.slaCompliance || 100}%`} icon={CheckCircle2} color="teal" />
        <StatCard title="Overdue SLA" value={stats?.overdue} icon={AlertTriangle} color="rose" />
        <StatCard title="Resolved Today" value={stats?.resolvedToday} icon={CheckCircle2} color="green" />
      </div>

      {/* Agent Workload Table - scoped to department */}
      <div
        className="rounded-xl shadow-xl border overflow-hidden"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        <div className="p-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <Users className="w-4 h-4" style={{ color: '#1A56A7' }} /> Department Agent Roster
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Only agents assigned to your department are listed.
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              value={agentSearch}
              onChange={(e) => setAgentSearch(e.target.value)}
              placeholder="Search agent by name or email..."
              className="w-full rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none transition-all"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead>
              <tr
                className="text-[11px] uppercase font-semibold border-b"
                style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                <th className="py-2.5 px-3">Agent Name</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {agentSearch ? 'No agents found matching search.' : 'No agents in your department yet. Ask admin to assign agents.'}
                  </td>
                </tr>
              ) : (
                filteredAgents.map((a) => (
                  <tr
                    key={a._id}
                    className="transition-colors border-b"
                    style={{ borderColor: 'var(--color-border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="py-2.5 px-3 font-semibold" style={{ color: 'var(--color-text)' }}>{a.name}</td>
                    <td className="py-2.5 px-3" style={{ color: 'var(--color-text-muted)' }}>{a.email}</td>
                    <td className="py-2.5 px-3" style={{ color: 'var(--color-text-muted)' }}>
                      {a.department?.name || 'Unassigned'}
                    </td>
                    <td className="py-2.5 px-3">
                       <span className="px-2 py-0.5 rounded text-[11px] font-semibold capitalize" style={{ background: 'rgba(26,86,167,0.1)', color: '#1A56A7' }}>
                        {a.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                       <span className="px-2 py-0.5 rounded text-[11px] font-semibold" style={{ background: 'rgba(26,122,74,0.1)', color: '#1A7A4A' }}>
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Ticket Queue - with assign capability */}
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Ticket className="w-4 h-4" style={{ color: '#1A56A7' }} /> Department Ticket Queue
        </h3>
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Assign tickets to your department agents using the <span className="text-amber-400 font-semibold">🔗 Assign</span> button in each row.
        </p>
        <TicketTable tickets={tickets} loading={loading} onRefresh={fetchData} />
      </div>
    </div>
  );
}
