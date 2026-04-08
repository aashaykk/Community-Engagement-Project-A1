const cron = require('node-cron');
const Room = require('../models/Room');
const BillingSnapshot = require('../models/BillingSnapshot');
const { computeRoomConsumption } = require('./consumptionEngine');

// Run on the 1st of every month at 00:05
cron.schedule('5 0 1 * *', async () => {
  try {
    const now = new Date();
    // Snapshot for the previous month
    const month = now.getMonth() === 0 ? 12 : now.getMonth();
    const year  = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

    const rooms = await Room.find();
    let created = 0;
    for (const room of rooms) {
      const existing = await BillingSnapshot.findOne({ roomId: room._id, month, year });
      if (existing) continue;

      const data = await computeRoomConsumption(room._id, month, year);
      if (!data) continue;

      await BillingSnapshot.create({
        roomId: room._id, month, year,
        snapshotData: data.applianceBreakdown,
        workingDays: data.workingDays,
        totalKWh: data.totalKWh,
        totalCost: data.totalCost,
        tariffUsed: data.tariff
      });
      created++;
    }
    console.log(`[Snapshot] Created ${created} billing snapshots for ${month}/${year}`);
  } catch (err) {
    console.error('[Snapshot Cron Error]', err.message);
  }
});

console.log('✅ Billing snapshot cron registered (1st of every month at 00:05)');
