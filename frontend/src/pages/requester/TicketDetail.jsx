import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getTicketApi,
  getCommentsApi,
  getHistoryApi,
  addCommentApi,
  resolveTicketApi,
  reopenTicketApi,
  submitFeedbackApi,
  updateTicketApi,
  assignTicketApi,
} from '../../api/tickets';
import { getAgentsApi } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/ui/Badge';
import CommentBox from '../../components/tickets/CommentBox';
import CommentItem from '../../components/tickets/CommentItem';
import SLAIndicator from '../../components/tickets/SLAIndicator';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import DocumentViewerModal from '../../components/ui/DocumentViewerModal';
import {
  ArrowLeft,
  User,
  Building2,
  Paperclip,
  CheckCircle,
  RotateCcw,
  Star,
  History,
  MessageSquare,
  AlertCircle,
  Ticket,
} from 'lucide-react';

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [commentLoading, setCommentLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('conversation');
  const [previewAttachment, setPreviewAttachment] = useState(null);

  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  const isStaff = ['agent', 'manager', 'admin'].includes(user?.role);
  const isManagerOrAdmin = ['manager', 'admin'].includes(user?.role);
  const ticketsPath = user?.role === 'admin'
    ? '/admin/tickets'
    : user?.role === 'manager'
    ? '/manager/tickets'
    : user?.role === 'agent'
    ? '/agent/my-tickets'
    : '/requester/tickets';

  const fetchTicketDetails = async () => {
    setLoading(true);
    setLoadError(null);
    setTicket(null);
    try {
      const tRes = await getTicketApi(id);
      if (tRes.data.success) setTicket(tRes.data.data);

      const cRes = await getCommentsApi(id);
      if (cRes.data.success) setComments(cRes.data.data);

      if (isStaff) {
        const [hRes, aRes] = await Promise.all([getHistoryApi(id), getAgentsApi()]);
        if (hRes.data.success) setHistory(hRes.data.data);
        if (aRes.data.success) setAgents(aRes.data.data);
      }
    } catch (err) {
      console.error(err);
      setLoadError({
        status: err.response?.status,
        message: err.response?.data?.message || 'The ticket could not be loaded.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const handleAddComment = async (formData) => {
    setCommentLoading(true);
    try {
      const res = await addCommentApi(id, formData);
      if (res.data.success) {
        setComments([...comments, res.data.data]);
        fetchTicketDetails();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTicketApi(id, { status: newStatus });
      fetchTicketDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignAgent = async (agentId) => {
    try {
      await assignTicketApi(id, { agentId });
      fetchTicketDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async () => {
    try {
      await resolveTicketApi(id, { resolutionSummary: 'Issue resolved by support agent' });
      fetchTicketDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReopen = async () => {
    try {
      await reopenTicketApi(id, 'Reopened by requester');
      fetchTicketDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      await submitFeedbackApi(id, { rating, comment: feedbackComment });
      setShowRatingModal(false);
      fetchTicketDetails();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Spinner fullScreen />;
  if (!ticket) {
    const isAccessDenied = loadError?.status === 403;
    return (
      <div className="p-12 text-center max-w-lg mx-auto my-12 rounded-2xl border shadow-lg" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        {isAccessDenied ? (
          <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: '#F59E0B' }} />
        ) : (
          <Ticket className="w-12 h-12 mx-auto mb-3" style={{ color: '#2175B5' }} />
        )}
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          {isAccessDenied ? 'Ticket Access Restricted' : 'Ticket Not Found'}
        </h2>
        <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
          {isAccessDenied
            ? 'Requesters can open only their own tickets. Contact support if you need access to this request.'
            : loadError?.message || 'The ticket record could not be loaded or may have been removed.'}
        </p>
        <button
          onClick={() => navigate(ticketsPath)}
          className="px-5 py-2.5 text-white rounded-xl text-xs font-semibold shadow-md inline-flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #2175B5, #0F7D4B)' }}
        >
          <ArrowLeft className="w-4 h-4" /> Return to Tickets
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg transition-colors hover:bg-slate-500/10"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg" style={{ color: 'var(--color-accent)' }}>{ticket.ticketNumber}</span>
              <Badge type="status" value={ticket.status} />
              <Badge type="priority" value={ticket.priority} />
            </div>
            <h1 className="text-xl font-bold mt-1" style={{ color: 'var(--color-text)' }}>{ticket.subject}</h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {ticket.status === 'resolved' && (
            <>
              <button
                onClick={() => setShowRatingModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
                style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', borderColor: 'rgba(245,158,11,0.3)' }}
              >
                <Star className="w-3.5 h-3.5" /> Rate Experience
              </button>
              <button
                onClick={handleReopen}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
                style={{ background: 'rgba(244,63,94,0.1)', color: '#FB7185', borderColor: 'rgba(244,63,94,0.3)' }}
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reopen Ticket
              </button>
            </>
          )}

          {isStaff && ticket.status !== 'resolved' && (
            <button
              onClick={handleResolve}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Mark Resolved
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details & Conversation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Description Card */}
          <div
            className="rounded-xl p-5 shadow-lg space-y-3 border"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Original Request Description
            </h3>
            <p className="text-xs md:text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--color-text)' }}>
              {ticket.description}
            </p>

            {ticket.location && (
              <p className="text-xs pt-2 border-t" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                <strong style={{ color: 'var(--color-text)' }}>Location:</strong> {ticket.location}
              </p>
            )}

            {ticket.attachments?.length > 0 && (
              <div className="pt-3 border-t space-y-2" style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-xs font-bold block" style={{ color: 'var(--color-text-muted)' }}>Attachments:</span>
                <div className="flex flex-wrap gap-2">
                  {ticket.attachments.map((att, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPreviewAttachment(att)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all hover:shadow-md hover:scale-[1.01]"
                      style={{
                        background: 'var(--color-surface2)',
                        color: 'var(--color-text)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      <Paperclip className="w-4 h-4 text-[#2175B5]" />
                      <span className="truncate max-w-[240px]">{att.originalName || att.filename}</span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded border ml-1"
                        style={{
                          background: 'rgba(33,117,181,0.1)',
                          color: '#2175B5',
                          borderColor: 'rgba(33,117,181,0.25)',
                        }}
                      >
                        PREVIEW
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="border-b flex gap-6 text-xs font-semibold" style={{ borderColor: 'var(--color-border)' }}>
            <button
              onClick={() => setActiveTab('conversation')}
              className={`pb-3 flex items-center gap-1.5 transition-colors border-b-2 ${
                activeTab === 'conversation'
                  ? 'border-indigo-500 text-indigo-500'
                  : 'border-transparent hover:opacity-80'
              }`}
              style={{ color: activeTab === 'conversation' ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
            >
              <MessageSquare className="w-4 h-4" /> Conversation Thread ({comments.length})
            </button>
            {isStaff && (
              <button
                onClick={() => setActiveTab('history')}
                className={`pb-3 flex items-center gap-1.5 transition-colors border-b-2 ${
                  activeTab === 'history'
                    ? 'border-indigo-500 text-indigo-500'
                    : 'border-transparent hover:opacity-80'
                }`}
                style={{ color: activeTab === 'history' ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
              >
                <History className="w-4 h-4" /> Audit History ({history.length})
              </button>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === 'conversation' ? (
            <div className="space-y-4">
              {comments.map((c) => (
                <CommentItem key={c._id} comment={c} onPreview={(att) => setPreviewAttachment(att)} />
              ))}

              {ticket.status !== 'closed' && (
                <CommentBox onSubmit={handleAddComment} loading={commentLoading} />
              )}
            </div>
          ) : (
            <div
              className="rounded-xl p-4 space-y-3 border"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
            >
              {history.map((h) => (
                <div
                  key={h._id}
                  className="text-xs p-3 rounded-lg border flex items-center justify-between"
                  style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}
                >
                  <div>
                    <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{h.changedBy?.name}</span>{' '}
                    <span style={{ color: 'var(--color-text-muted)' }}>{h.action.replace('_', ' ')}</span>
                    {h.note && <p className="mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{h.note}</p>}
                  </div>
                  <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{new Date(h.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Meta Sidebar */}
        <div className="space-y-4">
          <SLAIndicator ticket={ticket} />

          <div
            className="rounded-xl p-5 shadow-lg space-y-4 text-xs border"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
          >
            <h3 className="font-bold border-b pb-2" style={{ color: 'var(--color-text)', borderColor: 'var(--color-border)' }}>
              Ticket Metadata
            </h3>

            <div>
              <span className="block mb-1" style={{ color: 'var(--color-text-muted)' }}>Requester</span>
              <div className="flex items-center gap-2 font-medium" style={{ color: 'var(--color-text)' }}>
                <User className="w-4 h-4 text-indigo-500" />
                {ticket.requester?.name} ({ticket.requester?.email})
              </div>
            </div>

            <div>
              <span className="block mb-1" style={{ color: 'var(--color-text-muted)' }}>Assigned Department</span>
              <div className="flex items-center gap-2 font-medium" style={{ color: 'var(--color-text)' }}>
                <Building2 className="w-4 h-4 text-indigo-500" />
                {ticket.department?.name || 'Unassigned'}
              </div>
            </div>

            {/* Agent Assign Control for Staff */}
            <div>
              <span className="block mb-1" style={{ color: 'var(--color-text-muted)' }}>Assigned Agent</span>
              {isManagerOrAdmin ? (
                <select
                  value={ticket.assignedAgent?._id || ''}
                  onChange={(e) => handleAssignAgent(e.target.value)}
                  className="input-field"
                >
                  <option value="">Unassigned</option>
                  {agents.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="font-medium" style={{ color: 'var(--color-text)' }}>{ticket.assignedAgent?.name || 'Unassigned'}</p>
              )}
            </div>

            {/* Status Control for Staff */}
            {isStaff && (
              <div>
                <span className="block mb-1" style={{ color: 'var(--color-text-muted)' }}>Lifecycle Status</span>
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="input-field"
                >
                  <option value="new">New</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="pending_user">Pending User</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            )}

            <div>
              <span className="block mb-1" style={{ color: 'var(--color-text-muted)' }}>Category / Subcategory</span>
              <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                {ticket.category?.name || 'General'} {ticket.subcategory ? `> ${ticket.subcategory.name}` : ''}
              </p>
            </div>

            <div>
              <span className="block mb-1" style={{ color: 'var(--color-text-muted)' }}>Created At</span>
              <p className="font-medium" style={{ color: 'var(--color-text)' }}>{new Date(ticket.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Satisfaction Rating Modal */}
      <Modal isOpen={showRatingModal} onClose={() => setShowRatingModal(false)} title="Rate Support Experience">
        <form onSubmit={handleSubmitFeedback} className="space-y-4">
          <p className="text-xs" style={{ color: 'var(--color-text)' }}>How satisfied were you with the resolution of your support request?</p>

          <div className="flex items-center justify-center gap-2 py-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`p-1.5 transition-transform hover:scale-110 ${
                  star <= rating ? 'text-amber-400' : 'text-slate-400'
                }`}
              >
                <Star className="w-8 h-8 fill-current" />
              </button>
            ))}
          </div>

          <textarea
            rows={3}
            value={feedbackComment}
            onChange={(e) => setFeedbackComment(e.target.value)}
            placeholder="Optional comments regarding agent service..."
            className="input-field"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowRatingModal(false)}
              className="px-4 py-2 rounded-lg text-xs font-semibold border transition-colors"
              style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Submit Rating
            </button>
          </div>
        </form>
      </Modal>

      {/* Document Viewer Preview Modal */}
      <DocumentViewerModal
        attachment={previewAttachment}
        isOpen={!!previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />
    </div>
  );
}
