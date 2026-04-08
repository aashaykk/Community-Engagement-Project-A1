const router = require('express').Router();
const Room = require('../models/Room');
const AuditLog = require('../models/AuditLog');
const { computeRoomConsumption } = require('../services/consumptionEngine');
const { protect, authorize } = require('../middleware/auth');

// GET /api/rooms - scoped by department for HOD
router.get('/', protect, async (req, res) => {
  const filter = {};
  if (req.user.role === 'hod') filter.departmentId = req.user.departmentId;
  const rooms = await Room.find(filter).populate('departmentId', 'name code tariffPerUnit');
  res.json(rooms);
});

router.post('/', protect, authorize('admin', 'hod'), async (req, res) => {
  if (req.user.role === 'hod') req.body.departmentId = req.user.departmentId;
  const room = await Room.create(req.body);
  await AuditLog.create({ action: 'CREATE_ROOM', performedBy: req.user._id, targetType: 'Room', targetId: room._id, newValue: req.body });
  res.status(201).json(room);
});

router.put('/:id', protect, authorize('admin', 'hod'), async (req, res) => {
  const old = await Room.findById(req.params.id);
  const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
  await AuditLog.create({ action: 'UPDATE_ROOM', performedBy: req.user._id, targetType: 'Room', targetId: room._id, oldValue: old, newValue: req.body });
  res.json(room);
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await Room.findByIdAndDelete(req.params.id);
  await AuditLog.create({ action: 'DELETE_ROOM', performedBy: req.user._id, targetType: 'Room', targetId: req.params.id });
  res.json({ message: 'Room deleted' });
});

// GET /api/rooms/:id/consumption?month=4&year=2026
router.get('/:id/consumption', protect, async (req, res) => {
  const { month, year } = req.query;
  const result = await computeRoomConsumption(req.params.id, Number(month), Number(year));
  res.json(result);
});

module.exports = router;
