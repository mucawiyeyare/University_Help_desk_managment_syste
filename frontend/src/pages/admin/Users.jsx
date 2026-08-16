import React, { useState, useEffect } from 'react';
import { getUsersApi, createUserApi, updateUserApi, setUserStatusApi, deleteUserApi } from '../../api/users';
import { getDepartmentsApi } from '../../api/departments';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import { Users, Plus, Edit2, Trash2, CheckCircle2, XCircle, Search, AlertCircle, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function UserManagement({ managerMode = false }) {
  const { user: currentUser } = useAuth();
  const emptyFormData = () => ({
    name: '', email: '', password: '', role: managerMode ? 'agent' : 'requester', requesterType: 'student', department: '', phone: '',
  });
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [filters, setFilters] = useState({ page: 1, limit: 10, search: '', role: '' });

  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState(emptyFormData);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [uRes, dRes] = await Promise.all([
        getUsersApi(managerMode ? { ...filters, role: 'agent' } : filters),
        managerMode ? null : getDepartmentsApi(),
      ]);
      if (uRes.data.success) {
        setUsers(uRes.data.data);
        setPagination(uRes.data.pagination);
      }
      if (dRes?.data.success) setDepartments(dRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const handleOpenCreate = () => {
    setEditUser(null);
    setErrorMsg('');
    setFormData(emptyFormData());
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setEditUser(user);
    setErrorMsg('');
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: managerMode ? 'agent' : user.role,
      requesterType: user.requesterType || 'student',
      department: user.department?._id || user.department || '',
      phone: user.phone || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSaving(true);
    try {
      const payload = managerMode
        ? { name: formData.name, email: formData.email, password: formData.password, phone: formData.phone }
        : { ...formData };
      if (!managerMode && !payload.department && !editUser) delete payload.department;

      if (editUser) {
        if (!payload.password) delete payload.password;
        await updateUserApi(editUser._id, payload);
        toast.success(`${managerMode ? 'Agent' : 'User'} updated successfully`);
      } else {
        await createUserApi(payload);
        toast.success(`${managerMode ? 'Agent' : 'User'} created successfully`);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || `Failed to save ${managerMode ? 'agent' : 'user'} account`;
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const accountType = managerMode ? 'agent' : 'user';
    if (window.confirm(`Permanently delete this ${accountType} account? This cannot be undone.`)) {
      try {
        await deleteUserApi(id);
        toast.success(`${managerMode ? 'Agent' : 'User'} permanently deleted`);
        fetchUsers();
      } catch (err) {
        toast.error(err.response?.data?.message || `Failed to delete ${accountType}`);
        console.error(err);
      }
    }
  };

  const handleStatusChange = async (user, isActive) => {
    const action = isActive ? 'activate' : 'deactivate';
    if (!window.confirm(`${action.charAt(0).toUpperCase()}${action.slice(1)} ${user.name}'s account?`)) return;

    try {
      await setUserStatusApi(user._id, isActive);
      toast.success(`User ${isActive ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} user`);
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Users className="w-5 h-5" style={{ color: '#2175B5' }} /> {managerMode ? 'Department Agents' : 'User Accounts & Access Control'}
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {managerMode ? 'Create and manage support agents for your department.' : 'Manage requesters, support agents, department managers, and system administrators.'}
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-xs font-semibold shadow-md transition-all hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, #2175B5, #0F7D4B)' }}
        >
          <Plus className="w-4 h-4" /> Add New {managerMode ? 'Agent' : 'User'}
        </button>
      </div>

      <div className="rounded-xl overflow-hidden shadow-lg border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        {/* Search Bar */}
        <div className="p-3 border-b flex items-center justify-between gap-3" style={{ borderColor: 'var(--color-border)' }}>
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              placeholder={`Search ${managerMode ? 'agents' : 'users'} by name, email, or role...`}
              className="w-full rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none transition-all"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead>
              <tr className="font-semibold uppercase text-[11px]" style={{ background: 'var(--color-surface2)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Loading user accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    No user accounts found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="transition-colors" style={{ borderBottom: '1px solid var(--color-border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="py-3 px-4 font-semibold" style={{ color: 'var(--color-text)' }}>{u.name}</td>
                    <td className="py-3 px-4" style={{ color: 'var(--color-text-muted)' }}>{u.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className="capitalize font-bold text-[11px] px-2 py-0.5 rounded border"
                        style={{
                          background: 'rgba(33,117,181,0.1)',
                          color: '#2175B5',
                          borderColor: 'rgba(33,117,181,0.25)',
                        }}
                      >
                        {u.role === 'manager' ? 'Dept Manager' : u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--color-text-muted)' }}>{u.department?.name || 'General'}</td>
                    <td className="py-3 px-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: '#0F7D4B' }}>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500">
                          <XCircle className="w-3.5 h-3.5" /> Deactivated
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button title="Edit user" aria-label={`Edit ${u.name}`} onClick={() => handleOpenEdit(u)} className="p-1.5 rounded-lg transition-colors hover:bg-slate-500/10" style={{ color: 'var(--color-text-muted)' }}>
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {u.isActive ? (
                          <button
                            title={currentUser?._id === u._id ? 'You cannot deactivate your own account' : 'Deactivate user'}
                            aria-label={`Deactivate ${u.name}`}
                            disabled={currentUser?._id === u._id}
                            onClick={() => handleStatusChange(u, false)}
                            className="p-1.5 rounded-lg transition-colors text-amber-500 hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            title="Activate user"
                            aria-label={`Activate ${u.name}`}
                            onClick={() => handleStatusChange(u, true)}
                            className="p-1.5 rounded-lg transition-colors text-emerald-500 hover:bg-emerald-500/10"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          title={currentUser?._id === u._id ? 'You cannot delete your own account' : 'Permanently delete user'}
                          aria-label={`Delete ${u.name}`}
                          disabled={currentUser?._id === u._id}
                          onClick={() => handleDelete(u._id)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-rose-500/10 text-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination pagination={pagination} onPageChange={(page) => setFilters({ ...filters, page })} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editUser ? `Edit ${managerMode ? 'Agent' : 'User'} Account` : `Create ${managerMode ? 'Agent' : 'User'} Account`}>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {errorMsg && (
            <div
              className="p-3 rounded-xl text-xs flex items-center gap-2"
              style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#DC2626' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Full Name</label>
            <input type="text" required value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field" placeholder="e.g. Ubax Mohamed" />
          </div>
          <div>
            <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Email</label>
            <input type="email" required value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field" placeholder="user@uhdms.edu" />
          </div>
          <div>
              <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                Password {editUser && <span className="font-normal" style={{ color: 'var(--color-text-muted)' }}>(leave blank to keep current password)</span>}
              </label>
              <input type="password" required={!editUser} minLength={6} value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-field" placeholder="••••••••" />
          </div>
          {!managerMode && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>System Role</label>
                  <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="input-field">
                    <option value="requester">Requester (Student / Staff)</option>
                    <option value="agent">Support Agent</option>
                    <option value="manager">Department Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Department</label>
                  <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="input-field">
                    <option value="">None / General</option>
                    {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

            </>
          )}
          <div>
            <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Phone</label>
            <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input-field" placeholder="+252 61 000 0000" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-lg text-xs font-medium border transition-colors"
              style={{ background: 'var(--color-surface2)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-white rounded-lg font-semibold transition-all shadow-md disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #2175B5, #0F7D4B)' }}
            >
              {saving ? 'Saving User...' : 'Save User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
