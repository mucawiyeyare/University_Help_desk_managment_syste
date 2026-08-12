import React, { useState, useEffect } from 'react';
import {
  getTicketVolumeReportApi,
  getTicketsByStatusApi,
  getTicketsByPriorityApi,
  getAgentPerformanceApi,
  getSatisfactionReportApi,
} from '../../api/reports';
import StatCard from '../../components/ui/StatCard';
import { BarChart3, Star, TrendingUp, CheckCircle2, Users } from 'lucide-react';

export default function ReportsAnalytics() {
  const [statusData, setStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [agentData, setAgentData] = useState([]);
  const [satisfaction, setSatisfaction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, pRes, aRes, satRes] = await Promise.all([
          getTicketsByStatusApi(),
          getTicketsByPriorityApi(),
          getAgentPerformanceApi(),
          getSatisfactionReportApi(),
        ]);
        if (sRes.data.success) setStatusData(sRes.data.data);
        if (pRes.data.success) setPriorityData(pRes.data.data);
        if (aRes.data.success) setAgentData(aRes.data.data);
        if (satRes.data.success) setSatisfaction(satRes.data.data);
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
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" /> Executive Analytics & Management Reports
        </h2>
        <p className="text-xs text-slate-400 mt-1">Operational breakdown, workload distribution, and user satisfaction metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Average Rating" value={satisfaction?.avgRating ? satisfaction.avgRating.toFixed(1) : '5.0'} icon={Star} color="amber" subtitle={`Based on ${satisfaction?.totalFeedback || 0} reviews`} />
        <StatCard title="Total Agents Active" value={agentData.length} icon={Users} color="indigo" />
        <StatCard title="Service Health" value="Optimal" icon={TrendingUp} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <h3 className="font-semibold text-sm text-slate-200 mb-4">Tickets by Status</h3>
          <div className="space-y-3">
            {statusData.map((item) => (
              <div key={item._id} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="capitalize text-slate-300">{item._id.replace('_', ' ')}</span>
                  <span className="text-indigo-400 font-mono">{item.count}</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${Math.min(item.count * 10, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <h3 className="font-semibold text-sm text-slate-200 mb-4">Tickets by Priority</h3>
          <div className="space-y-3">
            {priorityData.map((item) => (
              <div key={item._id} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="capitalize text-slate-300">{item._id}</span>
                  <span className="text-emerald-400 font-mono">{item.count}</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${Math.min(item.count * 15, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
