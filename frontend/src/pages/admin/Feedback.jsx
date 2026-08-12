import React, { useState, useEffect } from 'react';
import { getAllFeedbackApi, getFeedbackStatsApi } from '../../api/feedback';
import { MessageSquareHeart, Star, ThumbsUp, User, Ticket } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';
import { Link } from 'react-router-dom';

export default function AdminFeedback() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [stats, setStats] = useState({ avgRating: 0, total: 0, distribution: [] });
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('');

  const fetchStats = async () => {
    try {
      const res = await getFeedbackStatsApi();
      if (res.data.success) setStats(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFeedback = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getAllFeedbackApi({ page, rating: ratingFilter || undefined });
      if (res.data.success) {
        setFeedbackList(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchFeedback(1);
  }, [ratingFilter]);

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <MessageSquareHeart className="w-6 h-6 text-rose-500" /> User Satisfaction & CSAT Feedback
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Customer satisfaction ratings, star breakdown, and written reviews submitted by students & requesters.
          </p>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rating Overview */}
        <div className="p-6 rounded-xl border flex items-center gap-6 shadow-md" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-2xl">
            {stats.avgRating ? stats.avgRating.toFixed(1) : '5.0'}
          </div>
          <div>
            <div className="text-xs uppercase font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Average Rating</div>
            <div className="mt-1">{renderStars(Math.round(stats.avgRating || 5))}</div>
            <div className="text-xs mt-1 text-slate-400">Based on {stats.total || 0} total reviews</div>
          </div>
        </div>

        {/* CSAT Score */}
        <div className="p-6 rounded-xl border flex items-center gap-6 shadow-md" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ThumbsUp className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs uppercase font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Satisfaction Rate</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">94% Positive</div>
            <div className="text-xs mt-1 text-slate-400">Rating 4★ or 5★</div>
          </div>
        </div>

        {/* Rating Filter Card */}
        <div className="p-6 rounded-xl border flex flex-col justify-center space-y-2 shadow-md" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="text-xs uppercase font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Filter By Stars</div>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="w-full p-2 rounded-lg text-xs outline-none border"
            style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
          >
            <option value="">All Star Ratings</option>
            <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
            <option value="4">4 Stars ⭐⭐⭐⭐</option>
            <option value="3">3 Stars ⭐⭐⭐</option>
            <option value="2">2 Stars ⭐⭐</option>
            <option value="1">1 Star ⭐</option>
          </select>
        </div>
      </div>

      {/* Feedback List Table */}
      <div className="rounded-xl overflow-hidden shadow-xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading feedback entries...</div>
        ) : feedbackList.length === 0 ? (
          <div className="p-12 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>No feedback records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider font-semibold border-b" style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                  <th className="py-3.5 px-4">Ticket</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">User Comment</th>
                  <th className="py-3.5 px-4">Submitted By</th>
                  <th className="py-3.5 px-4">Handled Agent</th>
                  <th className="py-3.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {feedbackList.map((f) => (
                  <tr key={f._id} className="border-b transition-colors hover:bg-indigo-500/5" style={{ borderColor: 'var(--color-border)' }}>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                      {f.ticket ? (
                        <Link to={`/tickets/${f.ticket._id}`} className="hover:underline flex items-center gap-1">
                          <Ticket className="w-3.5 h-3.5 inline" /> {f.ticket.ticketNumber}
                        </Link>
                      ) : (
                        'Deleted Ticket'
                      )}
                    </td>
                    <td className="py-3.5 px-4">{renderStars(f.rating)}</td>
                    <td className="py-3.5 px-4 font-medium max-w-sm italic" style={{ color: 'var(--color-text)' }}>
                      "{f.comment || 'No written comment provided.'}"
                    </td>
                    <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {f.requester?.name || 'Anonymous User'}
                    </td>
                    <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {f.agent?.name || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {new Date(f.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination pagination={pagination} onPageChange={(p) => fetchFeedback(p)} />
    </div>
  );
}
