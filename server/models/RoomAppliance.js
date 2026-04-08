const mongoose = require('mongoose');

// Room-level appliance assignment (references Central Library)
const RoomApplianceSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  applianceLibraryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApplianceLibrary', required: true },
  quantity: { type: Number, required: true, default: 1 },
  usageHours: { type: Number, required: true, comment: 'Base daily usage hours' },
  overridePowerW: { type: Number, default: null, comment: 'If set, overrides library powerW for this room' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('RoomAppliance', RoomApplianceSchema);
