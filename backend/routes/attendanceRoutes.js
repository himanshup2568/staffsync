const express = require('express');
const router = express.Router();
const { getStore, saveStore } = require('../dataStore');
const { protect } = require('../middleware/auth');

// Helper to get local date string YYYY-MM-DD
const getTodayDateStr = () => {
  return new Date().toISOString().split('T')[0];
};

// @route   GET /api/attendance/today
// @desc    Get current user's today attendance status
router.get('/today', protect, (req, res) => {
  const store = getStore();
  const today = getTodayDateStr();

  const record = store.attendance.find(
    a => a.employeeId === req.user.id && a.date === today
  );

  res.json({
    success: true,
    data: record || null,
    isClockedIn: !!(record && record.clockIn && !record.clockOut),
    isClockedOut: !!(record && record.clockOut)
  });
});

// @route   POST /api/attendance/clock-in
// @desc    Clock in for today
router.post('/clock-in', protect, (req, res) => {
  const store = getStore();
  const today = getTodayDateStr();

  let record = store.attendance.find(
    a => a.employeeId === req.user.id && a.date === today
  );

  if (record && record.clockIn) {
    return res.status(400).json({
      success: false,
      message: 'You have already clocked in for today.',
      data: record
    });
  }

  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  // If clocked in after 9:15 AM, flag as 'Late', otherwise 'Present'
  const isLate = hour > 9 || (hour === 9 && minute > 15);

  if (!record) {
    record = {
      id: `att-${Date.now()}`,
      employeeId: req.user.id,
      employeeName: req.user.name,
      department: req.user.department,
      date: today,
      clockIn: now.toISOString(),
      clockOut: null,
      totalHours: 0,
      status: isLate ? 'Late' : 'Present',
      notes: req.body.notes || 'Punched in via StaffSync Web Portal'
    };
    store.attendance.unshift(record);
  } else {
    record.clockIn = now.toISOString();
    record.status = isLate ? 'Late' : 'Present';
  }

  saveStore();

  res.json({
    success: true,
    data: record,
    message: `Clock-in recorded at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  });
});

// @route   POST /api/attendance/clock-out
// @desc    Clock out for today
router.post('/clock-out', protect, (req, res) => {
  const store = getStore();
  const today = getTodayDateStr();

  const record = store.attendance.find(
    a => a.employeeId === req.user.id && a.date === today
  );

  if (!record || !record.clockIn) {
    return res.status(400).json({
      success: false,
      message: 'You must clock in first before clocking out.'
    });
  }

  if (record.clockOut) {
    return res.status(400).json({
      success: false,
      message: 'You have already clocked out for today.',
      data: record
    });
  }

  const now = new Date();
  record.clockOut = now.toISOString();

  // Compute duration in hours
  const start = new Date(record.clockIn);
  const diffMs = Math.max(0, now - start);
  const hours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
  record.totalHours = hours;

  if (hours < 4 && record.status === 'Present') {
    record.status = 'Half Day';
  }

  saveStore();

  res.json({
    success: true,
    data: record,
    message: `Clocked out successfully. Total shift duration: ${hours} hours`
  });
});

// @route   GET /api/attendance
// @desc    Get attendance records (HR = all, Manager = team, Employee = self)
router.get('/', protect, (req, res) => {
  const store = getStore();
  let list = [...store.attendance];

  if (req.user.role === 'employee') {
    list = list.filter(a => a.employeeId === req.user.id);
  } else if (req.user.role === 'manager') {
    const teamMemberIds = store.users
      .filter(u => u.managerId === req.user.id || u.id === req.user.id)
      .map(u => u.id);
    list = list.filter(a => teamMemberIds.includes(a.employeeId));
  }

  const { date, department, status } = req.query;
  if (date) {
    list = list.filter(a => a.date === date);
  }
  if (department && department !== 'All') {
    list = list.filter(a => a.department && a.department.toLowerCase() === department.toLowerCase());
  }
  if (status && status !== 'All') {
    list = list.filter(a => a.status.toLowerCase() === status.toLowerCase());
  }

  // Sort by date descending
  list.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({
    success: true,
    count: list.length,
    data: list
  });
});

// @route   GET /api/attendance/stats
// @desc    Get attendance summary stats for dashboards
router.get('/stats', protect, (req, res) => {
  const store = getStore();
  const today = getTodayDateStr();

  const totalEmployees = store.users.length;
  const todayRecords = store.attendance.filter(a => a.date === today);

  const presentCount = todayRecords.filter(a => a.status === 'Present').length;
  const lateCount = todayRecords.filter(a => a.status === 'Late').length;
  const halfDayCount = todayRecords.filter(a => a.status === 'Half Day').length;

  // People on approved leave today
  const onLeaveToday = store.leaves.filter(l => {
    return l.status === 'Approved' && l.startDate <= today && l.endDate >= today;
  }).length;

  const totalCheckedIn = presentCount + lateCount + halfDayCount;
  const attendanceRate = totalEmployees > 0 ? Math.round((totalCheckedIn / totalEmployees) * 100) : 0;

  res.json({
    success: true,
    data: {
      totalEmployees,
      checkedInToday: totalCheckedIn,
      present: presentCount,
      late: lateCount,
      halfDay: halfDayCount,
      onLeaveToday,
      attendanceRate
    }
  });
});

module.exports = router;
