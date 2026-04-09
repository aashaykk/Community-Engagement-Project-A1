const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String }, // e.g., AL001
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  floor: { type: String },
  type: { type: String, enum: ['classroom', 'lab', 'office', 'common', 'other'], default: 'classroom' },
  area_sqm: { type: Number },
  installedSolarKW: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);
