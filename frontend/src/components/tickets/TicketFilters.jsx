import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

export default function TicketFilters({ filters, setFilters, categories = [], departments = [] }) {
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const handleReset = () => {
    setFilters({ status: '', priority: '', category: '', department: '', search: '', page: 1 });
  };

  return (
    <div
      className="rounded-xl p-4 mb-6 shadow-md transition-colors duration-300"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-3" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            name="search"
            value={filters.search || ''}
            onChange={handleChange}
            placeholder="Search ticket # or subject..."
            className="w-full rounded-lg pl-9 pr-3 py-2 text-xs outline-none transition-all focus:ring-2 focus:ring-indigo-500/30"
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--input-border)',
              color: 'var(--input-text)',
            }}
          />
        </div>

        {/* Status */}
        <div>
          <select
            name="status"
            value={filters.status || ''}
            onChange={handleChange}
            className="w-full rounded-lg px-3 py-2 text-xs outline-none transition-all focus:ring-2 focus:ring-indigo-500/30"
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--input-border)',
              color: 'var(--input-text)',
            }}
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="pending_user">Pending User</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <select
            name="priority"
            value={filters.priority || ''}
            onChange={handleChange}
            className="w-full rounded-lg px-3 py-2 text-xs outline-none transition-all focus:ring-2 focus:ring-indigo-500/30"
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--input-border)',
              color: 'var(--input-text)',
            }}
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Reset */}
        <div className="flex items-center">
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors border"
            style={{
              background: 'var(--color-surface2)',
              color: 'var(--color-text)',
              borderColor: 'var(--color-border)',
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
