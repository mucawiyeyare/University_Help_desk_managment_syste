import React from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export default function SLAIndicator({ ticket }) {
  if (!ticket || !ticket.slaDueResolution) return null;

  const now = new Date();
  const due = new Date(ticket.slaDueResolution);
  const diffMs = due - now;

  const isResolved = ['resolved', 'closed'].includes(ticket.status);
  if (isResolved) {
    return (
      <div
        className="rounded-lg p-3 text-xs flex items-center gap-2 border"
        style={{ background: 'rgba(52,211,153,0.1)', borderColor: 'rgba(52,211,153,0.25)', color: '#34D399' }}
      >
        <CheckCircle className="w-4 h-4 shrink-0" /> Resolution SLA Completed
      </div>
    );
  }

  const isBreached = diffMs < 0;

  if (isBreached) {
    return (
      <div
        className="rounded-lg p-3 text-xs flex items-center gap-2 border animate-pulse"
        style={{ background: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.25)', color: '#F87171' }}
      >
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span className="font-bold">SLA Breached!</span> Resolution was due {new Date(due).toLocaleString()}
      </div>
    );
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div
      className="rounded-lg p-3 text-xs flex items-center gap-2 border"
      style={{ background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.25)', color: 'var(--color-accent)' }}
    >
      <Clock className="w-4 h-4 shrink-0 text-indigo-500" />
      <span>
        SLA Due in <strong className="font-bold" style={{ color: 'var(--color-text)' }}>{hours}h {mins}m</strong> ({due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
      </span>
    </div>
  );
}
