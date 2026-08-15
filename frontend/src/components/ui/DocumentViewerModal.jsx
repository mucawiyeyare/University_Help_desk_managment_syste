import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import {
  FileText,
  File,
  Eye,
  ExternalLink,
  Download,
  X,
  FileCode,
  Image as ImageIcon,
  Loader2,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import mammoth from 'mammoth';

export default function DocumentViewerModal({ attachment, isOpen, onClose }) {
  const [loading, setLoading] = useState(true);
  const [docxHtml, setDocxHtml] = useState('');
  const [textContent, setTextContent] = useState('');
  const [error, setError] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  const fileUrl = attachment?.filename ? `http://localhost:5000/uploads/${attachment.filename}` : '';
  const filename = attachment?.originalName || attachment?.filename || 'Document';
  const ext = filename.split('.').pop().toLowerCase();

  const isDocx = ['docx', 'doc'].includes(ext);
  const isPdf = ext === 'pdf';
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext);
  const isText = ['txt', 'csv', 'json', 'log', 'md', 'js', 'html', 'css'].includes(ext);

  useEffect(() => {
    if (!isOpen || !attachment) return;

    setLoading(true);
    setError(null);
    setDocxHtml('');
    setTextContent('');
    setZoomLevel(100);

    const loadContent = async () => {
      try {
        if (isDocx) {
          // Fetch DOCX file as ArrayBuffer and convert to HTML using mammoth
          const res = await fetch(fileUrl);
          if (!res.ok) throw new Error(`HTTP ${res.status} failed to fetch document`);
          const arrayBuffer = await res.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setDocxHtml(result.value || '<p><em>No readable text content found in document.</em></p>');
        } else if (isText) {
          const res = await fetch(fileUrl);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const text = await res.text();
          setTextContent(text);
        }
      } catch (err) {
        console.error('Error rendering preview:', err);
        setError('Unable to parse inline text view. You can view in a new browser tab.');
      } finally {
        setLoading(false);
      }
    };

    if (isDocx || isText) {
      loadContent();
    } else {
      setLoading(false);
    }
  }, [isOpen, attachment, fileUrl, isDocx, isText]);

  if (!attachment) return null;

  const handleOpenInNewTab = () => {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-7xl">
      <div className="flex flex-col h-[82vh]">
        {/* ── Document Viewer Top Header ── */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b shrink-0 -mx-6 -mt-6 rounded-t-xl"
          style={{
            background: 'var(--color-surface2)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-sm"
              style={{
                background: isDocx
                  ? 'rgba(33,117,181,0.12)'
                  : isPdf
                  ? 'rgba(220,38,38,0.12)'
                  : isImage
                  ? 'rgba(15,125,75,0.12)'
                  : 'rgba(217,119,6,0.12)',
                color: isDocx
                  ? '#2175B5'
                  : isPdf
                  ? '#DC2626'
                  : isImage
                  ? '#0F7D4B'
                  : '#D97706',
                borderColor: 'var(--color-border)',
              }}
            >
              {isDocx ? (
                <FileText className="w-5 h-5" />
              ) : isPdf ? (
                <File className="w-5 h-5" />
              ) : isImage ? (
                <ImageIcon className="w-5 h-5" />
              ) : (
                <FileCode className="w-5 h-5" />
              )}
            </div>

            <div className="min-w-0">
              <h3
                className="text-sm font-bold truncate leading-snug"
                style={{ color: 'var(--color-text)' }}
                title={filename}
              >
                {filename}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded border"
                  style={{
                    background: 'rgba(33,117,181,0.1)',
                    color: '#2175B5',
                    borderColor: 'rgba(33,117,181,0.25)',
                  }}
                >
                  {ext.toUpperCase()} Document
                </span>
                <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  Inline Preview Mode
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {isImage && (
              <div className="flex items-center gap-1 mr-2 border-r pr-2" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  onClick={() => setZoomLevel(prev => Math.max(prev - 25, 50))}
                  title="Zoom Out"
                  className="p-1.5 rounded-lg border transition-colors hover:bg-slate-500/10"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono min-w-[36px] text-center" style={{ color: 'var(--color-text-muted)' }}>
                  {zoomLevel}%
                </span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(prev + 25, 200))}
                  title="Zoom In"
                  className="p-1.5 rounded-lg border transition-colors hover:bg-slate-500/10"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={handleOpenInNewTab}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:shadow-sm"
              style={{
                background: 'rgba(33,117,181,0.1)',
                color: '#2175B5',
                borderColor: 'rgba(33,117,181,0.3)',
              }}
              title="Open document directly in a new browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
            </button>

            <a
              href={fileUrl}
              download={filename}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:shadow-sm"
              style={{
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                borderColor: 'var(--color-border)',
              }}
              title="Save copy to device"
            >
              <Download className="w-3.5 h-3.5" /> Save Copy
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Document Viewer Body ── */}
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-slate-100 dark:bg-slate-950/60 rounded-b-xl relative flex flex-col items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#2175B5' }} />
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                Loading document preview...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-12 max-w-md">
              <FileText className="w-12 h-12 mx-auto mb-3 text-amber-500 opacity-60" />
              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
                {error}
              </p>
              <button
                onClick={handleOpenInNewTab}
                className="px-4 py-2 bg-gradient-to-r from-[#2175B5] to-[#0F7D4B] text-white rounded-xl text-xs font-semibold shadow-md inline-flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" /> Open Document in New Browser Tab
              </button>
            </div>
          ) : isDocx ? (
            /* DOCX Formatted Paper View inside page */
            <div className="w-full max-w-4xl min-h-full my-auto bg-white text-slate-900 shadow-xl rounded-xl p-8 md:p-12 border border-slate-200 overflow-y-auto">
              <div className="border-b pb-4 mb-6 flex items-center justify-between border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  📄 Word Document Preview ({filename})
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Converted for In-App View
                </span>
              </div>
              <div
                className="prose max-w-none text-slate-800 text-sm leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: docxHtml }}
              />
            </div>
          ) : isPdf ? (
            /* PDF Embedded Viewer */
            <iframe
              src={`${fileUrl}#toolbar=1`}
              title={filename}
              className="w-full h-full rounded-lg border shadow-lg bg-white"
              style={{ borderColor: 'var(--color-border)' }}
            />
          ) : isImage ? (
            /* Image Inline Previewer */
            <div className="max-w-full max-h-full flex items-center justify-center overflow-auto p-2">
              <img
                src={fileUrl}
                alt={filename}
                className="rounded-lg shadow-xl max-w-full max-h-[70vh] object-contain transition-all duration-200"
                style={{ transform: `scale(${zoomLevel / 100})` }}
              />
            </div>
          ) : isText ? (
            /* Text / Code File Previewer */
            <div className="w-full max-w-4xl h-full bg-slate-900 text-slate-100 rounded-xl p-4 shadow-xl overflow-auto font-mono text-xs leading-relaxed border border-slate-800">
              <pre className="whitespace-pre-wrap">{textContent}</pre>
            </div>
          ) : (
            /* Generic File Preview Fallback */
            <div className="text-center py-16">
              <File className="w-16 h-16 mx-auto mb-4" style={{ color: '#2175B5' }} />
              <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--color-text)' }}>
                {filename}
              </h4>
              <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
                Binary file view. You can view or inspect this file directly in a new browser tab.
              </p>
              <button
                onClick={handleOpenInNewTab}
                className="px-5 py-2.5 bg-[#2175B5] hover:bg-[#1A5E92] text-white rounded-xl text-xs font-semibold shadow-md inline-flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" /> Open in Browser Tab
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
