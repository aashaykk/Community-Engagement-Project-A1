const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/auth');

// GET /api/users
router.get('/', protect, authorize('admin'), async (req, res) => {
  const users = await User.find().populate('departmentId', 'name code').select('-password');
  res.json(users);
});

// POST /api/users
router.post('/', protect, authorize('admin'), async (req, res) => {
  const { name, email, password, role, departmentId } = req.body;
  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashed, role, departmentId });
  await AuditLog.create({ action: 'CREATE_USER', performedBy: req.user._id, targetType: 'User', targetId: user._id, newValue: { name, email, role } });
  res.status(201).json(user);
});

// PUT /api/users/:id
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  const old = await User.findById(req.params.id).select('-password');
  const { password, ...updates } = req.body;
  if (password) updates.password = await bcrypt.hash(password, 12);
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
  await AuditLog.create({ action: 'UPDATE_USER', performedBy: req.user._id, targetType: 'User', targetId: user._id, oldValue: old, newValue: updates });
  res.json(user);
});

// DELETE /api/users/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isActive: false });
  await AuditLog.create({ action: 'DEACTIVATE_USER', performedBy: req.user._id, targetType: 'User', targetId: req.params.id });
  res.json({ message: 'User deactivated' });
});

module.exports = router;
