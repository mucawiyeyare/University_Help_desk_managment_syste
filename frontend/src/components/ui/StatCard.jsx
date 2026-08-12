import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle }) {
  const iconStyles = {
    blue:    { bg: 'rgba(26,86,167,0.1)',   color: '#1A56A7', border: 'rgba(26,86,167,0.25)' },
    green:   { bg: 'rgba(26,122,74,0.1)',   color: '#1A7A4A', border: 'rgba(26,122,74,0.25)' },
    teal:    { bg: 'rgba(13,148,136,0.1)',  color: '#0D9488', border: 'rgba(13,148,136,0.25)' },
    amber:   { bg: 'rgba(217,119,6,0.1)',   color: '#D97706', border: 'rgba(217,119,6,0.25)'  },
    rose:    { bg: 'rgba(220,38,38,0.1)',   color: '#DC2626', border: 'rgba(220,38,38,0.25)'  },
    sky:     { bg: 'rgba(43,125,200,0.1)',  color: '#2B7DC8', border: 'rgba(43,125,200,0.25)' },
    // legacy aliases kept for compatibility
    indigo:  { bg: 'rgba(26,86,167,0.1)',   color: '#1A56A7', border: 'rgba(26,86,167,0.25)' },
    purple:  { bg: 'rgba(26,122,74,0.1)',   color: '#1A7A4A', border: 'rgba(26,122,74,0.25)' },
    emerald: { bg: 'rgba(26,122,74,0.1)',   color: '#1A7A4A', border: 'rgba(26,122,74,0.25)' },
  };

  const ic = iconStyles[color] || iconStyles.blue;

  return (
    <div
      className="rounded-xl p-4 shadow-md flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
      }}
    >
      <div>
        <p
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {title}
        </p>
        <p
          className="text-2xl font-bold mt-1"
          style={{ color: 'var(--color-text)' }}
        >
          {value ?? 0}
        </p>
        {subtitle && (
          <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {Icon && (
        <div
          className="p-3 rounded-xl border shrink-0"
          style={{ background: ic.bg, color: ic.color, borderColor: ic.border }}
        >
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
