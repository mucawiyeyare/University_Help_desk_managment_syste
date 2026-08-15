import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  MessageSquare,
  RefreshCw,
  Ticket,
  UserCheck,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const notificationIcons = {
  ticket_assigned: UserCheck,
  ticket_reassigned: RefreshCw,
  ticket_created: Ticket,
  department_ticket_created: Ticket,
  status_changed: RefreshCw,
  ticket_resolved: CheckCircle2,
  sla_approaching: Clock3,
  sla_breach: AlertTriangle,
  requester_replied: MessageSquare,
  agent_replied: MessageSquare,
};

export default function Notifications() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Bell className="w-5 h-5 text-indigo-500" /> Notifications
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Assignment, ticket status, resolution, and SLA updates are shown here.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4" /> Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      <div className="rounded-xl overflow-hidden shadow-xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        {notifications.length === 0 ? (
          <div className="p-12 text-center" style={{ color: 'var(--color-text-muted)' }}>
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No notifications yet</p>
            <p className="text-xs mt-1">Important ticket activity will appear here.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {notifications.map((notification) => {
              const Icon = notificationIcons[notification.type] || Bell;
              const isSlaAlert = ['sla_approaching', 'sla_breach'].includes(notification.type);
              const iconColor = notification.type === 'sla_breach'
                ? '#F87171'
                : notification.type === 'sla_approaching'
                ? '#FBBF24'
                : notification.type === 'ticket_resolved'
                ? '#34D399'
                : '#60A5FA';
              const content = (
                <>
                  <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: `${iconColor}1F`, color: iconColor }}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <strong className="text-xs" style={{ color: 'var(--color-text)' }}>{notification.title}</strong>
                      {!notification.isRead && <span className="w-2 h-2 rounded-full bg-indigo-500" aria-label="Unread" />}
                    </span>
                    <span className="block mt-0.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>{notification.message}</span>
                    <span className="block mt-1 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </span>
                </>
              );

              return notification.ticket ? (
                <Link
                  key={notification._id}
                  to={`/tickets/${notification.ticket}`}
                  onClick={() => { if (!notification.isRead) markRead(notification._id); }}
                  className="flex items-center gap-3 p-4 transition-colors"
                  style={{
                    background: notification.isRead ? 'transparent' : (isSlaAlert ? 'rgba(245,158,11,0.06)' : 'rgba(59,130,246,0.06)'),
                    borderLeft: notification.isRead ? '3px solid transparent' : `3px solid ${iconColor}`,
                  }}
                >
                  {content}
                </Link>
              ) : (
                <button
                  key={notification._id}
                  type="button"
                  onClick={() => { if (!notification.isRead) markRead(notification._id); }}
                  className="w-full text-left flex items-center gap-3 p-4 transition-colors"
                  style={{
                    background: notification.isRead ? 'transparent' : 'rgba(59,130,246,0.06)',
                    borderLeft: notification.isRead ? '3px solid transparent' : `3px solid ${iconColor}`,
                  }}
                >
                  {content}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
