const router = require('express').Router();
const TimetableEntry = require('../models/TimetableEntry');
const { protect, authorize } = require('../middleware/auth');

router.get('/:roomId', protect, async (req, res) => {
  const entries = await TimetableEntry.find({ roomId: req.params.roomId }).sort('dayOfWeek startTime');
  res.json(entries);
});

router.post('/:roomId', protect, authorize('admin', 'hod'), async (req, res) => {
  const entry = await TimetableEntry.create({ roomId: req.params.roomId, ...req.body });
  res.status(201).json(entry);
});

router.put('/:roomId/:id', protect, authorize('admin', 'hod'), async (req, res) => {
  const entry = await TimetableEntry.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(entry);
});

router.delete('/:roomId/:id', protect, authorize('admin', 'hod'), async (req, res) => {
  await TimetableEntry.findByIdAndDelete(req.params.id);
  res.json({ message: 'Timetable entry deleted' });
});

module.exports = router;
