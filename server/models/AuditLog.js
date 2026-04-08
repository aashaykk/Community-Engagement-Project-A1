const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g. 'UPDATE_APPLIANCE', 'APPROVE_PROPOSAL'
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String }, // 'Room', 'Appliance', 'Proposal', etc.
  targetId: { type: mongoose.Schema.Types.ObjectId },
  oldValue: { type: mongoose.Schema.Types.Mixed },
  newValue: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  timestamp: { type: Date, default: Date.now }
});

// Immutable — no updates allowed
AuditLogSchema.set('strict', true);

module.exports = mongoose.model('AuditLog', AuditLogSchema);
