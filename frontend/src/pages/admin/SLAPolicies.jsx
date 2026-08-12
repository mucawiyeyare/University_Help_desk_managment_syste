import React, { useState, useEffect } from 'react';
import { getSLAPoliciesApi } from '../../api/sla';
import Badge from '../../components/ui/Badge';
import { Clock, CheckCircle2, Search } from 'lucide-react';

export default function SLAPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPolicies = async () => {
    try {
      const res = await getSLAPoliciesApi();
      if (res.data.success) setPolicies(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const filteredPolicies = policies.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.priority?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Clock className="w-5 h-5 text-indigo-500" /> Service-Level Agreements (SLA) Policies
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Configure target response times and resolution deadlines per ticket priority level.
        </p>
      </div>

      {/* Table Container */}
      <div
        className="rounded-xl overflow-hidden shadow-xl border"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        {/* Search Bar */}
        <div className="p-3 border-b flex items-center justify-between gap-3" style={{ borderColor: 'var(--color-border)' }}>
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search SLA policies by name or priority level..."
              className="w-full rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none transition-all focus:ring-2 focus:ring-indigo-500/30"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
            />
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full border" style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
            {filteredPolicies.length} {filteredPolicies.length === 1 ? 'Policy' : 'Policies'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr
                className="text-[11px] uppercase tracking-wider font-semibold border-b"
                style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                <th className="py-3.5 px-4">Policy Name</th>
                <th className="py-3.5 px-4">Priority Level</th>
                <th className="py-3.5 px-4">First Response Target</th>
                <th className="py-3.5 px-4">Resolution Target</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    No SLA policies found matching your search.
                  </td>
                </tr>
              ) : (
                filteredPolicies.map((p) => (
                  <tr
                    key={p._id}
                    className="transition-colors border-b"
                    style={{ borderColor: 'var(--color-border)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="py-3.5 px-4 font-semibold" style={{ color: 'var(--color-text)' }}>{p.name}</td>
                    <td className="py-3.5 px-4">
                      <Badge type="priority" value={p.priority} />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-500">
                      {p.responseTime < 60 ? `${p.responseTime} mins` : `${p.responseTime / 60} hours`}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-500">
                      {p.resolutionTime < 60 ? `${p.resolutionTime} mins` : `${p.resolutionTime / 60} hours`}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-500 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active Policy
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
