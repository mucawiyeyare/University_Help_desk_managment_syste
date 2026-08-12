import React, { useState, useEffect } from 'react';
import {
  getDepartmentsApi,
  createDepartmentApi,
  updateDepartmentApi,
  deleteDepartmentApi,
  addAgentToDeptApi,
  removeAgentFromDeptApi,
} from '../../api/departments';
import { getUsersApi } from '../../api/users';
import Modal from '../../components/ui/Modal';
import { Building2, Plus, Edit2, Trash2, Search, UserCheck, UserPlus, UserX, Shield } from 'lucide-react';

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [allAgents, setAllAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [editDept, setEditDept] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', description: '', manager: '' });
  const [selectedAgentToAdd, setSelectedAgentToAdd] = useState('');

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const [deptRes, mgrRes, agentRes] = await Promise.all([
        getDepartmentsApi(),
        getUsersApi({ role: 'manager', limit: 50 }),
        getUsersApi({ role: 'agent', limit: 100 }),
      ]);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (mgrRes.data.success) setManagers(mgrRes.data.data);
      if (agentRes.data.success) setAllAgents(agentRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editDept) {
        await updateDepartmentApi(editDept._id, formData);
      } else {
        await createDepartmentApi(formData);
      }
      setShowModal(false);
      fetchDepartments();
    } catch (err) {
      alert('Error saving department: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deactivate department "${name}"?`)) return;
    try {
      await deleteDepartmentApi(id);
      fetchDepartments();
    } catch (err) {
      alert('Failed to delete department');
    }
  };

  const handleAddAgentToDept = async (e) => {
    e.preventDefault();
    if (!selectedDept || !selectedAgentToAdd) return;
    try {
      await addAgentToDeptApi(selectedDept._id, selectedAgentToAdd);
      setSelectedAgentToAdd('');
      fetchDepartments();
      setShowAgentModal(false);
    } catch (err) {
      alert('Failed to add agent');
    }
  };

  const handleRemoveAgentFromDept = async (deptId, agentId) => {
    if (!window.confirm('Remove agent from this department?')) return;
    try {
      await removeAgentFromDeptApi(deptId, agentId);
      fetchDepartments();
    } catch (err) {
      alert('Failed to remove agent');
    }
  };

  const filteredDepts = departments.filter((d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q) ||
      d.manager?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Building2 className="w-6 h-6 text-indigo-500" /> Support Departments Management (CRUD)
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Create, edit, deactivate departments, assign managers, and manage department agent rosters.
          </p>
        </div>
        <button
          onClick={() => {
            setEditDept(null);
            setFormData({ name: '', description: '', manager: '' });
            setShowModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Department
        </button>
      </div>

      {/* Search Box Bar */}
      <div
        className="rounded-xl p-3 shadow-md border flex items-center justify-between gap-3"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search departments by name, description, manager..."
            className="w-full rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none transition-all focus:ring-2 focus:ring-indigo-500/30"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
          />
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full border" style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
          {filteredDepts.length} {filteredDepts.length === 1 ? 'Department' : 'Departments'}
        </span>
      </div>

      {/* Department Cards Grid */}
      {loading ? (
        <div className="p-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading departments...</div>
      ) : filteredDepts.length === 0 ? (
        <div className="p-12 text-center text-sm rounded-xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--color-text-muted)' }}>
          No departments found. Click "Create Department" to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDepts.map((d) => (
            <div
              key={d._id}
              className="rounded-xl p-5 shadow-lg space-y-4 border transition-all hover:border-indigo-500/40"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base" style={{ color: 'var(--color-text)' }}>{d.name}</h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{d.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditDept(d);
                      setFormData({ name: d.name, description: d.description || '', manager: d.manager?._id || '' });
                      setShowModal(true);
                    }}
                    className="p-1.5 rounded-lg transition-colors hover:bg-indigo-500/10 text-indigo-400"
                    title="Edit Department"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(d._id, d.name)}
                    className="p-1.5 rounded-lg transition-colors hover:bg-rose-500/10 text-rose-400"
                    title="Deactivate Department"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t space-y-2 text-xs" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--color-text-muted)' }}>Department Manager:</span>
                  <span className="font-semibold text-indigo-400 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> {d.manager?.name || 'Unassigned'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--color-text-muted)' }}>Assigned Agents:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400">{d.agents?.length || 0} Agents</span>
                    <button
                      onClick={() => {
                        setSelectedDept(d);
                        setShowAgentModal(true);
                      }}
                      className="px-2 py-0.5 rounded text-[11px] bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30 font-medium flex items-center gap-1"
                    >
                      <UserPlus className="w-3 h-3" /> Add Agent
                    </button>
                  </div>
                </div>

                {/* Agents Pills */}
                {d.agents?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {d.agents.map((ag) => (
                      <span
                        key={ag._id || ag}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 text-[11px] font-medium text-slate-300 border border-slate-700"
                      >
                        {ag.name || 'Agent'}
                        <button
                          onClick={() => handleRemoveAgentFromDept(d._id, ag._id || ag)}
                          className="hover:text-rose-400 text-slate-400 ml-1"
                          title="Remove from department"
                        >
                          <UserX className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Department Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editDept ? 'Edit Department' : 'Create Department'}>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Department Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. IT Support Services"
              className="w-full p-2.5 rounded-lg border outline-none"
              style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Department Manager</label>
            <select
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              className="w-full p-2.5 rounded-lg border outline-none"
              style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
            >
              <option value="">Select Manager (Optional)</option>
              {managers.map((m) => (
                <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief summary of department responsibilities..."
              className="w-full p-2.5 rounded-lg border outline-none"
              style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-lg text-xs font-semibold border transition-colors"
              style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors">
              Save Department
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Agent Modal */}
      {showAgentModal && selectedDept && (
        <Modal isOpen={showAgentModal} onClose={() => setShowAgentModal(false)} title={`Add Agent to ${selectedDept.name}`}>
          <form onSubmit={handleAddAgentToDept} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Select Support Agent</label>
              <select
                required
                value={selectedAgentToAdd}
                onChange={(e) => setSelectedAgentToAdd(e.target.value)}
                className="w-full p-2.5 rounded-lg border outline-none"
                style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
              >
                <option value="">Select Agent</option>
                {allAgents.map((a) => (
                  <option key={a._id} value={a._id}>{a.name} ({a.email})</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <button
                type="button"
                onClick={() => setShowAgentModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold border"
                style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold">
                Add to Department
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
