import React, { useState, useEffect } from 'react';
import {
  getAllArticlesAdminApi,
  createArticleApi,
  updateArticleApi,
  deleteArticleApi,
} from '../../api/knowledge';
import { getCategoriesApi } from '../../api/categories';
import { BookOpen, Plus, Edit2, Trash2, Search, Eye, CheckCircle2, Globe, Lock, Tag, X } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';

export default function KnowledgeAdmin() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    category: '',
    tags: '',
    visibility: 'public',
    isPublished: true,
  });

  const fetchArticles = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getAllArticlesAdminApi({ page, search });
      if (res.data.success) {
        setArticles(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getCategoriesApi();
      if (res.data.success) setCategories(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles(1);
  }, [search]);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        body: item.body,
        category: item.category?._id || item.category || '',
        tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '',
        visibility: item.visibility || 'public',
        isPublished: item.isPublished ?? true,
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        body: '',
        category: categories[0]?._id || '',
        tags: '',
        visibility: 'public',
        isPublished: true,
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    try {
      if (editingItem) {
        await updateArticleApi(editingItem._id, payload);
      } else {
        await createArticleApi(payload);
      }
      setModalOpen(false);
      fetchArticles(pagination?.page || 1);
    } catch (err) {
      alert('Error saving article: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete article "${title}"?`)) return;
    try {
      await deleteArticleApi(id);
      fetchArticles(pagination?.page || 1);
    } catch (err) {
      alert('Failed to delete article');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <BookOpen className="w-6 h-6 text-indigo-500" /> Knowledge Base Management (Full CRUD)
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Author, edit, publish, and delete self-service articles and FAQs for students and staff.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Article
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 rounded-xl border flex items-center justify-between gap-3 shadow-md" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles by title..."
            className="w-full rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
          />
        </div>
      </div>

      {/* Articles Table */}
      <div className="rounded-xl overflow-hidden shadow-xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading articles...</div>
        ) : articles.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>No articles found. Click "Create Article" to write one.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider font-semibold border-b" style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                  <th className="py-3 px-4">Article Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Views</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((art) => (
                  <tr key={art._id} className="border-b transition-colors hover:bg-indigo-500/5" style={{ borderColor: 'var(--color-border)' }}>
                    <td className="py-3 px-4 font-semibold" style={{ color: 'var(--color-text)' }}>
                      {art.title}
                      {art.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {art.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--color-text-muted)' }}>
                      {art.category?.name || 'General'}
                    </td>
                    <td className="py-3 px-4">
                      {art.visibility === 'public' ? (
                        <span className="text-emerald-400 font-medium flex items-center gap-1"><Globe className="w-3 h-3" /> Public</span>
                      ) : (
                        <span className="text-amber-400 font-medium flex items-center gap-1"><Lock className="w-3 h-3" /> Internal</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {art.isPublished ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Published</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-500/20 text-slate-400 border border-slate-500/30">Draft</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      <Eye className="w-3.5 h-3.5 inline mr-1" /> {art.views || 0}
                    </td>
                    <td className="py-3 px-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {art.author?.name || 'Admin'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenModal(art)}
                          className="p-1.5 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(art._id, art.title)}
                          className="p-1.5 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination pagination={pagination} onPageChange={(p) => fetchArticles(p)} />

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-xl p-6 shadow-2xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                <BookOpen className="w-5 h-5 text-indigo-500" /> {editingItem ? 'Edit Knowledge Article' : 'New Knowledge Article'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block mb-1 font-semibold" style={{ color: 'var(--color-text-muted)' }}>Article Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. How to connect to EduWiFi"
                  className="w-full p-2.5 rounded-lg border outline-none"
                  style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold" style={{ color: 'var(--color-text-muted)' }}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-lg border outline-none"
                    style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
                  >
                    <option value="">General / None</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-semibold" style={{ color: 'var(--color-text-muted)' }}>Visibility</label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                    className="w-full p-2.5 rounded-lg border outline-none"
                    style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
                  >
                    <option value="public">Public (Everyone)</option>
                    <option value="internal">Internal (Agents & Staff)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold" style={{ color: 'var(--color-text-muted)' }}>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g. wifi, network, password"
                  className="w-full p-2.5 rounded-lg border outline-none"
                  style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold" style={{ color: 'var(--color-text-muted)' }}>Article Content / Body *</label>
                <textarea
                  required
                  rows={6}
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Detailed step-by-step instructions..."
                  className="w-full p-2.5 rounded-lg border outline-none font-sans"
                  style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="rounded border"
                />
                <label htmlFor="isPublished" className="font-medium cursor-pointer" style={{ color: 'var(--color-text)' }}>
                  Publish Article Immediately
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
                  {editingItem ? 'Update Article' : 'Create Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
