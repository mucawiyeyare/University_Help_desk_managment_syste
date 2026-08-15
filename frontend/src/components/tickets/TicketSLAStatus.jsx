import { AlertTriangle, CheckCircle2, Clock3, UserX } from 'lucide-react';

const TERMINAL_STATUSES = ['resolved', 'closed'];
const WARNING_WINDOW_MS = 60 * 60 * 1000;

export const getTicketSLAState = (ticket) => {
  if (!ticket) return null;

  const isResolved = TERMINAL_STATUSES.includes(ticket.status);
  const dueAt = ticket.slaDueResolution ? new Date(ticket.slaDueResolution) : null;
  const completedAt = ticket.resolvedAt || ticket.closedAt
    ? new Date(ticket.resolvedAt || ticket.closedAt)
    : null;
  const resolvedAfterDeadline = Boolean(ticket.slaResolutionBreached)
    || Boolean(dueAt && completedAt && completedAt > dueAt);

  if (isResolved && dueAt) {
    if (resolvedAfterDeadline) {
      return {
        type: 'breached',
        label: 'Late',
        description: 'Resolved after SLA deadline',
        color: '#FFFFFF',
        background: '#EF4444',
        border: '#DC2626',
        Icon: AlertTriangle,
      };
    }
    return {
      type: 'within_sla',
      label: 'On-time',
      description: 'Resolved before the SLA deadline',
      color: '#FFFFFF',
      background: '#22C55E',
      border: '#16A34A',
      Icon: CheckCircle2,
    };
  }

  if (dueAt) {
    const timeUntilDue = dueAt.getTime() - Date.now();
    if (timeUntilDue < 0) {
      return {
        type: 'breached',
        label: 'Late',
        description: 'Resolution SLA deadline has expired',
        color: '#FFFFFF',
        background: '#EF4444',
        border: '#DC2626',
        Icon: AlertTriangle,
      };
    }
    if (timeUntilDue <= WARNING_WINDOW_MS) {
      return {
        type: 'approaching',
        label: 'SLA Approaching',
        description: 'Resolution SLA deadline is within one hour',
        color: '#FBBF24',
        background: 'rgba(245,158,11,0.12)',
        border: 'rgba(245,158,11,0.35)',
        Icon: Clock3,
      };
    }
  }

  return null;
};

export const getTicketAssignmentState = (ticket) => {
  const hasAssignee = Boolean(ticket?.assignedAgent?._id || ticket?.assignedAgent);
  if (ticket?.status !== 'new' || hasAssignee) return null;
  return {
    type: 'unassigned',
    label: 'Unassigned',
    description: 'New ticket requires an agent assignment',
    color: '#FFFFFF',
    background: '#EF4444',
    border: '#DC2626',
    Icon: UserX,
  };
};

export default function TicketSLAStatus({ ticket, compact = false }) {
  const states = [getTicketAssignmentState(ticket), getTicketSLAState(ticket)].filter(Boolean);
  if (states.length === 0) return null;

  return (
    <>
      {states.map((state) => {
        const Icon = state.Icon;
        return (
          <span
            key={state.type}
            className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}`}
            style={{ background: state.background, color: state.color, borderColor: state.border }}
            title={state.description}
          >
            <Icon className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
            <span>{state.label}</span>
          </span>
        );
      })}
    </>
  );
}
