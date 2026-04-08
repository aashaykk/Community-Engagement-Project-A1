const { computeRoomConsumption } = require('./consumptionEngine');
const FaultLog = require('../models/FaultLog');
const Room = require('../models/Room');
const Department = require('../models/Department');

/**
 * SPS = ((dailyKWh * tariff) + (faultFrequency * penalty)) / panelCost
 */
async function computeSolarScore(roomId, month, year, panelCapacityKW = 5) {
  const consumption = await computeRoomConsumption(roomId, month, year);
  if (!consumption) return null;

  const room = await Room.findById(roomId).populate('departmentId');
  const dept = room?.departmentId;
  const tariff = dept?.tariffPerUnit || 7.5;
  const panelCostPerKW = dept?.solarPanelCostPerKW || 50000;
  const faultPenalty = dept?.faultPenalty || 500;
  const panelCostINR = panelCapacityKW * panelCostPerKW;

  // Working days in the month
  const workingDays = consumption.workingDays || 22;
  const dailyKWh = workingDays > 0 ? consumption.totalKWh / workingDays : 0;

  // Fault frequency (faults per month)
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  const faults = await FaultLog.find({ roomId, createdAt: { $gte: start, $lt: end } });
  const faultFreq = faults.length;

  const sps = +((dailyKWh * tariff + faultFreq * faultPenalty) / panelCostINR).toFixed(6);

  // Payback calculation
  // 1 kW solar generates ~4 kWh/day in Mumbai (avg solar irradiance)
  const dailySolarKWh = panelCapacityKW * 4;
  const dailySavingINR = Math.min(dailySolarKWh, dailyKWh) * tariff;
  const annualSavingINR = +(dailySavingINR * 365).toFixed(2);
  const paybackYears = annualSavingINR > 0 ? +(panelCostINR / annualSavingINR).toFixed(1) : null;

  const isCritical = sps > 0.001; // threshold for "Critical Conversion Candidate"

  return {
    roomId, roomName: consumption.roomName,
    month, year,
    dailyKWh: +dailyKWh.toFixed(3),
    monthlyKWh: consumption.totalKWh,
    monthlyCostINR: consumption.totalCost,
    faultFrequency: faultFreq,
    sps,
    panelCapacityKW, panelCostINR,
    dailySolarKWh: +dailySolarKWh.toFixed(2),
    annualSavingINR,
    paybackYears,
    isCritical,
    rating: sps > 0.002 ? 'High' : sps > 0.0005 ? 'Medium' : 'Low'
  };
}

module.exports = { computeSolarScore };
