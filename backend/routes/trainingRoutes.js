const express = require('express');
const router = express.Router();
const { getStore, saveStore } = require('../dataStore');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/trainings
// @desc    Get training programs
router.get('/', protect, (req, res) => {
  const store = getStore();
  let list = [...store.trainings];

  // If employee, highlight their enrollment status
  if (req.user.role === 'employee') {
    list = list.filter(t => 
      t.enrolledEmployees.some(e => e.employeeId === req.user.id) ||
      t.department === 'All' ||
      t.department === req.user.department
    );
  } else if (req.user.role === 'manager') {
    // Show programs assigned by this manager or in their department
    list = list.filter(t => 
      t.assignedBy === req.user.name ||
      t.department === req.user.department ||
      t.department === 'All' ||
      t.department === 'Management'
    );
  }
  // HR gets all programs

  res.json({
    success: true,
    count: list.length,
    data: list
  });
});

// @route   POST /api/trainings
// @desc    Create a new training program & assign members (Manager or HR)
router.post('/', protect, (req, res) => {
  if (req.user.role !== 'manager' && req.user.role !== 'hr') {
    return res.status(403).json({ success: false, message: 'Only Managers and HR can create training programs' });
  }

  const { title, description, category, duration, deadline, department, employeeIds } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Training title and description are required' });
  }

  const store = getStore();
  let enrolledEmployees = [];

  if (Array.isArray(employeeIds) && employeeIds.length > 0) {
    enrolledEmployees = employeeIds.map(id => {
      const u = store.users.find(usr => usr.id === id);
      return {
        employeeId: id,
        employeeName: u ? u.name : 'Team Member',
        progress: 0,
        status: 'Not Started',
        completedAt: null
      };
    });
  } else {
    // Auto enroll team members of this department/manager
    const targets = store.users.filter(u => 
      u.role === 'employee' && (department === 'All' || u.department === (department || req.user.department))
    );
    enrolledEmployees = targets.map(u => ({
      employeeId: u.id,
      employeeName: u.name,
      progress: 0,
      status: 'Not Started',
      completedAt: null
    }));
  }

  const newProgram = {
    id: `trn-${Date.now()}`,
    title,
    description,
    category: category || 'Technical',
    duration: duration || '3 Weeks',
    deadline: deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    assignedBy: req.user.name,
    assignedRole: req.user.designation || (req.user.role === 'manager' ? 'Engineering Manager' : 'HR Lead'),
    department: department || req.user.department,
    enrolledEmployees
  };

  store.trainings.unshift(newProgram);
  saveStore();

  res.status(201).json({
    success: true,
    data: newProgram,
    message: 'Training and development program launched successfully'
  });
});

// @route   PUT /api/trainings/:id/progress
// @desc    Update progress or complete training module
router.put('/:id/progress', protect, (req, res) => {
  const store = getStore();
  const program = store.trainings.find(t => t.id === req.params.id);

  if (!program) {
    return res.status(404).json({ success: false, message: 'Training program not found' });
  }

  const { employeeId, progress } = req.body;
  const targetId = employeeId || req.user.id;

  let enrollment = program.enrolledEmployees.find(e => e.employeeId === targetId);

  if (!enrollment) {
    // Enroll if not already
    enrollment = {
      employeeId: targetId,
      employeeName: req.user.name,
      progress: 0,
      status: 'In Progress',
      completedAt: null
    };
    program.enrolledEmployees.push(enrollment);
  }

  const newProgress = Math.min(100, Math.max(0, Number(progress) || 0));
  enrollment.progress = newProgress;

  if (newProgress >= 100) {
    enrollment.status = 'Completed';
    enrollment.completedAt = new Date().toISOString();
  } else if (newProgress > 0) {
    enrollment.status = 'In Progress';
    enrollment.completedAt = null;
  } else {
    enrollment.status = 'Not Started';
    enrollment.completedAt = null;
  }

  saveStore();

  res.json({
    success: true,
    data: program,
    message: `Training progress updated to ${newProgress}%`
  });
});

// @route   DELETE /api/trainings/:id
// @desc    Delete training program
router.delete('/:id', protect, (req, res) => {
  if (req.user.role !== 'hr' && req.user.role !== 'manager') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const store = getStore();
  const index = store.trainings.findIndex(t => t.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Training program not found' });
  }

  const removed = store.trainings.splice(index, 1)[0];
  saveStore();

  res.json({
    success: true,
    data: { id: removed.id },
    message: 'Training program removed successfully'
  });
});

module.exports = router;
