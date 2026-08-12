import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategoriesApi, getSubcategoriesApi } from '../../api/categories';
import { createTicketApi } from '../../api/tickets';
import { PlusCircle, Paperclip } from 'lucide-react';

export default function CreateTicket() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubs, setFilteredSubs] = useState([]);

  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    subcategory: '',
    type: 'incident',
    priority: 'medium',
    description: '',
    location: '',
  });

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, subRes] = await Promise.all([
          getCategoriesApi(),
          getSubcategoriesApi(),
        ]);
        if (catRes.data.success) setCategories(catRes.data.data);
        if (subRes.data.success) setSubcategories(subRes.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleCategoryChange = (catId) => {
    setFormData({ ...formData, category: catId, subcategory: '' });
    const subs = subcategories.filter((s) => s.category?._id === catId || s.category === catId);
    setFilteredSubs(subs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.category || !formData.description) {
      setError('Please fill in all required fields (Subject, Category, Description)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) data.append(key, formData[key]);
      });
      for (let i = 0; i < files.length; i++) {
        data.append('attachments', files[i]);
      }

      const res = await createTicketApi(data);
      if (res.data.success) {
        navigate(`/tickets/${res.data.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <PlusCircle className="w-5 h-5 text-indigo-500" /> Create Support Request Ticket
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Provide complete details below to route your request to the appropriate university department.
        </p>
      </div>

      {error && (
        <div
          className="p-3 rounded-lg text-xs"
          style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#F87171' }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl p-6 shadow-xl space-y-4 border"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        {/* Subject */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
            Subject / Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="e.g. Cannot access Moodle portal for CS101"
            className="input-field"
          />
        </div>

        {/* Category & Subcategory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="input-field"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Subcategory</label>
            <select
              value={formData.subcategory}
              onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              className="input-field"
            >
              <option value="">Select Subcategory</option>
              {filteredSubs.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Type & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Request Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="input-field"
            >
              <option value="incident">Incident / Problem</option>
              <option value="service_request">Service Request</option>
              <option value="complaint">Complaint</option>
              <option value="inquiry">Inquiry / Question</option>
              <option value="suggestion">Suggestion</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="input-field"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Location / Campus */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Location / Building (Optional)</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g. Science Block A, Room 204"
            className="input-field"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
            Detailed Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={5}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Please provide full details about your problem or request..."
            className="input-field resize-none"
          />
        </div>

        {/* File Attachments */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Attachments (Max 5 files, up to 5MB each)</label>
          <div className="flex items-center gap-3">
            <label
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border cursor-pointer transition-colors"
              style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              <Paperclip className="w-4 h-4 text-indigo-500" />
              <span>Choose Files</span>
              <input
                type="file"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files))}
                className="hidden"
              />
            </label>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {files.length > 0 ? `${files.length} file(s) selected` : 'No file selected'}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Submitting Ticket...' : 'Submit Support Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
