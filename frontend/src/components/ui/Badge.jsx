import React from 'react';

export default function Badge({ type = 'status', value }) {
  if (!value) return null;

  // Inline styles that work in both dark & light mode
  const styleMap = {
    // Status
    new:              { bg: 'rgba(99,102,241,0.12)',  color: '#818CF8', border: 'rgba(99,102,241,0.3)'  },
    assigned:         { bg: 'rgba(59,130,246,0.12)',  color: '#60A5FA', border: 'rgba(59,130,246,0.3)'  },
    in_progress:      { bg: 'rgba(251,191,36,0.12)',  color: '#FBBF24', border: 'rgba(251,191,36,0.3)'  },
    pending_user:     { bg: 'rgba(249,115,22,0.12)',  color: '#FB923C', border: 'rgba(249,115,22,0.3)'  },
    pending_internal: { bg: 'rgba(168,85,247,0.12)', color: '#C084FC', border: 'rgba(168,85,247,0.3)'  },
    resolved:         { bg: 'rgba(52,211,153,0.12)',  color: '#34D399', border: 'rgba(52,211,153,0.3)'  },
    closed:           { bg: 'rgba(100,116,139,0.12)', color: '#94A3B8', border: 'rgba(100,116,139,0.3)' },
    reopened:         { bg: 'rgba(244,63,94,0.12)',   color: '#FB7185', border: 'rgba(244,63,94,0.3)'   },
    cancelled:        { bg: 'rgba(239,68,68,0.12)',   color: '#F87171', border: 'rgba(239,68,68,0.3)'   },
    // Priority
    critical:         { bg: 'rgba(244,63,94,0.15)',   color: '#FB7185', border: 'rgba(244,63,94,0.4)',   pulse: true },
    high:             { bg: 'rgba(251,191,36,0.12)',  color: '#FBBF24', border: 'rgba(251,191,36,0.3)'  },
    medium:           { bg: 'rgba(99,102,241,0.12)',  color: '#818CF8', border: 'rgba(99,102,241,0.3)'  },
    low:              { bg: 'rgba(52,211,153,0.12)',  color: '#34D399', border: 'rgba(52,211,153,0.3)'  },
  };

  const valKey = String(value).toLowerCase();
  const s = styleMap[valKey] || { bg: 'rgba(100,116,139,0.12)', color: '#94A3B8', border: 'rgba(100,116,139,0.3)' };
  const label = valKey.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${s.pulse ? 'animate-pulse' : ''}`}
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      {label}
    </span>
  );
}
