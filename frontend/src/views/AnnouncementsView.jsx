import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Pin, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Megaphone, 
  X, 
  Users,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export const AnnouncementsView = () => {
  const { user, role, addToast } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    priority: 'Normal',
    targetDepartment: 'All',
    pinned: false
  });

  const isHR = role === 'hr';

  const fetchAnnouncements = async () => {
    try {
      const res = await api.getAnnouncements({ category: categoryFilter });
      if (res.success) {
        setAnnouncements(res.data);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [categoryFilter]);

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createAnnouncement(formData);
      if (res.success) {
        addToast(res.message, 'success');
        setShowCreateModal(false);
        setFormData({
          title: '',
          content: '',
          category: 'General',
          priority: 'Normal',
          targetDepartment: 'All',
          pinned: false
        });
        fetchAnnouncements();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteNotice = async (id, title) => {
    if (!window.confirm(`Delete notice "${title}"?`)) return;
    try {
      const res = await api.deleteAnnouncement(id);
      if (res.success) {
        addToast(res.message, 'success');
        fetchAnnouncements();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      const res = await api.acknowledgeAnnouncement(id);
      if (res.success) {
        addToast('Acknowledgement recorded', 'success');
        fetchAnnouncements();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleTogglePin = async (notice) => {
    try {
      const res = await api.updateAnnouncement(notice.id, { pinned: !notice.pinned });
      if (res.success) {
        addToast(notice.pinned ? 'Unpinned bulletin' : 'Pinned bulletin to top', 'info');
        fetchAnnouncements();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Company Announcements & Bulletins</h1>
          <p className="page-subtitle">
            {isHR 
              ? 'Broadcast important company policies, executive notices, and quarterly events to staff.' 
              : 'Stay up to date with official company updates, workplace policies, and events.'}
          </p>
        </div>

        {isHR && (
          <button 
            onClick={() => setShowCreateModal(true)} 
            className="btn btn-primary"
          >
            <Plus size={16} /> Broadcast New Notice
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <select 
          className="form-select" 
          style={{ width: 'auto', minWidth: '160px' }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Policy">Policy & Guidelines</option>
          <option value="Event">Town Halls & Events</option>
          <option value="General">General Updates</option>
          <option value="Holiday">Holidays & Time-off</option>
        </select>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Loading announcements...
        </div>
      ) : announcements.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Megaphone size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3>No Announcements Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            There are currently no announcements matching this category.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {announcements.map(notice => {
            const hasAcknowledged = notice.acknowledgedBy?.includes(user?.id);
            const priorityBadge = notice.priority === 'Urgent' ? 'badge-danger' : notice.priority === 'High' ? 'badge-warning' : 'badge-info';

            return (
              <div 
                key={notice.id} 
                className="glass-card"
                style={{
                  border: notice.pinned ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-subtle)',
                  background: notice.pinned ? 'rgba(30, 41, 59, 0.75)' : 'var(--bg-card)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {notice.pinned && (
                      <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                        <Pin size={12} /> PINNED
                      </span>
                    )}
                    <span className={`badge ${priorityBadge}`}>
                      {notice.priority} Priority
                    </span>
                    <span className="badge badge-info">
                      {notice.category}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Target: <strong style={{ color: '#fff' }}>{notice.targetDepartment}</strong>
                    </span>
                  </div>

                  {isHR && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleTogglePin(notice)} 
                        className="btn btn-secondary btn-sm"
                        title={notice.pinned ? 'Unpin' : 'Pin to Top'}
                      >
                        <Pin size={13} color={notice.pinned ? '#f59e0b' : 'currentColor'} /> {notice.pinned ? 'Unpin' : 'Pin'}
                      </button>
                      <button 
                        onClick={() => handleDeleteNotice(notice.id, notice.title)} 
                        className="btn btn-danger btn-sm btn-icon"
                        title="Delete Announcement"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px', color: '#fff' }}>
                  {notice.title}
                </h3>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {notice.content}
                </p>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Published by <strong style={{ color: '#818cf8' }}>{notice.authorName}</strong> ({notice.authorRole})</span>
                    <span>•</span>
                    <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {notice.acknowledgedBy?.length || 0} Acknowledged
                    </span>
                    {!hasAcknowledged ? (
                      <button 
                        onClick={() => handleAcknowledge(notice.id)} 
                        className="btn btn-secondary btn-sm"
                      >
                        <CheckCircle size={14} /> Acknowledge Read
                      </button>
                    ) : (
                      <span className="badge badge-success" style={{ fontSize: '0.74rem' }}>
                        ✓ Acknowledged
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Broadcast Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Megaphone size={18} color="#818cf8" /> Broadcast Company Bulletin
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNotice}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Title / Headline *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    placeholder="e.g. Q4 Company Wide Strategy Town Hall"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Category</label>
                    <select 
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="General">General News</option>
                      <option value="Policy">Workplace Policy</option>
                      <option value="Event">Town Hall & Events</option>
                      <option value="Holiday">Holidays & Benefits</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Priority</label>
                    <select 
                      className="form-select"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent / Critical</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Target Audience / Department</label>
                  <select 
                    className="form-select"
                    value={formData.targetDepartment}
                    onChange={(e) => setFormData({ ...formData, targetDepartment: e.target.value })}
                  >
                    <option value="All">All Company Employees</option>
                    <option value="Engineering">Engineering Only</option>
                    <option value="Marketing">Marketing Only</option>
                    <option value="Human Resources">Human Resources Only</option>
                    <option value="Design">Design Only</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Content Body *</label>
                  <textarea 
                    className="form-textarea" 
                    required 
                    rows={5}
                    placeholder="Enter detailed notice message, instructions, and dates..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="pinnedCheck"
                    checked={formData.pinned}
                    onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#6366f1' }}
                  />
                  <label htmlFor="pinnedCheck" style={{ fontSize: '0.86rem', color: '#fff', cursor: 'pointer' }}>
                    Pin this notice to the top of dashboard
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
