const router = require('express').Router();
const FaultLog = require('../models/FaultLog');
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/auth');

router.get('/room/:roomId', protect, async (req, res) => {
  const faults = await FaultLog.find({ roomId: req.params.roomId })
    .populate('reportedBy', 'name')
    .populate('applianceId', 'name')
    .sort('-createdAt');
  res.json(faults);
});

router.post('/', protect, async (req, res) => {
  const fault = await FaultLog.create({ ...req.body, reportedBy: req.user._id });
  await AuditLog.create({ action: 'LOG_FAULT', performedBy: req.user._id, targetType: 'FaultLog', targetId: fault._id, newValue: req.body });
  res.status(201).json(fault);
});

router.put('/:id', protect, authorize('admin', 'hod'), async (req, res) => {
  const old = await FaultLog.findById(req.params.id);
  if (req.body.status === 'resolved' && !req.body.resolvedAt) req.body.resolvedAt = new Date();
  const fault = await FaultLog.findByIdAndUpdate(req.params.id, req.body, { new: true });
  await AuditLog.create({ action: 'UPDATE_FAULT', performedBy: req.user._id, targetType: 'FaultLog', targetId: fault._id, oldValue: old, newValue: req.body });
  res.json(fault);
});

// GET /api/faults/correlation/:roomId - fault freq vs kWh correlation
router.get('/correlation/:roomId', protect, async (req, res) => {
  const faults = await FaultLog.find({ roomId: req.params.roomId });
  const faultCount = faults.length;
  const openFaults = faults.filter(f => f.status !== 'resolved').length;
  const totalRepairCost = faults.reduce((sum, f) => sum + (f.repairCost || 0), 0);
  res.json({ roomId: req.params.roomId, totalFaults: faultCount, openFaults, totalRepairCost });
});

module.exports = router;
