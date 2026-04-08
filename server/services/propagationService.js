const RoomAppliance = require('../models/RoomAppliance');

/**
 * When an ApplianceLibrary item's powerW changes, update all RoomAppliances
 * that reference it and have NOT set an override.
 */
async function propagateLibraryUpdate(applianceLibraryId, newPowerW) {
  const result = await RoomAppliance.updateMany(
    { applianceLibraryId, overridePowerW: null, isActive: true },
    { $set: {} } // RoomAppliance reads powerW from library at query time; this is a no-op but logs intent
  );
  // Since powerW is stored in the library and RoomAppliance references it,
  // no actual data needs to change here — queries always join to get powerW.
  console.log(`[Propagation] Library ${applianceLibraryId} updated to ${newPowerW}W — affects ${result.matchedCount} room appliances (no override).`);
  return result;
}

module.exports = { propagateLibraryUpdate };
