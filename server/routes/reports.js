const router = require('express').Router();
const { computeRoomConsumption } = require('../services/consumptionEngine');
const Room = require('../models/Room');
const { protect } = require('../middleware/auth');

// GET /api/reports/csv/room/:roomId?month=4&year=2026
router.get('/csv/room/:roomId', protect, async (req, res) => {
  const { month, year } = req.query;
  const m = Number(month) || new Date().getMonth() + 1;
  const y = Number(year) || new Date().getFullYear();
  const data = await computeRoomConsumption(req.params.roomId, m, y);
  if (!data) return res.status(404).json({ message: 'No data found' });

  let csv = 'Appliance,Category,Power(W),Quantity,UsageHours,Monthly kWh,Monthly Cost (INR)\r\n';
  for (const a of data.applianceBreakdown) {
    csv += `"${a.name}","${a.category}",${a.powerW},${a.quantity},${a.usageHours},${a.kWh},${a.cost}\r\n`;
  }
  csv += `\r\nTOTAL,,,,,${data.totalKWh},${data.totalCost}\r\n`;
  csv += `Working Days: ${data.workingDays} (Lecture: ${data.lectureDays} | Phantom: ${data.phantomDays} | Off: ${data.offDays})\r\n`;
  csv += `Tariff Used: ₹${data.tariff}/kWh\r\n`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${data.roomName}-${y}-${m}.csv"`);
  res.send(csv);
});

// GET /api/reports/csv/department/:departmentId?month=4&year=2026
router.get('/csv/department/:departmentId', protect, async (req, res) => {
  const { month, year } = req.query;
  const m = Number(month) || new Date().getMonth() + 1;
  const y = Number(year) || new Date().getFullYear();
  const rooms = await Room.find({ departmentId: req.params.departmentId });
  const results = await Promise.all(rooms.map(r => computeRoomConsumption(r._id, m, y)));

  let csv = 'Room,Working Days,Total kWh,Total Cost (INR)\r\n';
  let grandKWh = 0, grandCost = 0;
  for (const r of results.filter(Boolean)) {
    csv += `"${r.roomName}",${r.workingDays},${r.totalKWh},${r.totalCost}\r\n`;
    grandKWh += r.totalKWh;
    grandCost += r.totalCost;
  }
  csv += `\r\nGRAND TOTAL,,,${grandKWh.toFixed(3)},${grandCost.toFixed(2)}\r\n`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="dept-${req.params.departmentId}-${y}-${m}.csv"`);
  res.send(csv);
});

module.exports = router;
