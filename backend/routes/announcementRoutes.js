const express = require('express');
const router = express.Router();
const { getStore, saveStore } = require('../dataStore');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/announcements
// @desc    Get all announcements
router.get('/', protect, (req, res) => {
  const store = getStore();
  let list = [...store.announcements];

  const { category, department } = req.query;

  // Filter by department if target is specific
  if (req.user.role === 'employee' || req.user.role === 'manager') {
    list = list.filter(a => a.targetDepartment === 'All' || a.targetDepartment === req.user.department);
  }

  if (category && category !== 'All') {
    list = list.filter(a => a.category.toLowerCase() === category.toLowerCase());
  }

  // Sort pinned first, then by date descending
  list.sort((a, b) => {
    if (a.pinned === b.pinned) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return a.pinned ? -1 : 1;
  });

  res.json({
    success: true,
    count: list.length,
    data: list
  });
});

// @route   POST /api/announcements
// @desc    Create a new announcement (HR only)
router.post('/', protect, authorize('hr'), (req, res) => {
  const { title, content, category, priority, targetDepartment, pinned } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }

  const store = getStore();
  const newNotice = {
    id: `ann-${Date.now()}`,
    title,
    content,
    authorName: req.user.name,
    authorRole: req.user.designation || 'HR Management',
    category: category || 'General',
    priority: priority || 'Normal',
    targetDepartment: targetDepartment || 'All',
    pinned: !!pinned,
    createdAt: new Date().toISOString(),
    acknowledgedBy: [req.user.id]
  };

  store.announcements.unshift(newNotice);
  saveStore();

  res.status(201).json({
    success: true,
    data: newNotice,
    message: 'Announcement broadcasted successfully to staff'
  });
});

// @route   PUT /api/announcements/:id
// @desc    Update or toggle pin for announcement (HR only)
router.put('/:id', protect, authorize('hr'), (req, res) => {
  const store = getStore();
  const notice = store.announcements.find(a => a.id === req.params.id);

  if (!notice) {
    return res.status(404).json({ success: false, message: 'Announcement not found' });
  }

  const { title, content, category, priority, targetDepartment, pinned } = req.body;
  if (title !== undefined) notice.title = title;
  if (content !== undefined) notice.content = content;
  if (category !== undefined) notice.category = category;
  if (priority !== undefined) notice.priority = priority;
  if (targetDepartment !== undefined) notice.targetDepartment = targetDepartment;
  if (pinned !== undefined) notice.pinned = pinned;

  saveStore();

  res.json({
    success: true,
    data: notice,
    message: 'Announcement updated successfully'
  });
});

// @route   DELETE /api/announcements/:id
// @desc    Delete announcement (HR only)
router.delete('/:id', protect, authorize('hr'), (req, res) => {
  const store = getStore();
  const index = store.announcements.findIndex(a => a.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Announcement not found' });
  }

  const removed = store.announcements.splice(index, 1)[0];
  saveStore();

  res.json({
    success: true,
    data: { id: removed.id },
    message: 'Announcement deleted'
  });
});

// @route   POST /api/announcements/:id/acknowledge
// @desc    Acknowledge reading an announcement
router.post('/:id/acknowledge', protect, (req, res) => {
  const store = getStore();
  const notice = store.announcements.find(a => a.id === req.params.id);

  if (!notice) {
    return res.status(404).json({ success: false, message: 'Announcement not found' });
  }

  if (!notice.acknowledgedBy) {
    notice.acknowledgedBy = [];
  }

  if (!notice.acknowledgedBy.includes(req.user.id)) {
    notice.acknowledgedBy.push(req.user.id);
    saveStore();
  }

  res.json({
    success: true,
    data: notice,
    message: 'Announcement acknowledged'
  });
});

module.exports = router;
