const router = require('express').Router();
const { computeRoomConsumption } = require('../services/consumptionEngine');
const BillingSnapshot = require('../models/BillingSnapshot');
const Room = require('../models/Room');
const { protect } = require('../middleware/auth');

// GET /api/consumption/room/:roomId?month=4&year=2026
router.get('/room/:roomId', protect, async (req, res) => {
  const { month, year } = req.query;
  const m = Number(month) || new Date().getMonth() + 1;
  const y = Number(year) || new Date().getFullYear();
  const data = await computeRoomConsumption(req.params.roomId, m, y);
  res.json(data);
});

// GET /api/consumption/snapshot/:roomId?month=4&year=2026
router.get('/snapshot/:roomId', protect, async (req, res) => {
  const { month, year } = req.query;
  const snap = await BillingSnapshot.findOne({ roomId: req.params.roomId, month: Number(month), year: Number(year) });
  if (!snap) return res.status(404).json({ message: 'Snapshot not found for this period' });
  res.json(snap);
});

// GET /api/consumption/department/:departmentId?month=4&year=2026
router.get('/department/:departmentId', protect, async (req, res) => {
  const { month, year } = req.query;
  const m = Number(month) || new Date().getMonth() + 1;
  const y = Number(year) || new Date().getFullYear();
  const rooms = await Room.find({ departmentId: req.params.departmentId });
  const results = await Promise.all(rooms.map(r => computeRoomConsumption(r._id, m, y)));
  const total = results.reduce((s, r) => r ? s + r.totalKWh : s, 0);
  const totalCost = results.reduce((s, r) => r ? s + r.totalCost : s, 0);
  res.json({ departmentId: req.params.departmentId, month: m, year: y, rooms: results, totalKWh: +total.toFixed(3), totalCost: +totalCost.toFixed(2) });
});

// GET /api/consumption/global?month=4&year=2026 (Admin)
router.get('/global', protect, async (req, res) => {
  const { month, year } = req.query;
  const m = Number(month) || new Date().getMonth() + 1;
  const y = Number(year) || new Date().getFullYear();
  const rooms = await Room.find();
  const results = await Promise.all(rooms.map(r => computeRoomConsumption(r._id, m, y)));
  const valid = results.filter(Boolean);
  const total = valid.reduce((s, r) => s + r.totalKWh, 0);
  const totalCost = valid.reduce((s, r) => s + r.totalCost, 0);
  res.json({ month: m, year: y, rooms: valid, totalKWh: +total.toFixed(3), totalCost: +totalCost.toFixed(2) });
});

module.exports = router;
