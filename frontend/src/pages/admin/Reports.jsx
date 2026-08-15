import React, { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  getAgentPerformanceApi,
  getResolvedSLAReportApi,
  getAgentSLARankingApi,
  getSatisfactionReportApi,
  getStudentComplaintDepartmentsApi,
  getTicketTimeSummaryApi,
  getTicketVolumeReportApi,
  getTicketsByPriorityApi,
  getTicketsByStatusApi,
} from '../../api/reports';
import StatCard from '../../components/ui/StatCard';
import UserAvatar from '../../components/ui/UserAvatar';
import { AlertTriangle, Award, BarChart3, CheckCircle2, Star, Ticket, Users } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const STATUS_COLORS = ['#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#64748B', '#EF4444'];
const PRIORITY_COLORS = { critical: '#EF4444', high: '#F97316', medium: '#3B82F6', low: '#10B981' };

const displayStatus = (value) => String(value || 'unknown').replace(/_/g, ' ');

export default function ReportsAnalytics() {
  const { isDark } = useTheme();
  const [volumeData, setVolumeData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [agentData, setAgentData] = useState([]);
  const [satisfaction, setSatisfaction] = useState(null);
  const [timeSummary, setTimeSummary] = useState(null);
  const [resolvedSLA, setResolvedSLA] = useState(null);
  const [agentSLARanking, setAgentSLARanking] = useState(null);
  const [studentComplaintReport, setStudentComplaintReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [volumeRes, statusRes, priorityRes, agentRes, satisfactionRes, timeRes, resolvedSLARes, rankingRes, complaintRes] = await Promise.all([
          getTicketVolumeReportApi({ days: 30 }),
          getTicketsByStatusApi(),
          getTicketsByPriorityApi(),
          getAgentPerformanceApi(),
          getSatisfactionReportApi(),
          getTicketTimeSummaryApi(),
          getResolvedSLAReportApi(),
          getAgentSLARankingApi(),
          getStudentComplaintDepartmentsApi(),
        ]);
        if (volumeRes.data.success) setVolumeData(volumeRes.data.data);
        if (statusRes.data.success) setStatusData(statusRes.data.data);
        if (priorityRes.data.success) setPriorityData(priorityRes.data.data);
        if (agentRes.data.success) setAgentData(agentRes.data.data);
        if (satisfactionRes.data.success) setSatisfaction(satisfactionRes.data.data);
        if (timeRes.data.success) setTimeSummary(timeRes.data.data);
        if (resolvedSLARes.data.success) setResolvedSLA(resolvedSLARes.data.data);
        if (rankingRes.data.success) setAgentSLARanking(rankingRes.data.data);
        if (complaintRes.data.success) setStudentComplaintReport(complaintRes.data.data);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const volumeChartData = useMemo(() => volumeData.map((item) => ({
    date: new Date(`${item._id}T00:00:00`).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    tickets: item.count,
  })), [volumeData]);

  const statusChartData = useMemo(() => statusData.map((item) => ({
    name: displayStatus(item._id),
    value: item.count,
  })), [statusData]);

  const priorityChartData = useMemo(() => priorityData.map((item) => ({
    name: displayStatus(item._id),
    tickets: item.count,
    fill: PRIORITY_COLORS[item._id] || '#64748B',
  })), [priorityData]);

  const resolvedSLAChartData = useMemo(() => (resolvedSLA?.byPriority || []).map((item) => ({
    priority: displayStatus(item._id),
    withinSLA: item.resolvedWithinSLA,
    afterDeadline: item.resolvedAfterDeadline,
  })), [resolvedSLA]);

  const studentComplaintChartData = useMemo(() => (studentComplaintReport?.departments || []).map((department) => ({
    name: department.name,
    complaints: department.complaintCount,
  })), [studentComplaintReport]);

  const chartText = isDark ? '#CBD5E1' : '#475569';
  const gridColor = isDark ? '#263449' : '#E2E8F0';
  const cardStyle = { background: 'var(--card-bg)', borderColor: 'var(--card-border)' };
  const tooltipStyle = {
    background: isDark ? '#0B1220' : '#FFFFFF',
    border: `1px solid ${isDark ? '#334155' : '#CBD5E1'}`,
    borderRadius: '8px',
    color: isDark ? '#E2E8F0' : '#0F172A',
    fontSize: '12px',
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <BarChart3 className="w-5 h-5 text-indigo-500" /> Ticket Analysis & Reports
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Track ticket volume, SLA workload, resolution performance, and satisfaction across the help desk.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard title="Unresolved Tickets" value={timeSummary?.totalUnresolved ?? 0} icon={Ticket} color="rose" subtitle="Currently open or pending" />
        <StatCard title="Resolved Tickets" value={timeSummary?.totalResolved ?? 0} icon={CheckCircle2} color="green" subtitle="Resolved, closed, or cancelled" />
        <StatCard title="Resolved After SLA" value={resolvedSLA?.resolvedAfterDeadline ?? 0} icon={AlertTriangle} color="rose" subtitle={`${resolvedSLA?.lateResolutionRate ?? 0}% of resolved tickets with an SLA`} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <StatCard title="Average Rating" value={satisfaction?.avgRating ? satisfaction.avgRating.toFixed(1) : '—'} icon={Star} color="amber" subtitle={`${satisfaction?.totalFeedback || 0} reviews`} />
        <StatCard title="Active Agents" value={agentData.length} icon={Users} color="blue" subtitle="Agents with assigned-ticket activity" />
        <StatCard title="Tickets in 30 Days" value={volumeData.reduce((total, item) => total + item.count, 0)} icon={BarChart3} color="teal" subtitle="New tickets created" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="rounded-xl p-5 shadow-xl border" style={cardStyle}>
          <div className="mb-4">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Ticket Volume Trend</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Tickets created over the last 30 days</p>
          </div>
          <div className="h-72">
            {loading ? <ChartLoading /> : volumeChartData.length === 0 ? <ChartEmpty /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeChartData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ticketVolumeFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: chartText, fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: chartText, fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="tickets" name="Tickets" stroke="#3B82F6" strokeWidth={2.5} fill="url(#ticketVolumeFill)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="rounded-xl p-5 shadow-xl border" style={cardStyle}>
          <div className="mb-4">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Tickets by Status</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Current distribution of ticket lifecycle states</p>
          </div>
          <div className="h-72">
            {loading ? <ChartLoading /> : statusChartData.length === 0 ? <ChartEmpty /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="47%" outerRadius={88} innerRadius={48} paddingAngle={3}>
                    {statusChartData.map((item, index) => <Cell key={item.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ color: chartText, fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section
          className="rounded-xl p-5 shadow-xl border"
          style={{
            background: isDark ? 'rgba(127, 29, 29, 0.24)' : 'rgba(254, 242, 242, 0.94)',
            borderColor: isDark ? 'rgba(248, 113, 113, 0.45)' : 'rgba(220, 38, 38, 0.3)',
          }}
        >
          <div className="mb-4">
            <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: isDark ? '#FECACA' : '#991B1B' }}>
              <AlertTriangle className="w-4 h-4" /> Resolved After SLA Deadline
            </h3>
            <p className="text-xs mt-1" style={{ color: isDark ? '#FCA5A5' : '#B91C1C' }}>
              Red bars show tickets completed after their resolution deadline. Green bars were completed within SLA.
            </p>
          </div>
          <div className="h-72">
            {loading ? <ChartLoading /> : resolvedSLAChartData.length === 0 ? <ChartEmpty message="No resolved tickets with an SLA are available yet." /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resolvedSLAChartData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke={isDark ? 'rgba(254, 202, 202, 0.2)' : 'rgba(153, 27, 27, 0.16)'} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="priority" tick={{ fill: isDark ? '#FECACA' : '#7F1D1D', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: isDark ? '#FECACA' : '#7F1D1D', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ ...tooltipStyle, background: isDark ? '#450A0A' : '#FFF7F7', border: '1px solid rgba(220,38,38,0.45)' }} />
                  <Legend wrapperStyle={{ color: isDark ? '#FECACA' : '#7F1D1D', fontSize: '11px' }} />
                  <Bar dataKey="withinSLA" name="Within SLA" fill="#22C55E" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="afterDeadline" name="After deadline" fill="#EF4444" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="rounded-xl p-5 shadow-xl border xl:col-span-2" style={cardStyle}>
          <div className="mb-4">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Tickets by Priority</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Current workload grouped by priority level</p>
          </div>
          <div className="h-72">
            {loading ? <ChartLoading /> : priorityChartData.length === 0 ? <ChartEmpty /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityChartData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: chartText, fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: chartText, fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: isDark ? 'rgba(148,163,184,0.08)' : 'rgba(15,23,42,0.04)' }} />
                  <Bar dataKey="tickets" name="Tickets" radius={[6, 6, 0, 0]}>
                    {priorityChartData.map((item) => <Cell key={item.name} fill={item.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="rounded-xl p-5 shadow-xl border" style={cardStyle}>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                <Award className="w-4 h-4 text-amber-500" /> Agent SLA Ranking
              </h3>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Ranked by tickets resolved within the SLA deadline ({agentSLARanking?.scope || 'your scope'}).
              </p>
            </div>
            <span className="shrink-0 text-[11px] font-bold px-2 py-1 rounded-full border" style={{ color: '#2175B5', background: 'rgba(33,117,181,0.1)', borderColor: 'rgba(33,117,181,0.24)' }}>
              {agentSLARanking?.totalRankedAgents || 0} agents
            </span>
          </div>
          <div className="space-y-2.5">
            {loading ? <ChartLoading /> : (agentSLARanking?.agents || []).length === 0 ? <ChartEmpty message="No completed SLA-tracked tickets are available yet." /> : (
              agentSLARanking.agents.map((agent) => (
                <div key={agent.agentId} className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-extrabold text-white" style={{ background: agent.rank === 1 ? '#D97706' : '#2175B5' }}>
                    #{agent.rank}
                  </span>
                  <UserAvatar avatar={agent.avatar} name={agent.name} className="w-9 h-9 text-sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate" style={{ color: 'var(--color-text)' }}>{agent.name}</p>
                    <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                      {agent.resolvedWithinSLA} within SLA · {agent.totalResolved} resolved
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-extrabold text-emerald-500">{agent.slaComplianceRate}%</p>
                    <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>SLA success</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl p-5 shadow-xl border" style={cardStyle}>
          <div className="mb-4">
            <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <AlertTriangle className="w-4 h-4 text-rose-500" /> Student Complaints by Department
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Highest and lowest departments by tickets submitted as student complaints.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-lg border p-3" style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.24)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wide text-rose-500">Highest</p>
              <p className="text-xs font-bold mt-1 truncate" style={{ color: 'var(--color-text)' }}>{studentComplaintReport?.highest?.name || '—'}</p>
              <p className="text-lg font-extrabold text-rose-500">{studentComplaintReport?.highest?.complaintCount ?? 0}</p>
            </div>
            <div className="rounded-lg border p-3" style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.24)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-500">Lowest</p>
              <p className="text-xs font-bold mt-1 truncate" style={{ color: 'var(--color-text)' }}>{studentComplaintReport?.lowest?.name || '—'}</p>
              <p className="text-lg font-extrabold text-emerald-500">{studentComplaintReport?.lowest?.complaintCount ?? 0}</p>
            </div>
          </div>
          <div className="h-52">
            {loading ? <ChartLoading /> : studentComplaintChartData.length === 0 ? <ChartEmpty message="No department complaint data is available yet." /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentComplaintChartData} layout="vertical" margin={{ top: 4, right: 12, left: 32, bottom: 0 }}>
                  <CartesianGrid stroke={gridColor} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fill: chartText, fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" width={105} tick={{ fill: chartText, fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="complaints" name="Student complaints" radius={[0, 5, 5, 0]}>
                    {studentComplaintChartData.map((department, index) => (
                      <Cell
                        key={department.name}
                        fill={index === 0 ? '#EF4444' : department.complaints === studentComplaintReport?.lowest?.complaintCount ? '#22C55E' : '#F59E0B'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ChartLoading() {
  return <div className="h-full flex items-center justify-center text-xs" style={{ color: 'var(--color-text-muted)' }}>Loading chart data…</div>;
}

function ChartEmpty({ message = 'No ticket data is available yet.' }) {
  return <div className="h-full flex items-center justify-center text-xs" style={{ color: 'var(--color-text-muted)' }}>{message}</div>;
}
