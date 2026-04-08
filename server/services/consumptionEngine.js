const Holiday = require('../models/Holiday');
const TimetableEntry = require('../models/TimetableEntry');
const RoomAppliance = require('../models/RoomAppliance');
const Room = require('../models/Room');
const Department = require('../models/Department');

/**
 * Determine if a given date is a working lecture day for the room.
 * Rules:
 *  - Saturday (6) and Sunday (0) are always OFF
 *  - If date is in Holiday list → OFF
 *  - If there's a timetable entry for that dayOfWeek → Lecture day (+1h buffer)
 *  - Otherwise → Phantom load day (+0.5h buffer)
 */
async function getDayType(date, roomId, holidaySet) {
  const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
  if (dayOfWeek === 0 || dayOfWeek === 6) return 'off';

  const dateStr = date.toISOString().split('T')[0];
  if (holidaySet.has(dateStr)) return 'off';

  const timetableEntry = await TimetableEntry.findOne({ roomId, dayOfWeek });
  if (timetableEntry) return 'lecture';
  return 'phantom';
}

/**
 * Compute daily kWh for a room on a given day type.
 * @param {Array} appliances - RoomAppliance docs with populated applianceLibraryId
 * @param {string} dayType - 'lecture' | 'phantom' | 'off'
 */
function computeDailyKWh(appliances, dayType) {
  if (dayType === 'off') return 0;
  const bufferHours = dayType === 'lecture' ? 1 : 0.5;
  let totalWh = 0;
  for (const ra of appliances) {
    const powerW = ra.overridePowerW || ra.applianceLibraryId.powerW;
    const qty = ra.quantity;
    // CCTV, routers, servers use base usageHours (24h), not buffered
    const isAlwaysOn = ra.applianceLibraryId.category === 'security' ||
                       ra.applianceLibraryId.category === 'networking' ||
                       ra.usageHours >= 20;
    const hours = isAlwaysOn ? ra.usageHours : Math.min(ra.usageHours + bufferHours, 24);
    totalWh += powerW * qty * hours;
  }
  return +(totalWh / 1000).toFixed(4); // Wh → kWh
}

/**
 * Main function: compute room consumption for a given month/year.
 */
async function computeRoomConsumption(roomId, month, year) {
  const room = await Room.findById(roomId).populate('departmentId');
  if (!room) return null;
  const dept = room.departmentId;

  // Load appliances
  const appliances = await RoomAppliance.find({ roomId, isActive: true })
    .populate('applianceLibraryId', 'name powerW category');

  // Load holidays for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);
  const holidayDocs = await Holiday.find({ date: { $gte: startDate, $lt: endDate } });
  const holidaySet = new Set(holidayDocs.map(h => h.date.toISOString().split('T')[0]));

  // Iterate days in month
  const dailyData = [];
  let totalKWh = 0;
  let lectureDays = 0, phantomDays = 0, offDays = 0;

  for (let day = 1; day <= new Date(year, month, 0).getDate(); day++) {
    const date = new Date(year, month - 1, day);
    const dayType = await getDayType(date, roomId, holidaySet);
    const kWh = computeDailyKWh(appliances, dayType);
    totalKWh += kWh;
    dailyData.push({ date: date.toISOString().split('T')[0], dayType, kWh });
    if (dayType === 'lecture') lectureDays++;
    else if (dayType === 'phantom') phantomDays++;
    else offDays++;
  }

  const tariff = dept?.tariffPerUnit || 7.5;
  const totalCost = +(totalKWh * tariff).toFixed(2);

  // Per-appliance breakdown
  const applianceBreakdown = appliances.map(ra => {
    const powerW = ra.overridePowerW || ra.applianceLibraryId.powerW;
    const kWh = +((powerW * ra.quantity * ra.usageHours * (lectureDays + phantomDays)) / 1000).toFixed(2);
    return {
      name: ra.applianceLibraryId.name,
      category: ra.applianceLibraryId.category,
      powerW, quantity: ra.quantity, usageHours: ra.usageHours, kWh,
      cost: +(kWh * tariff).toFixed(2)
    };
  });

  return {
    roomId, roomName: room.name, month, year,
    tariff,
    totalKWh: +totalKWh.toFixed(3), totalCost,
    workingDays: lectureDays + phantomDays, lectureDays, phantomDays, offDays,
    dailyData, applianceBreakdown
  };
}

module.exports = { computeRoomConsumption };
