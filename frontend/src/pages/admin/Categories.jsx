import React, { useState, useEffect } from 'react';
import { getCategoriesApi, createCategoryApi, getSubcategoriesApi } from '../../api/categories';
import { getDepartmentsApi } from '../../api/departments';
import Modal from '../../components/ui/Modal';
import { Layers, Plus, Search } from 'lucide-react';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [search, setSearch] = useState('');
  const [showCatModal, setShowCatModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDept, setCatDept] = useState('');

  const fetchData = async () => {
    try {
      const [cRes, dRes, sRes] = await Promise.all([getCategoriesApi(), getDepartmentsApi(), getSubcategoriesApi()]);
      if (cRes.data.success) setCategories(cRes.data.data);
      if (dRes.data.success) setDepartments(dRes.data.data);
      if (sRes.data.success) setSubcategories(sRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await createCategoryApi({ name: catName, department: catDept || null });
      setShowCatModal(false);
      setCatName('');
      setCatDept('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const deptName = departments.find((d) => d._id === c.department)?.name || 'General';
    const subList = subcategories.filter((s) => s.category?._id === c._id || s.category === c._id);
    const subNames = subList.map((s) => s.name).join(' ');
    return (
      c.name?.toLowerCase().includes(q) ||
      deptName.toLowerCase().includes(q) ||
      subNames.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Layers className="w-5 h-5 text-indigo-500" /> Support Categories &amp; Routing Rules
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Classify incoming tickets and set default department routing rules.
          </p>
        </div>
        <button
          onClick={() => setShowCatModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Search Bar */}
      <div
        className="rounded-xl p-3 shadow-md border flex items-center gap-3"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories, subcategories, or department routing..."
            className="w-full rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none transition-all focus:ring-2 focus:ring-indigo-500/30"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
          />
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full border" style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
          {filteredCategories.length} {filteredCategories.length === 1 ? 'Category' : 'Categories'}
        </span>
      </div>

      {/* Grid */}
      {filteredCategories.length === 0 ? (
        <div className="p-12 text-center text-sm rounded-xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--color-text-muted)' }}>
          No categories found matching your search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCategories.map((c) => {
            const deptObj = departments.find((d) => d._id === c.department);
            const subs = subcategories.filter((s) => s.category?._id === c._id || s.category === c._id);

            return (
              <div
                key={c._id}
                className="rounded-xl p-5 shadow-lg space-y-3 border transition-colors"
                style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 className="font-bold text-base" style={{ color: 'var(--color-text)' }}>{c.name}</h3>
                <p className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>
                  Routed Department: {deptObj ? deptObj.name : 'General / Unassigned'}
                </p>
                <div className="pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <span className="text-xs font-semibold block mb-2" style={{ color: 'var(--color-text-muted)' }}>
                    Linked Subcategories ({subs.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {subs.length === 0 ? (
                      <span className="text-[11px] italic" style={{ color: 'var(--color-text-muted)' }}>No subcategories defined</span>
                    ) : (
                      subs.map((sub) => (
                        <span
                          key={sub._id}
                          className="px-2.5 py-1 rounded text-[11px] border font-medium"
                          style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                        >
                          {sub.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showCatModal} onClose={() => setShowCatModal(false)} title="Create New Category">
        <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Category Name</label>
            <input
              type="text"
              required
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Target Department Routing</label>
            <select
              value={catDept}
              onChange={(e) => setCatDept(e.target.value)}
              className="input-field"
            >
              <option value="">None / General</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCatModal(false)}
              className="px-4 py-2 rounded-lg text-xs font-semibold border transition-colors"
              style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors">
              Create Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
