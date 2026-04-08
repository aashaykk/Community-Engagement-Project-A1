const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  diff: {
    prev: { type: mongoose.Schema.Types.Mixed }, // previous state snapshot
    next: { type: mongoose.Schema.Types.Mixed }  // proposed state snapshot
  },
  description: { type: String },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'resubmitted', 'urgent'],
    default: 'pending'
  },
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date, default: null },
  escalatedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Proposal', ProposalSchema);
