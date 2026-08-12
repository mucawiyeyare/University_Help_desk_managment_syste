import React, { useState, useEffect } from 'react';
import {
  getAllAnnouncementsAdminApi,
  createAnnouncementApi,
  updateAnnouncementApi,
  deleteAnnouncementApi,
} from '../../api/announcements';
import { Megaphone, Plus, Edit2, Trash2, CheckCircle2, XCircle, AlertTriangle, Info, Wrench, Bell, X } from 'lucide-react';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'info',
    isActive: true,
    expiresAt: '',
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await getAllAnnouncementsAdminApi();
      if (res.data.success) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        body: item.body,
        type: item.type || 'info',
        isActive: item.isActive ?? true,
        expiresAt: item.expiresAt ? new Date(item.expiresAt).toISOString().split('T')[0] : '',
      });
    } else {
      setEditingItem(null);
      setFormData({ title: '', body: '', type: 'info', isActive: true, expiresAt: '' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateAnnouncementApi(editingItem._id, formData);
      } else {
        await createAnnouncementApi(formData);
      }
      setModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      alert('Error saving announcement: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete announcement "${title}"?`)) return;
    try {
      await deleteAnnouncementApi(id);
      fetchAnnouncements();
    } catch (err) {
      alert('Failed to delete announcement');
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Urgent</span>;
      case 'maintenance':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 inline-flex items-center gap-1"><Wrench className="w-3 h-3" /> Maintenance</span>;
      case 'warning':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30 inline-flex items-center gap-1"><Bell className="w-3 h-3" /> Warning</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30 inline-flex items-center gap-1"><Info className="w-3 h-3" /> Info</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Megaphone className="w-6 h-6 text-indigo-500" /> Campus Announcements Management
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Create and broadcast campus-wide notices, system maintenance alerts, and official announcements.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      {/* Grid of Announcements */}
      {loading ? (
        <div className="p-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading announcements...</div>
      ) : announcements.length === 0 ? (
        <div className="p-12 text-center rounded-xl border text-sm" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--color-text-muted)' }}>
          No announcements found. Click "New Announcement" to publish one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((a) => (
            <div
              key={a._id}
              className="p-5 rounded-xl border flex flex-col justify-between space-y-4 shadow-lg transition-all hover:border-indigo-500/40"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  {getTypeBadge(a.type)}
                  <div className="flex items-center gap-2">
                    {a.isActive ? (
                      <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Active</span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1"><XCircle className="w-3 h-3" /> Draft</span>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-sm leading-snug" style={{ color: 'var(--color-text)' }}>{a.title}</h3>
                <p className="text-xs mt-2 line-clamp-3 whitespace-pre-line" style={{ color: 'var(--color-text-muted)' }}>{a.body}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t text-[11px]" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                <span>By: {a.author?.name || 'Admin'} • {new Date(a.createdAt).toLocaleDateString()}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenModal(a)}
                    className="p-1.5 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(a._id, a.title)}
                    className="p-1.5 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl p-6 shadow-2xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                <Megaphone className="w-5 h-5 text-indigo-500" /> {editingItem ? 'Edit Announcement' : 'Publish Announcement'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block mb-1 font-semibold" style={{ color: 'var(--color-text-muted)' }}>Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Scheduled Portal Maintenance"
                  className="w-full p-2.5 rounded-lg border outline-none"
                  style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold" style={{ color: 'var(--color-text-muted)' }}>Category / Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2.5 rounded-lg border outline-none"
                    style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
                  >
                    <option value="info">Info / General</option>
                    <option value="maintenance">System Maintenance</option>
                    <option value="warning">Warning / Notice</option>
                    <option value="urgent">Urgent Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-semibold" style={{ color: 'var(--color-text-muted)' }}>Expiration Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full p-2.5 rounded-lg border outline-none"
                    style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold" style={{ color: 'var(--color-text-muted)' }}>Announcement Body *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Enter details of the announcement..."
                  className="w-full p-2.5 rounded-lg border outline-none"
                  style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border"
                />
                <label htmlFor="isActive" className="font-medium cursor-pointer" style={{ color: 'var(--color-text)' }}>
                  Active & Published immediately
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border font-medium"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-md"
                >
                  {editingItem ? 'Update' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
