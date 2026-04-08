const router = require('express').Router();
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), async (req, res) => {
  const { targetType, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (targetType) filter.targetType = targetType;
  const logs = await AuditLog.find(filter)
    .populate('performedBy', 'name email role')
    .sort('-timestamp')
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await AuditLog.countDocuments(filter);
  res.json({ logs, total, page: Number(page), pages: Math.ceil(total / limit) });
});

module.exports = router;
