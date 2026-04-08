require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Department = require('../models/Department');
const Room = require('../models/Room');
const ApplianceLibrary = require('../models/ApplianceLibrary');
const RoomAppliance = require('../models/RoomAppliance');

const rawData = require('../../data.json');

const categoryMap = {
  'router': 'networking', 'CCTV': 'security', 'AC': 'cooling',
  'Pa mixer amplifier': 'av', 'socket': 'power', 'tubelight': 'lighting',
  'tubelight(circular)': 'lighting', 'fan': 'cooling', 'digital board': 'av',
  'PC': 'computing', 'server': 'computing', 'projector': 'av'
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vjti_energy');
  console.log('✅ Connected to MongoDB');

  // Clear existing
  await Promise.all([
    User.deleteMany(), Department.deleteMany(), Room.deleteMany(),
    ApplianceLibrary.deleteMany(), RoomAppliance.deleteMany()
  ]);
  console.log('🗑️  Cleared existing data');

  // Department
  const dept = await Department.create({
    name: 'Computer Engineering', code: 'CE',
    tariffPerUnit: 7.5, solarPanelCostPerKW: 50000, faultPenalty: 500
  });

  // Users
  const adminPass = await bcrypt.hash('admin123', 12);
  const hodPass   = await bcrypt.hash('hod123', 12);
  const stuPass   = await bcrypt.hash('student123', 12);

  const admin = await User.create({ name: 'Dean Admin', email: 'admin@vjti.ac.in', password: adminPass, role: 'admin' });
  const hod   = await User.create({ name: 'HOD CE', email: 'hod@vjti.ac.in', password: hodPass, role: 'hod', departmentId: dept._id });
  await User.create({ name: 'Student User', email: 'student@vjti.ac.in', password: stuPass, role: 'student', departmentId: dept._id });

  await Department.findByIdAndUpdate(dept._id, { hodId: hod._id });

  // Rooms from data.json
  const roomNames = [...new Set(rawData.map(d => d.room))];
  const roomMap = {};
  for (const name of roomNames) {
    const room = await Room.create({ name, code: name, departmentId: dept._id, type: name.toLowerCase().includes('lab') ? 'lab' : 'classroom' });
    roomMap[name] = room._id;
  }
  console.log(`🏠 Created ${roomNames.length} rooms`);

  // Appliance Library — deduplicated by name
  const applianceMap = {};
  const unique = {};
  for (const d of rawData) {
    if (!unique[d.name]) unique[d.name] = { name: d.name, powerW: d.powerW, category: categoryMap[d.name] || 'other' };
  }
  for (const [name, data] of Object.entries(unique)) {
    const lib = await ApplianceLibrary.create(data);
    applianceMap[name] = lib._id;
  }
  console.log(`⚡ Created ${Object.keys(unique).length} appliances in Central Library`);

  // RoomAppliances — link each row from data.json
  for (const d of rawData) {
    await RoomAppliance.create({
      roomId: roomMap[d.room],
      applianceLibraryId: applianceMap[d.name],
      quantity: d.quantity,
      usageHours: d.usageHours
    });
  }
  console.log(`🔌 Created ${rawData.length} room-appliance assignments`);

  console.log('\n🎉 Seed complete!\n');
  console.log('Demo credentials:');
  console.log('  Admin  → admin@vjti.ac.in  / admin123');
  console.log('  HOD    → hod@vjti.ac.in    / hod123');
  console.log('  Student→ student@vjti.ac.in / student123');

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
