const mongoose = require('mongoose');

const FaultLogSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  applianceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApplianceLibrary' },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
  resolvedAt: { type: Date, default: null },
  repairCost: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('FaultLog', FaultLogSchema);
