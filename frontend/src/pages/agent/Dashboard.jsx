import React, { useState, useEffect } from 'react';
import StatCard from '../../components/ui/StatCard';
import TicketTable from '../../components/tickets/TicketTable';
import { getDashboardStatsApi } from '../../api/reports';
import { getTicketsApi } from '../../api/tickets';
import { Ticket, Clock, CheckCircle2, AlertTriangle, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AgentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [assignedTickets, setAssignedTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, assignedRes] = await Promise.all([
          getDashboardStatsApi(),
          getTicketsApi({ assignedAgent: user?._id, limit: 20 }),
        ]);
        if (statsRes.data.success) setStats(statsRes.data.data);
        if (assignedRes.data.success) setAssignedTickets(assignedRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <UserCheck className="w-5 h-5" style={{ color: '#1A56A7' }} /> Support Agent Workspace
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Manage your assigned tickets, update status, and reply to requester inquiries.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Assigned to Me" value={assignedTickets.length} icon={Ticket} color="blue" />
        <StatCard title="In Progress" value={stats?.inProgress} icon={Clock} color="sky" />
        <StatCard title="Pending User" value={stats?.pendingUser} icon={AlertTriangle} color="amber" />
        <StatCard title="Overdue SLA" value={stats?.overdue} icon={AlertTriangle} color="rose" />
        <StatCard title="Resolved Today" value={stats?.resolvedToday} icon={CheckCircle2} color="green" />
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}><Ticket className="w-4 h-4" style={{ color: '#1A56A7' }} /> My Assigned Tickets</h3>
          <TicketTable tickets={assignedTickets} loading={loading} />
        </div>
      </div>
    </div>
  );
}
