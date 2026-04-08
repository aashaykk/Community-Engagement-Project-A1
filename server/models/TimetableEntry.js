const mongoose = require('mongoose');

// Per-room weekly timetable (HOD configures lecture slots)
const TimetableEntrySchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  // dayOfWeek: 0=Sun, 1=Mon, ..., 6=Sat
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
  startTime: { type: String, required: true }, // "08:00"
  endTime: { type: String, required: true },   // "17:00"
  label: { type: String, default: 'Lecture' },
  semesterLabel: { type: String }              // e.g., "Sem V 2025-26"
}, { timestamps: true });

module.exports = mongoose.model('TimetableEntry', TimetableEntrySchema);
