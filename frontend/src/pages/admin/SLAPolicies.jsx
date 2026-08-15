import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  getSLAPoliciesApi,
  createSLAPolicyApi,
  updateSLAPolicyApi,
  deleteSLAPolicyApi,
} from '../../api/sla';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Clock, CheckCircle2, CircleOff, Edit2, Plus, Search, Trash2 } from 'lucide-react';

const emptyPolicy = {
  name: '',
  priority: 'medium',
  responseTime: 60,
  resolutionTime: 480,
  isActive: true,
};

const formatDuration = (minutes) => {
  const value = Number(minutes);
  if (value < 60) return `${value} min`;
  if (value % 1440 === 0) return `${value / 1440} day${value === 1440 ? '' : 's'}`;
  if (value % 60 === 0) return `${value / 60} hr${value === 60 ? '' : 's'}`;
  return `${value} min`;
};

export default function SLAPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [formData, setFormData] = useState(emptyPolicy);
  const [saving, setSaving] = useState(false);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const res = await getSLAPoliciesApi();
      if (res.data.success) setPolicies(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Unable to load SLA policies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const filteredPolicies = policies.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.priority?.toLowerCase().includes(q)
    );
  });

  const openCreateModal = () => {
    setEditingPolicy(null);
    setFormData(emptyPolicy);
    setIsModalOpen(true);
  };

  const openEditModal = (policy) => {
    setEditingPolicy(policy);
    setFormData({
      name: policy.name || '',
      priority: policy.priority || 'medium',
      responseTime: policy.responseTime || 60,
      resolutionTime: policy.resolutionTime || 480,
      isActive: policy.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const responseTime = Number(formData.responseTime);
    const resolutionTime = Number(formData.resolutionTime);

    if (!Number.isFinite(responseTime) || responseTime <= 0 || !Number.isFinite(resolutionTime) || resolutionTime <= 0) {
      toast.error('Response and resolution targets must be greater than zero.');
      return;
    }
    if (responseTime > resolutionTime) {
      toast.error('The response target cannot be longer than the resolution target.');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...formData, responseTime, resolutionTime };
      if (editingPolicy) {
        await updateSLAPolicyApi(editingPolicy._id, payload);
        toast.success('SLA policy updated');
      } else {
        await createSLAPolicyApi(payload);
        toast.success('SLA policy created');
      }
      setIsModalOpen(false);
      await fetchPolicies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save the SLA policy');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (policy) => {
    if (!window.confirm(`Deactivate the SLA policy "${policy.name}"? Existing ticket deadlines will not change.`)) return;

    try {
      await deleteSLAPolicyApi(policy._id);
      toast.success('SLA policy deactivated');
      await fetchPolicies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to deactivate the SLA policy');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Clock className="w-5 h-5 text-indigo-500" /> Service-Level Agreements (SLA) Policies
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Create, edit, activate, and deactivate response and resolution targets by ticket priority.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Create SLA Policy
        </button>
      </div>

      {/* Table Container */}
      <div
        className="rounded-xl overflow-hidden shadow-xl border"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        {/* Search Bar */}
        <div className="p-3 border-b flex items-center justify-between gap-3" style={{ borderColor: 'var(--color-border)' }}>
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search SLA policies by name or priority level..."
              className="w-full rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none transition-all focus:ring-2 focus:ring-indigo-500/30"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
            />
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full border" style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
            {filteredPolicies.length} {filteredPolicies.length === 1 ? 'Policy' : 'Policies'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr
                className="text-[11px] uppercase tracking-wider font-semibold border-b"
                style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                <th className="py-3.5 px-4">Policy Name</th>
                <th className="py-3.5 px-4">Priority Level</th>
                <th className="py-3.5 px-4">First Response Target</th>
                <th className="py-3.5 px-4">Resolution Target</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Loading SLA policies...
                  </td>
                </tr>
              ) : filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    No SLA policies found. Create one to start applying service targets.
                  </td>
                </tr>
              ) : (
                filteredPolicies.map((p) => (
                  <tr
                    key={p._id}
                    className="transition-colors border-b"
                    style={{ borderColor: 'var(--color-border)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="py-3.5 px-4 font-semibold" style={{ color: 'var(--color-text)' }}>{p.name}</td>
                    <td className="py-3.5 px-4">
                      <Badge type="priority" value={p.priority} />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-500">
                      {formatDuration(p.responseTime)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-500">
                      {formatDuration(p.resolutionTime)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${p.isActive === false ? 'text-slate-400' : 'text-emerald-500'}`}>
                        {p.isActive === false ? <CircleOff className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        {p.isActive === false ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                          title="Edit SLA policy"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {p.isActive !== false && (
                          <button
                            onClick={() => handleDeactivate(p)}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Deactivate SLA policy"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPolicy ? 'Edit SLA Policy' : 'Create SLA Policy'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block mb-1 font-semibold" style={{ color: 'var(--color-text)' }}>Policy name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              placeholder="e.g. Standard High Priority"
              className="w-full p-2.5 rounded-lg border outline-none"
              style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold" style={{ color: 'var(--color-text)' }}>Ticket priority *</label>
            <select
              value={formData.priority}
              onChange={(event) => setFormData({ ...formData, priority: event.target.value })}
              className="w-full p-2.5 rounded-lg border outline-none"
              style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-semibold" style={{ color: 'var(--color-text)' }}>First response target (minutes) *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.responseTime}
                onChange={(event) => setFormData({ ...formData, responseTime: event.target.value })}
                className="w-full p-2.5 rounded-lg border outline-none"
                style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold" style={{ color: 'var(--color-text)' }}>Resolution target (minutes) *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.resolutionTime}
                onChange={(event) => setFormData({ ...formData, resolutionTime: event.target.value })}
                className="w-full p-2.5 rounded-lg border outline-none"
                style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
              />
            </div>
          </div>

          {editingPolicy && (
            <label className="flex items-center gap-2 cursor-pointer" style={{ color: 'var(--color-text)' }}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(event) => setFormData({ ...formData, isActive: event.target.checked })}
              />
              Active policy
            </label>
          )}

          <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            New tickets use the matching active priority policy. Times are measured in calendar minutes.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg border font-semibold"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-lg font-semibold"
            >
              {saving ? 'Saving...' : editingPolicy ? 'Save Changes' : 'Create Policy'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
