const router = require('express').Router();
const Proposal = require('../models/Proposal');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');

// GET /api/proposals
router.get('/', protect, async (req, res) => {
  const filter = {};
  if (req.user.role === 'hod') filter.proposedBy = req.user._id;
  const proposals = await Proposal.find(filter)
    .populate('proposedBy', 'name email')
    .populate('reviewedBy', 'name email')
    .populate('roomId', 'name code')
    .sort('-submittedAt');
  res.json(proposals);
});

// GET /api/proposals/:id
router.get('/:id', protect, async (req, res) => {
  const p = await Proposal.findById(req.params.id)
    .populate('proposedBy', 'name email')
    .populate('reviewedBy', 'name email')
    .populate('roomId', 'name code')
    .populate('comments.author', 'name role');
  if (!p) return res.status(404).json({ message: 'Proposal not found' });
  res.json(p);
});

// POST /api/proposals - HOD submits a change
router.post('/', protect, authorize('hod'), async (req, res) => {
  const { roomId, diff, description } = req.body;
  const proposal = await Proposal.create({ roomId, proposedBy: req.user._id, diff, description });

  // Notify all admins
  const admins = await User.find({ role: 'admin', isActive: true });
  for (const admin of admins) {
    await Notification.create({ userId: admin._id, message: `New proposal submitted for room by ${req.user.name}`, type: 'info', relatedId: proposal._id, relatedModel: 'Proposal' });
  }
  await AuditLog.create({ action: 'SUBMIT_PROPOSAL', performedBy: req.user._id, targetType: 'Proposal', targetId: proposal._id, newValue: { roomId, description } });
  res.status(201).json(proposal);
});

// PUT /api/proposals/:id/review - Admin approves/rejects
router.put('/:id/review', protect, authorize('admin'), async (req, res) => {
  const { status, comment } = req.body;
  if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

  const proposal = await Proposal.findById(req.params.id).populate('proposedBy');
  if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

  proposal.status = status;
  proposal.reviewedBy = req.user._id;
  proposal.reviewedAt = new Date();
  if (comment) proposal.comments.push({ author: req.user._id, text: comment });
  await proposal.save();

  // Notify HOD
  await Notification.create({ userId: proposal.proposedBy._id, message: `Your proposal was ${status} by ${req.user.name}`, type: status === 'approved' ? 'info' : 'warning', relatedId: proposal._id, relatedModel: 'Proposal' });

  // Send email
  try {
    await sendEmail(proposal.proposedBy.email, `Proposal ${status.toUpperCase()}`, `Your proposal for room has been ${status}.\n${comment ? 'Comment: ' + comment : ''}`);
  } catch (e) { console.error('Email failed:', e.message); }

  await AuditLog.create({ action: `PROPOSAL_${status.toUpperCase()}`, performedBy: req.user._id, targetType: 'Proposal', targetId: proposal._id, oldValue: { status: 'pending' }, newValue: { status, comment } });
  res.json(proposal);
});

// PUT /api/proposals/:id/resubmit - HOD edits and resubmits rejected proposal
router.put('/:id/resubmit', protect, authorize('hod'), async (req, res) => {
  const { diff, description } = req.body;
  const proposal = await Proposal.findById(req.params.id);
  if (!proposal || proposal.proposedBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
  if (!['rejected'].includes(proposal.status)) return res.status(400).json({ message: 'Only rejected proposals can be resubmitted' });

  proposal.diff = diff;
  proposal.description = description;
  proposal.status = 'resubmitted';
  proposal.submittedAt = new Date();
  proposal.escalatedAt = null;
  await proposal.save();

  await AuditLog.create({ action: 'RESUBMIT_PROPOSAL', performedBy: req.user._id, targetType: 'Proposal', targetId: proposal._id, newValue: { description } });
  res.json(proposal);
});

// POST /api/proposals/:id/comment
router.post('/:id/comment', protect, async (req, res) => {
  const proposal = await Proposal.findById(req.params.id);
  if (!proposal) return res.status(404).json({ message: 'Not found' });
  proposal.comments.push({ author: req.user._id, text: req.body.text });
  await proposal.save();
  res.json(proposal);
});

module.exports = router;
