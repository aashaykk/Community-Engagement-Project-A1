const mongoose = require('mongoose');

// Immutable monthly snapshot of a room's appliance config & billing
const BillingSnapshotSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  month: { type: Number, required: true },  // 1-12
  year: { type: Number, required: true },
  snapshotData: { type: mongoose.Schema.Types.Mixed }, // frozen appliance list
  workingDays: { type: Number },
  totalKWh: { type: Number },
  totalCost: { type: Number },
  tariffUsed: { type: Number }
}, { timestamps: true });

BillingSnapshotSchema.index({ roomId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('BillingSnapshot', BillingSnapshotSchema);
