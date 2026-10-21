const express = require('express');
const router = express.Router();
const { getStore, saveStore } = require('../dataStore');
const { protect } = require('../middleware/auth');

// @route   GET /api/leaves
// @desc    Get leaves based on role (HR = all, Manager = team + self, Employee = self)
router.get('/', protect, (req, res) => {
  const store = getStore();
  let leaves = [...store.leaves];

  if (req.user.role === 'employee') {
    leaves = leaves.filter(l => l.employeeId === req.user.id);
  } else if (req.user.role === 'manager') {
    // Team members who report to this manager + the manager's own leaves
    const teamMemberIds = store.users
      .filter(u => u.managerId === req.user.id || u.id === req.user.id)
      .map(u => u.id);
    leaves = leaves.filter(l => teamMemberIds.includes(l.employeeId));
  }
  // HR gets all leaves

  // Optional query filters
  const { status, leaveType } = req.query;
  if (status && status !== 'All') {
    leaves = leaves.filter(l => l.status.toLowerCase() === status.toLowerCase());
  }
  if (leaveType && leaveType !== 'All') {
    leaves = leaves.filter(l => l.leaveType.toLowerCase() === leaveType.toLowerCase());
  }

  // Sort newest first
  leaves.sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn));

  res.json({
    success: true,
    count: leaves.length,
    data: leaves
  });
});

// @route   POST /api/leaves
// @desc    Apply for a leave (Employees, Managers, HR)
router.post('/', protect, (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body;

  if (!leaveType || !startDate || !endDate || !reason) {
    return res.status(400).json({ success: false, message: 'All leave details are required' });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) {
    return res.status(400).json({ success: false, message: 'End date cannot be prior to start date' });
  }

  // Calculate days difference (inclusive)
  const diffTime = Math.abs(end - start);
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const store = getStore();
  const user = store.users.find(u => u.id === req.user.id);

  // Check quota if available
  const typeKey = leaveType.toLowerCase();
  if (user && user.leaveBalance && user.leaveBalance[typeKey] !== undefined) {
    if (user.leaveBalance[typeKey] < totalDays) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${leaveType} leave balance. Available: ${user.leaveBalance[typeKey]} days, Requested: ${totalDays} days.`
      });
    }
  }

  const newLeave = {
    id: `lev-${Date.now()}`,
    employeeId: req.user.id,
    employeeName: req.user.name,
    employeeEmail: req.user.email,
    department: req.user.department,
    leaveType,
    startDate,
    endDate,
    totalDays,
    reason,
    status: 'Pending',
    appliedOn: new Date().toISOString(),
    reviewedBy: null,
    reviewComment: '',
    reviewedAt: null
  };

  store.leaves.unshift(newLeave);
  saveStore();

  res.status(201).json({
    success: true,
    data: newLeave,
    message: 'Leave application submitted successfully for review'
  });
});

// @route   PUT /api/leaves/:id/status
// @desc    Approve or Reject a leave application (Manager or HR)
router.put('/:id/status', protect, (req, res) => {
  if (req.user.role !== 'hr' && req.user.role !== 'manager') {
    return res.status(403).json({ success: false, message: 'Only HR personnel or Managers can approve/reject leaves' });
  }

  const { status, reviewComment } = req.body; // 'Approved' | 'Rejected'
  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Status must be either Approved or Rejected' });
  }

  const store = getStore();
  const leave = store.leaves.find(l => l.id === req.params.id);

  if (!leave) {
    return res.status(404).json({ success: false, message: 'Leave application not found' });
  }

  // If already decided
  const previousStatus = leave.status;
  leave.status = status;
  leave.reviewedBy = req.user.name;
  leave.reviewComment = reviewComment || (status === 'Approved' ? 'Approved as requested.' : 'Declined per departmental requirements.');
  leave.reviewedAt = new Date().toISOString();

  // If changing to Approved, deduct from user's leave balance
  if (status === 'Approved' && previousStatus !== 'Approved') {
    const applicant = store.users.find(u => u.id === leave.employeeId);
    if (applicant && applicant.leaveBalance) {
      const typeKey = leave.leaveType.toLowerCase();
      if (applicant.leaveBalance[typeKey] !== undefined) {
        applicant.leaveBalance[typeKey] = Math.max(0, applicant.leaveBalance[typeKey] - leave.totalDays);
      }
    }
  }

  saveStore();

  res.json({
    success: true,
    data: leave,
    message: `Leave application ${status.toLowerCase()} successfully`
  });
});

// @route   GET /api/leaves/summary
// @desc    Summary statistics for leaves
router.get('/summary', protect, (req, res) => {
  const store = getStore();
  let relevantLeaves = store.leaves;

  if (req.user.role === 'employee') {
    relevantLeaves = relevantLeaves.filter(l => l.employeeId === req.user.id);
  } else if (req.user.role === 'manager') {
    const teamMemberIds = store.users
      .filter(u => u.managerId === req.user.id || u.id === req.user.id)
      .map(u => u.id);
    relevantLeaves = relevantLeaves.filter(l => teamMemberIds.includes(l.employeeId));
  }

  const pendingCount = relevantLeaves.filter(l => l.status === 'Pending').length;
  const approvedCount = relevantLeaves.filter(l => l.status === 'Approved').length;
  const rejectedCount = relevantLeaves.filter(l => l.status === 'Rejected').length;

  res.json({
    success: true,
    data: {
      total: relevantLeaves.length,
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      leaveBalance: req.user.leaveBalance || { casual: 8, sick: 10, annual: 15, maternity: 60 }
    }
  });
});

module.exports = router;
