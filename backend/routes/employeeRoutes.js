const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getStore, saveStore } = require('../dataStore');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/employees
// @desc    Get all employees with filtering & search
router.get('/', protect, (req, res) => {
  const store = getStore();
  let employees = store.users.map(({ password, ...u }) => u);

  const { search, department, role, status } = req.query;

  if (search) {
    const s = search.toLowerCase();
    employees = employees.filter(e =>
      e.name.toLowerCase().includes(s) ||
      e.email.toLowerCase().includes(s) ||
      e.designation.toLowerCase().includes(s) ||
      e.department.toLowerCase().includes(s)
    );
  }

  if (department && department !== 'All') {
    employees = employees.filter(e => e.department.toLowerCase() === department.toLowerCase());
  }

  if (role && role !== 'All') {
    employees = employees.filter(e => e.role === role);
  }

  if (status && status !== 'All') {
    employees = employees.filter(e => e.status.toLowerCase() === status.toLowerCase());
  }

  res.json({
    success: true,
    count: employees.length,
    data: employees
  });
});

// @route   GET /api/employees/:id
// @desc    Get single employee details
router.get('/:id', protect, (req, res) => {
  const store = getStore();
  const user = store.users.find(u => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  const { password, ...safeUser } = user;
  res.json({
    success: true,
    data: safeUser
  });
});

// @route   POST /api/employees
// @desc    Add a new employee (HR only)
router.post('/', protect, authorize('hr'), (req, res) => {
  const {
    name,
    email,
    password,
    role,
    department,
    designation,
    phone,
    salary,
    managerId,
    address,
    emergencyContact
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required fields' });
  }

  const store = getStore();
  const exists = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(400).json({ success: false, message: 'An employee with this email already exists' });
  }

  const manager = store.users.find(u => u.id === managerId);

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password || 'welcome2026', salt);

  const newEmployee = {
    id: `usr-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: role || 'employee',
    department: department || 'Engineering',
    designation: designation || 'Specialist',
    phone: phone || '+1 (555) 000-0000',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    joinDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    salary: Number(salary) || 80000,
    managerId: managerId || (role === 'manager' ? 'usr-1' : 'usr-2'),
    managerName: manager ? manager.name : (role === 'manager' ? 'Sarah Jenkins' : 'Alex Rivera'),
    emergencyContact: emergencyContact || { name: 'Emergency Contact', relationship: 'Family', phone: '+1 (555) 000-9999' },
    address: address || '123 Tech Way, Suite 400',
    leaveBalance: { casual: 8, sick: 10, annual: 15, maternity: 60 }
  };

  store.users.unshift(newEmployee);
  saveStore();

  const { password: _, ...safeUser } = newEmployee;
  res.status(201).json({
    success: true,
    data: safeUser,
    message: 'Employee record added successfully'
  });
});

// @route   PUT /api/employees/:id
// @desc    Update employee details
router.put('/:id', protect, (req, res) => {
  const store = getStore();
  const index = store.users.findIndex(u => u.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  // Employees can update only their own profile personal info; HR can update everything
  const isSelf = req.user.id === req.params.id;
  const isHR = req.user.role === 'hr';

  if (!isSelf && !isHR) {
    return res.status(403).json({ success: false, message: 'Not authorized to modify this profile' });
  }

  const current = store.users[index];

  if (isHR) {
    // HR can update all fields
    const updated = {
      ...current,
      ...req.body,
      id: current.id, // prevent ID change
      email: req.body.email ? req.body.email.toLowerCase() : current.email
    };
    if (req.body.password) {
      const salt = bcrypt.genSaltSync(10);
      updated.password = bcrypt.hashSync(req.body.password, salt);
    }
    store.users[index] = updated;
  } else {
    // Employee updating self
    store.users[index] = {
      ...current,
      phone: req.body.phone !== undefined ? req.body.phone : current.phone,
      address: req.body.address !== undefined ? req.body.address : current.address,
      emergencyContact: req.body.emergencyContact || current.emergencyContact,
      avatar: req.body.avatar || current.avatar
    };
  }

  saveStore();
  const { password: _, ...safeUser } = store.users[index];

  res.json({
    success: true,
    data: safeUser,
    message: 'Profile updated successfully'
  });
});

// @route   DELETE /api/employees/:id
// @desc    Delete employee (HR only)
router.delete('/:id', protect, authorize('hr'), (req, res) => {
  const store = getStore();
  const index = store.users.findIndex(u => u.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  // Prevent deleting oneself
  if (req.params.id === req.user.id) {
    return res.status(400).json({ success: false, message: 'Cannot delete your own active HR profile' });
  }

  const removed = store.users.splice(index, 1)[0];
  saveStore();

  res.json({
    success: true,
    data: { id: removed.id, name: removed.name },
    message: `Employee ${removed.name} has been removed`
  });
});

module.exports = router;
