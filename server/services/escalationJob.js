const cron = require('node-cron');
const Proposal = require('../models/Proposal');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail } = require('./emailService');

// Run every hour
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const h72 = new Date(now - 72 * 60 * 60 * 1000);
    const d7  = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const admins = await User.find({ role: 'admin', isActive: true });

    // 72h escalation — notify admin once
    const pending72 = await Proposal.find({
      status: { $in: ['pending', 'resubmitted'] },
      submittedAt: { $lte: h72 },
      escalatedAt: null
    }).populate('proposedBy', 'name email').populate('roomId', 'name');

    for (const p of pending72) {
      p.escalatedAt = now;
      await p.save();
      for (const admin of admins) {
        await Notification.create({
          userId: admin._id,
          message: `⚠️ Proposal by ${p.proposedBy.name} for ${p.roomId?.name} has been pending >72h`,
          type: 'escalation', relatedId: p._id, relatedModel: 'Proposal'
        });
        try {
          await sendEmail(admin.email, '⚠️ Proposal Pending >72 Hours',
            `A proposal submitted by ${p.proposedBy.name} for room "${p.roomId?.name}" has been pending for more than 72 hours. Please review it.`);
        } catch (e) { console.error('[Escalation Email]', e.message); }
      }
    }

    // 7-day → mark Urgent
    const pending7d = await Proposal.find({
      status: { $in: ['pending', 'resubmitted'] },
      submittedAt: { $lte: d7 }
    }).populate('proposedBy', 'name email').populate('roomId', 'name');

    for (const p of pending7d) {
      if (p.status !== 'urgent') {
        p.status = 'urgent';
        await p.save();
        for (const admin of admins) {
          await Notification.create({
            userId: admin._id,
            message: `🚨 URGENT: Proposal by ${p.proposedBy.name} marked "Urgent Action Required" (>7 days)`,
            type: 'escalation', relatedId: p._id, relatedModel: 'Proposal'
          });
          try {
            await sendEmail(admin.email, '🚨 Urgent Action Required — Proposal >7 Days',
              `Proposal by ${p.proposedBy.name} for room "${p.roomId?.name}" is now marked URGENT ACTION REQUIRED (>7 days pending)`);
          } catch (e) { console.error('[Urgent Email]', e.message); }
        }
      }
    }

    if (pending72.length || pending7d.length) {
      console.log(`[Escalation] Processed ${pending72.length} 72h + ${pending7d.length} 7-day escalations`);
    }
  } catch (err) {
    console.error('[Escalation Cron Error]', err.message);
  }
});

console.log('✅ Escalation cron job registered (runs hourly)');
