const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'alert', 'escalation'], default: 'info' },
  relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
  relatedModel: { type: String, default: null },
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
