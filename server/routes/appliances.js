const router = require('express').Router();
const ApplianceLibrary = require('../models/ApplianceLibrary');
const RoomAppliance = require('../models/RoomAppliance');
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/auth');
const { propagateLibraryUpdate } = require('../services/propagationService');

// --- Central Library ---
router.get('/library', protect, async (req, res) => {
  const items = await ApplianceLibrary.find().sort('name');
  res.json(items);
});

router.post('/library', protect, authorize('admin', 'hod'), async (req, res) => {
  const item = await ApplianceLibrary.create(req.body);
  await AuditLog.create({ action: 'CREATE_APPLIANCE_LIBRARY', performedBy: req.user._id, targetType: 'ApplianceLibrary', targetId: item._id, newValue: req.body });
  res.status(201).json(item);
});

router.put('/library/:id', protect, authorize('admin', 'hod'), async (req, res) => {
  const old = await ApplianceLibrary.findById(req.params.id);
  const item = await ApplianceLibrary.findByIdAndUpdate(req.params.id, req.body, { new: true });
  // Propagate wattage change to all room appliances that haven't overridden
  if (req.body.powerW && req.body.powerW !== old.powerW) {
    await propagateLibraryUpdate(req.params.id, req.body.powerW);
  }
  await AuditLog.create({ action: 'UPDATE_APPLIANCE_LIBRARY', performedBy: req.user._id, targetType: 'ApplianceLibrary', targetId: item._id, oldValue: old, newValue: req.body });
  res.json(item);
});

// --- Room Appliances ---
router.get('/room/:roomId', protect, async (req, res) => {
  const appliances = await RoomAppliance.find({ roomId: req.params.roomId, isActive: true })
    .populate('applianceLibraryId', 'name powerW category');
  res.json(appliances);
});

router.post('/room/:roomId', protect, authorize('admin', 'hod'), async (req, res) => {
  const ra = await RoomAppliance.create({ roomId: req.params.roomId, ...req.body });
  await AuditLog.create({ action: 'ADD_ROOM_APPLIANCE', performedBy: req.user._id, targetType: 'RoomAppliance', targetId: ra._id, newValue: req.body });
  res.status(201).json(ra);
});

router.put('/room/:roomId/:id', protect, authorize('admin', 'hod'), async (req, res) => {
  const old = await RoomAppliance.findById(req.params.id);
  const ra = await RoomAppliance.findByIdAndUpdate(req.params.id, req.body, { new: true });
  await AuditLog.create({ action: 'UPDATE_ROOM_APPLIANCE', performedBy: req.user._id, targetType: 'RoomAppliance', targetId: ra._id, oldValue: old, newValue: req.body });
  res.json(ra);
});

router.delete('/room/:roomId/:id', protect, authorize('admin', 'hod'), async (req, res) => {
  await RoomAppliance.findByIdAndUpdate(req.params.id, { isActive: false });
  await AuditLog.create({ action: 'REMOVE_ROOM_APPLIANCE', performedBy: req.user._id, targetType: 'RoomAppliance', targetId: req.params.id });
  res.json({ message: 'Appliance removed from room' });
});

module.exports = router;
