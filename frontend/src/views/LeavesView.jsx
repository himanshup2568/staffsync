import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CalendarCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Plus, 
  X, 
  MessageSquare,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export const LeavesView = () => {
  const { user, role, addToast } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Apply modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyData, setApplyData] = useState({
    leaveType: 'Annual',
    startDate: '',
    endDate: '',
    reason: ''
  });

  // Decision review modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewAction, setReviewAction] = useState('Approved'); // 'Approved' | 'Rejected'
  const [reviewComment, setReviewComment] = useState('');

  const canApprove = role === 'hr' || role === 'manager';

  const fetchLeaves = async () => {
    try {
      const res = await api.getLeaves({
        status: statusFilter,
        leaveType: typeFilter
      });
      if (res.success) {
        setLeaves(res.data);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter, typeFilter]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!applyData.startDate || !applyData.endDate || !applyData.reason) {
      addToast('Please fill out all required fields', 'error');
      return;
    }

    try {
      const res = await api.applyLeave(applyData);
      if (res.success) {
        addToast(res.message, 'success');
        setShowApplyModal(false);
        setApplyData({ leaveType: 'Annual', startDate: '', endDate: '', reason: '' });
        fetchLeaves();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleReviewDecision = async () => {
    if (!selectedLeave) return;
    try {
      const res = await api.updateLeaveStatus(selectedLeave.id, reviewAction, reviewComment);
      if (res.success) {
        addToast(res.message, 'success');
        setShowReviewModal(false);
        setSelectedLeave(null);
        setReviewComment('');
        fetchLeaves();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const openDecisionModal = (leave, action) => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setReviewComment(action === 'Approved' ? 'Approved as requested.' : 'Declined due to coverage constraints.');
    setShowReviewModal(true);
  };

  // Quotas calculations
  const pendingCount = leaves.filter(l => l.status === 'Pending').length;
  const approvedCount = leaves.filter(l => l.status === 'Approved').length;
  const rejectedCount = leaves.filter(l => l.status === 'Rejected').length;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {role === 'hr' && 'Company Leave Approvals'}
            {role === 'manager' && 'Team Leave Applications'}
            {role === 'employee' && 'My Leave Requests'}
          </h1>
          <p className="page-subtitle">
            {role === 'hr' && 'Review and track organization-wide paid time-off, sick days, and vacation requests.'}
            {role === 'manager' && "Review your direct team members' time-off applications and maintain departmental coverage."}
            {role === 'employee' && 'Submit time-off requests, monitor approval status, and check your remaining leave quota.'}
          </p>
        </div>

        <button 
          onClick={() => setShowApplyModal(true)} 
          className="btn btn-primary"
        >
          <Plus size={16} /> Apply for Time-Off
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Applications</span>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px' }}>{leaves.length}</p>
        </div>
        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>Pending Review</span>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: '#f59e0b' }}>{pendingCount}</p>
        </div>
        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>Approved</span>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: '#10b981' }}>{approvedCount}</p>
        </div>
        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '4px solid #f43f5e' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f43f5e', textTransform: 'uppercase' }}>Rejected</span>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: '#f43f5e' }}>{rejectedCount}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filter-bar">
        <select 
          className="form-select" 
          style={{ width: 'auto', minWidth: '160px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending Decision</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>

        <select 
          className="form-select" 
          style={{ width: 'auto', minWidth: '160px' }}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="All">All Leave Types</option>
          <option value="Annual">Annual / Vacation</option>
          <option value="Sick">Sick Leave</option>
          <option value="Casual">Casual Leave</option>
          <option value="Personal">Personal Leave</option>
          <option value="Maternity/Paternity">Maternity/Paternity</option>
        </select>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Loading leave applications...
        </div>
      ) : leaves.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <CalendarCheck size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3>No Leave Records Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            There are no applications matching the selected criteria.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Department</th>
                <th>Type</th>
                <th>Dates & Duration</th>
                <th>Reason</th>
                <th>Status</th>
                {canApprove && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {leaves.map(leave => {
                const statusBadge = leave.status === 'Approved' ? 'badge-success' : leave.status === 'Pending' ? 'badge-warning' : 'badge-danger';

                return (
                  <tr key={leave.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{leave.employeeName}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{leave.employeeEmail}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.84rem' }}>{leave.department}</span>
                    </td>
                    <td>
                      <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                        {leave.leaveType}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        {leave.startDate} → {leave.endDate}
                      </div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                        {leave.totalDays} day{leave.totalDays > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td style={{ maxWidth: '280px' }}>
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {leave.reason}
                      </p>
                      {leave.reviewComment && (
                        <p style={{ fontSize: '0.74rem', color: '#818cf8', marginTop: '4px', fontStyle: 'italic' }}>
                          Reviewer Note: "{leave.reviewComment}"
                        </p>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${statusBadge}`}>
                        {leave.status}
                      </span>
                    </td>
                    {canApprove && (
                      <td>
                        {leave.status === 'Pending' ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => openDecisionModal(leave, 'Approved')} 
                              className="btn btn-success btn-sm"
                              title="Approve Leave"
                            >
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button 
                              onClick={() => openDecisionModal(leave, 'Rejected')} 
                              className="btn btn-danger btn-sm"
                              title="Reject Leave"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            Reviewed by {leave.reviewedBy || 'Manager'}
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color="#818cf8" /> Submit Time-Off Request
              </h3>
              <button 
                onClick={() => setShowApplyModal(false)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApplyLeave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Leave Category *</label>
                  <select 
                    className="form-select"
                    value={applyData.leaveType}
                    onChange={(e) => setApplyData({ ...applyData, leaveType: e.target.value })}
                  >
                    <option value="Annual">Annual / Vacation Leave</option>
                    <option value="Casual">Casual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Personal">Personal Emergency</option>
                    <option value="Maternity/Paternity">Maternity / Paternity Leave</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Start Date *</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      required 
                      value={applyData.startDate}
                      onChange={(e) => setApplyData({ ...applyData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">End Date *</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      required 
                      value={applyData.endDate}
                      onChange={(e) => setApplyData({ ...applyData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Reason & Handover Details *</label>
                  <textarea 
                    className="form-textarea" 
                    required 
                    rows={4}
                    placeholder="Provide details regarding the reason for leave and designated coverage if applicable..."
                    value={applyData.reason}
                    onChange={(e) => setApplyData({ ...applyData, reason: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowApplyModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Decision Review Modal */}
      {showReviewModal && selectedLeave && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {reviewAction} Application: {selectedLeave.employeeName}
              </h3>
              <button 
                onClick={() => setShowReviewModal(false)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px' }}>
                <p style={{ fontSize: '0.86rem', color: '#fff', fontWeight: 600 }}>
                  {selectedLeave.leaveType} ({selectedLeave.totalDays} days): {selectedLeave.startDate} to {selectedLeave.endDate}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  "{selectedLeave.reason}"
                </p>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Manager / HR Feedback Note</label>
                <textarea 
                  className="form-textarea"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Enter comments for the applicant..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowReviewModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button 
                onClick={handleReviewDecision} 
                className={`btn ${reviewAction === 'Approved' ? 'btn-success' : 'btn-danger'}`}
              >
                Confirm {reviewAction}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
