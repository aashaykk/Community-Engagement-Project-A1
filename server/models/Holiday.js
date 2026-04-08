const mongoose = require('mongoose');

const HolidaySchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['national', 'state', 'institute', 'other'], default: 'institute' }
}, { timestamps: true });

module.exports = mongoose.model('Holiday', HolidaySchema);
