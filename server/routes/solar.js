const router = require('express').Router();
const { computeSolarScore } = require('../services/solarService');
const { protect } = require('../middleware/auth');

// GET /api/solar/score/:roomId
router.get('/score/:roomId', protect, async (req, res) => {
  const { month, year } = req.query;
  const result = await computeSolarScore(req.params.roomId, Number(month), Number(year));
  res.json(result);
});

// GET /api/solar/payback/:roomId
router.get('/payback/:roomId', protect, async (req, res) => {
  const { month, year, panelCapacityKW } = req.query;
  const result = await computeSolarScore(req.params.roomId, Number(month), Number(year), Number(panelCapacityKW));
  const yearlyData = [];
  const annualSaving = result.annualSavingINR;
  const totalCost = result.panelCostINR;
  for (let y = 0; y <= 20; y++) {
    yearlyData.push({ year: y, cumulativeSaving: +(annualSaving * y).toFixed(2), investment: totalCost });
  }
  res.json({ ...result, paybackTimeline: yearlyData });
});

// GET /api/solar/department/:departmentId
router.get('/department/:departmentId', protect, async (req, res) => {
  const Room = require('../models/Room');
  const rooms = await Room.find({ departmentId: req.params.departmentId });
  const scores = await Promise.all(rooms.map(r => computeSolarScore(r._id, new Date().getMonth() + 1, new Date().getFullYear())));
  const ranked = scores.filter(s => s).sort((a, b) => b.sps - a.sps);
  res.json(ranked);
});

module.exports = router;
