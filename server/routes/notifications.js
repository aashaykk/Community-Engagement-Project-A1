const router = require('express').Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  const notes = await Notification.find({ userId: req.user._id }).sort('-createdAt').limit(50);
  res.json(notes);
});

router.put('/:id/read', protect, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ message: 'Marked as read' });
});

router.put('/read-all', protect, async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
  res.json({ message: 'All marked as read' });
});

module.exports = router;
