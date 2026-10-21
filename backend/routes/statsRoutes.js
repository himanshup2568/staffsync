const express = require('express');
const router = express.Router();
const { getStore } = require('../dataStore');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, (req, res) => {
  const store = getStore();
  const today = new Date().toISOString().split('T')[0];

  const user = req.user;
  const role = user.role;

  // Compute common stats
  const totalEmployees = store.users.length;
  const departments = [...new Set(store.users.map(u => u.department))];

  // Department counts
  const deptDistribution = departments.map(dept => ({
    name: dept,
    count: store.users.filter(u => u.department === dept).length
  }));

  // Today attendance
  const todayAtt = store.attendance.filter(a => a.date === today);
  const presentToday = todayAtt.filter(a => a.status === 'Present').length;
  const lateToday = todayAtt.filter(a => a.status === 'Late').length;
  const halfDayToday = todayAtt.filter(a => a.status === 'Half Day').length;
  const checkedInToday = presentToday + lateToday + halfDayToday;

  // Leaves
  const pendingLeavesAll = store.leaves.filter(l => l.status === 'Pending');
  const onLeaveToday = store.leaves.filter(
    l => l.status === 'Approved' && l.startDate <= today && l.endDate >= today
  ).length;

  // Trainings
  const allTrainings = store.trainings;
  const totalEnrollments = allTrainings.reduce((acc, t) => acc + t.enrolledEmployees.length, 0);
  const completedTrainings = allTrainings.reduce(
    (acc, t) => acc + t.enrolledEmployees.filter(e => e.status === 'Completed').length,
    0
  );
  const trainingCompletionRate = totalEnrollments > 0 ? Math.round((completedTrainings / totalEnrollments) * 100) : 0;

  // Announcements
  const recentAnnouncements = store.announcements.slice(0, 5);

  let roleSpecific = {};

  if (role === 'hr') {
    roleSpecific = {
      totalEmployees,
      checkedInToday,
      presentToday,
      lateToday,
      halfDayToday,
      onLeaveToday,
      attendanceRate: totalEmployees > 0 ? Math.round((checkedInToday / totalEmployees) * 100) : 0,
      pendingLeaveApprovals: pendingLeavesAll.length,
      deptDistribution,
      activePrograms: allTrainings.length,
      trainingCompletionRate
    };
  } else if (role === 'manager') {
    const teamMembers = store.users.filter(u => u.managerId === user.id || u.id === user.id);
    const teamIds = teamMembers.map(u => u.id);
    const teamCheckedIn = todayAtt.filter(a => teamIds.includes(a.employeeId)).length;
    const teamPendingLeaves = pendingLeavesAll.filter(l => teamIds.includes(l.employeeId));

    // Team trainings
    const teamTrainings = allTrainings.filter(t => t.assignedBy === user.name || t.department === user.department);
    let teamEnrollmentCount = 0;
    let teamCompletedCount = 0;
    teamTrainings.forEach(t => {
      const relevant = t.enrolledEmployees.filter(e => teamIds.includes(e.employeeId));
      teamEnrollmentCount += relevant.length;
      teamCompletedCount += relevant.filter(e => e.status === 'Completed').length;
    });

    roleSpecific = {
      teamSize: teamMembers.length,
      teamCheckedIn,
      teamAttendanceRate: teamMembers.length > 0 ? Math.round((teamCheckedIn / teamMembers.length) * 100) : 0,
      teamPendingLeaves: teamPendingLeaves.length,
      managedPrograms: teamTrainings.length,
      teamTrainingRate: teamEnrollmentCount > 0 ? Math.round((teamCompletedCount / teamEnrollmentCount) * 100) : 0
    };
  } else {
    // Employee
    const myTodayRecord = todayAtt.find(a => a.employeeId === user.id);
    const myLeaves = store.leaves.filter(l => l.employeeId === user.id);
    const myTrainings = allTrainings.filter(t => t.enrolledEmployees.some(e => e.employeeId === user.id));

    roleSpecific = {
      todayAttendance: myTodayRecord || null,
      isClockedIn: !!(myTodayRecord && myTodayRecord.clockIn && !myTodayRecord.clockOut),
      isClockedOut: !!(myTodayRecord && myTodayRecord.clockOut),
      leaveBalance: user.leaveBalance || { casual: 8, sick: 10, annual: 15, maternity: 60 },
      myPendingLeaves: myLeaves.filter(l => l.status === 'Pending').length,
      myActiveTrainings: myTrainings.length,
      completedTrainingsCount: myTrainings.filter(t => {
        const en = t.enrolledEmployees.find(e => e.employeeId === user.id);
        return en && en.status === 'Completed';
      }).length
    };
  }

  res.json({
    success: true,
    data: {
      role,
      user,
      stats: roleSpecific,
      recentAnnouncements,
      today
    }
  });
});

module.exports = router;
