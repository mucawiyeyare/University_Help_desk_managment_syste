import React, { useEffect, useState } from 'react';
import { Award, CheckCircle2, Clock3, Medal } from 'lucide-react';
import { getAgentSLARankingApi } from '../../api/reports';
import StatCard from '../../components/ui/StatCard';

export default function AgentSLARank() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRank = async () => {
      try {
        const response = await getAgentSLARankingApi();
        if (response.data.success) setReport(response.data.data);
      } catch (error) {
        console.error('Failed to load SLA rank:', error);
      } finally {
        setLoading(false);
      }
    };
    loadRank();
  }, []);

  const rank = report?.myRank;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Award className="w-5 h-5 text-amber-500" /> My SLA Performance Rank
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Your rank is based on tickets you completed within their SLA resolution deadline.
        </p>
      </div>

      {loading ? (
        <div className="rounded-xl border p-10 text-center text-sm" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--color-text-muted)' }}>
          Loading your SLA performance...
        </div>
      ) : !rank ? (
        <div className="rounded-xl border p-10 text-center" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <Medal className="w-10 h-10 mx-auto mb-3 text-slate-400 opacity-50" />
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>No SLA rank yet</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Complete tickets that have an SLA policy to appear in your department ranking.
          </p>
        </div>
      ) : (
        <>
          <section className="rounded-2xl border p-6 text-center shadow-xl" style={{ background: 'linear-gradient(135deg, rgba(217,119,6,0.16), rgba(33,117,181,0.12))', borderColor: 'rgba(217,119,6,0.35)' }}>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-500">Your Department Rank</p>
            <div className="flex items-baseline justify-center gap-2 mt-2">
              <span className="text-5xl font-extrabold" style={{ color: 'var(--color-text)' }}>#{rank.rank}</span>
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>of {report.totalRankedAgents} ranked agents</span>
            </div>
            <p className="text-xs mt-3" style={{ color: 'var(--color-text-muted)' }}>
              Rankings prioritize the number of tickets resolved within SLA, then SLA success rate.
            </p>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Within SLA" value={rank.resolvedWithinSLA} icon={CheckCircle2} color="green" subtitle="Tickets resolved on time" />
            <StatCard title="After Deadline" value={rank.resolvedAfterSLA} icon={Clock3} color="rose" subtitle="Tickets resolved late" />
            <StatCard title="SLA Success" value={`${rank.slaComplianceRate}%`} icon={Award} color="amber" subtitle={`${rank.totalResolved} completed SLA tickets`} />
          </div>
        </>
      )}
    </div>
  );
}
