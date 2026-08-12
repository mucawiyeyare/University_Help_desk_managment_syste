import React, { useState } from 'react';
import { Lock, Paperclip } from 'lucide-react';
import DocumentViewerModal from '../ui/DocumentViewerModal';

export default function CommentItem({ comment, onPreview }) {
  const { author, body, isInternal, attachments, createdAt } = comment;
  const isStaff = ['agent', 'manager', 'admin'].includes(author?.role);
  const [internalPreview, setInternalPreview] = useState(null);

  const handlePreview = (att) => {
    if (onPreview) {
      onPreview(att);
    } else {
      setInternalPreview(att);
    }
  };

  return (
    <div
      className="p-4 rounded-xl border transition-all"
      style={{
        background: isInternal
          ? 'rgba(245,158,11,0.08)'
          : isStaff
          ? 'rgba(33,117,181,0.05)'
          : 'var(--card-bg)',
        borderColor: isInternal
          ? 'rgba(245,158,11,0.3)'
          : isStaff
          ? 'rgba(33,117,181,0.25)'
          : 'var(--card-border)',
        borderLeft: isStaff ? '4px solid #2175B5' : undefined,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border"
            style={{ background: 'var(--color-surface2)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
          >
            {author?.name ? author.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{author?.name}</span>
            <span
              className="ml-2 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border"
              style={{ background: 'rgba(33,117,181,0.1)', color: '#2175B5', borderColor: 'rgba(33,117,181,0.25)' }}
            >
              {author?.role}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {isInternal && (
            <span
              className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#D97706', borderColor: 'rgba(245,158,11,0.3)' }}
            >
              <Lock className="w-3 h-3" /> Internal
            </span>
          )}
          <span>{new Date(createdAt).toLocaleString()}</span>
        </div>
      </div>

      <p className="text-xs md:text-sm whitespace-pre-wrap leading-relaxed pl-9" style={{ color: 'var(--color-text)' }}>
        {body}
      </p>

      {attachments && attachments.length > 0 && (
        <div className="mt-3 pl-9 flex flex-wrap gap-2">
          {attachments.map((att, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePreview(att)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:scale-[1.01] hover:shadow-sm"
              style={{
                background: 'var(--color-surface2)',
                color: 'var(--color-text)',
                borderColor: 'var(--color-border)',
              }}
            >
              <Paperclip className="w-3.5 h-3.5 text-[#2175B5]" />
              <span className="truncate max-w-[200px]">{att.originalName || att.filename}</span>
              <span
                className="text-[9px] font-bold px-1 py-0.2 rounded border ml-1"
                style={{
                  background: 'rgba(33,117,181,0.1)',
                  color: '#2175B5',
                  borderColor: 'rgba(33,117,181,0.2)',
                }}
              >
                VIEW
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Internal Document Viewer Modal fallback if onPreview is not provided */}
      {!onPreview && (
        <DocumentViewerModal
          attachment={internalPreview}
          isOpen={!!internalPreview}
          onClose={() => setInternalPreview(null)}
        />
      )}
    </div>
  );
}
