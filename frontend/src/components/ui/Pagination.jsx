import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.pages <= 1) return null;

  const { page, pages, total, limit } = pagination;

  return (
    <div className="flex items-center justify-between pt-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
      <div>
        Showing{' '}
        <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{(page - 1) * limit + 1}</span>
        {' '}to{' '}
        <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{Math.min(page * limit, total)}</span>
        {' '}of{' '}
        <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{total}</span> tickets
      </div>

      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="p-1.5 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-medium" style={{ color: 'var(--color-text)' }}>
          {page} / {pages}
        </span>
        <button
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          className="p-1.5 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
