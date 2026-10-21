const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getStore, saveStore } = require('../dataStore');
const { protect, JWT_SECRET } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide both email and password' });
  }

  const store = getStore();
  const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials. User does not exist.' });
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
  }

  const token = generateToken(user.id);
  const { password: _, ...safeUser } = user;

  res.json({
    success: true,
    token,
    user: safeUser,
    message: `Welcome back, ${user.name}!`
  });
});

// @route   POST /api/auth/register
// @desc    Register a new user (HR can also register team members)
router.post('/register', (req, res) => {
  const { name, email, password, role, department, designation, phone, salary } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }

  const store = getStore();
  const existing = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already registered in system' });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const newUser = {
    id: `usr-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: role || 'employee',
    department: department || 'Engineering',
    designation: designation || 'Associate Specialist',
    phone: phone || '+1 (555) 000-0000',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    joinDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    salary: Number(salary) || 75000,
    managerId: role === 'manager' ? 'usr-1' : 'usr-2',
    managerName: role === 'manager' ? 'Sarah Jenkins' : 'Alex Rivera',
    emergencyContact: { name: 'Emergency Contact', relationship: 'Family', phone: '+1 (555) 111-2222' },
    address: 'City Center, Tech District',
    leaveBalance: { casual: 8, sick: 10, annual: 15, maternity: 60 }
  };

  store.users.push(newUser);
  saveStore();

  const token = generateToken(newUser.id);
  const { password: _, ...safeUser } = newUser;

  res.status(201).json({
    success: true,
    token,
    user: safeUser,
    message: 'User registered successfully!'
  });
});

// @route   GET /api/auth/me
// @desc    Get currently logged in user profile
router.get('/me', protect, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// @route   POST /api/auth/demo-switch
// @desc    Fast role switch for demo / testing
router.post('/demo-switch', (req, res) => {
  const { role } = req.body; // 'hr', 'manager', 'employee'
  const store = getStore();

  const user = store.users.find(u => u.role === role);
  if (!user) {
    return res.status(404).json({ success: false, message: `No demo user found for role: ${role}` });
  }

  const token = generateToken(user.id);
  const { password: _, ...safeUser } = user;

  res.json({
    success: true,
    token,
    user: safeUser,
    message: `Switched active session to demo ${role.toUpperCase()}: ${user.name}`
  });
});

module.exports = router;
