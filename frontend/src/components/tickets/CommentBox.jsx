import React, { useState } from 'react';
import { Send, Lock, Paperclip, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function CommentBox({ onSubmit, loading }) {
  const { user } = useAuth();
  const [body, setBody] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [files, setFiles] = useState([]);

  const isStaff = ['agent', 'manager', 'admin'].includes(user?.role);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    const formData = new FormData();
    formData.append('body', body);
    formData.append('isInternal', isInternal);
    files.forEach((f) => formData.append('attachments', f));

    await onSubmit(formData);
    setBody('');
    setIsInternal(false);
    setFiles([]);
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl p-4 shadow-lg border transition-colors"
      style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
    >
      {isStaff && (
        <div className="flex items-center gap-4 mb-3 pb-3 border-b text-xs" style={{ borderColor: 'var(--color-border)' }}>
          <button
            type="button"
            onClick={() => setIsInternal(false)}
            className="font-semibold transition-colors"
            style={{ color: !isInternal ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
          >
            Public Reply
          </button>
          <button
            type="button"
            onClick={() => setIsInternal(true)}
            className="font-semibold flex items-center gap-1 transition-colors"
            style={{ color: isInternal ? '#F59E0B' : 'var(--color-text-muted)' }}
          >
            <Lock className="w-3 h-3" /> Internal Note
          </button>
        </div>
      )}

      {isInternal && (
        <div
          className="rounded-lg p-2.5 mb-3 text-xs flex items-center gap-2 border"
          style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)', color: '#D97706' }}
        >
          <Lock className="w-3.5 h-3.5 shrink-0" /> Visible ONLY to support agents &amp; staff. The requester will NOT see this.
        </div>
      )}

      <textarea
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={isInternal ? 'Type an internal note...' : 'Type your reply here...'}
        className="w-full rounded-lg p-3 text-xs md:text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/30 resize-none"
        style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
        required
      />

      {/* File Previews */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {files.map((f, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] border"
              style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              <Paperclip className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} /> {f.name}
              <button type="button" onClick={() => setFiles(files.filter((_, idx) => idx !== i))}>
                <X className="w-3 h-3 text-rose-500 hover:text-rose-400" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <label className="cursor-pointer flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
          <Paperclip className="w-4 h-4 text-indigo-500" /> Attach Files
          <input type="file" multiple onChange={handleFileChange} className="hidden" />
        </label>

        <button
          type="submit"
          disabled={loading || !body.trim()}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-md transition-all ${
            isInternal ? 'bg-amber-600 hover:bg-amber-500' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Send className="w-3.5 h-3.5" /> {loading ? 'Sending...' : isInternal ? 'Add Note' : 'Post Reply'}
        </button>
      </div>
    </form>
  );
}
