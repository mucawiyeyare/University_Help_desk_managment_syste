import React from 'react';
import { Clock } from 'lucide-react';
import { getTicketAssignmentState, getTicketSLAState } from './TicketSLAStatus';

export default function SLAIndicator({ ticket }) {
  if (!ticket) return null;

  const state = getTicketSLAState(ticket) || getTicketAssignmentState(ticket);
  const due = ticket.slaDueResolution ? new Date(ticket.slaDueResolution) : null;

  if (state) {
    const Icon = state.Icon;
    return (
      <div
        className="rounded-lg p-3 text-xs flex items-start gap-2 border"
        style={{ background: state.background, borderColor: state.border, color: state.color }}
      >
        <Icon className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          <strong className="font-bold block">{state.label}</strong>
          {state.description}{due ? `. Deadline: ${due.toLocaleString()}` : ''}
        </span>
      </div>
    );
  }

  if (!due) return null;

  const diffMs = due.getTime() - Date.now();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));

  return (
    <div
      className="rounded-lg p-3 text-xs flex items-center gap-2 border"
      style={{ background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.3)', color: '#60A5FA' }}
    >
      <Clock className="w-4 h-4 shrink-0" />
      <span>
        SLA due in <strong className="font-bold" style={{ color: 'var(--color-text)' }}>{hours}h {mins}m</strong> ({due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
      </span>
    </div>
  );
}
