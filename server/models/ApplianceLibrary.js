const mongoose = require('mongoose');

// Central Appliance Library — updates propagate to RoomAppliances
const ApplianceLibrarySchema = new mongoose.Schema({
  name: { type: String, required: true },
  powerW: { type: Number, required: true },
  category: {
    type: String,
    enum: ['lighting', 'cooling', 'computing', 'av', 'security', 'power', 'networking', 'other'],
    default: 'other'
  },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ApplianceLibrary', ApplianceLibrarySchema);
