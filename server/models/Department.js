const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  hodId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  tariffPerUnit: { type: Number, default: 7.5, comment: 'INR per kWh' },
  solarPanelCostPerKW: { type: Number, default: 50000, comment: 'INR per kW installed' },
  faultPenalty: { type: Number, default: 500, comment: 'INR per fault event' }
}, { timestamps: true });

module.exports = mongoose.model('Department', DepartmentSchema);
