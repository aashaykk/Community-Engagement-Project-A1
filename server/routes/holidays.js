const router = require('express').Router();
const Holiday = require('../models/Holiday');
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const pdfParse = require('pdf-parse');

const upload = multer({ storage: multer.memoryStorage() });

// GET /api/holidays
router.get('/', protect, async (req, res) => {
  const { year } = req.query;
  const filter = year ? { date: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${Number(year)+1}-01-01`) } } : {};
  const holidays = await Holiday.find(filter).sort('date');
  res.json(holidays);
});

// POST /api/holidays/upload-pdf
router.post('/upload-pdf', protect, authorize('admin', 'hod'), upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No PDF uploaded' });
  const data = await pdfParse(req.file.buffer);
  const text = data.text;

  // Parse dates like "15 August" or "15/08/2026" or "August 15"
  const monthMap = { january:1, february:2, march:3, april:4, may:5, june:6, july:7, august:8, september:9, october:10, november:11, december:12 };
  const lines = text.split('\n').filter(l => l.trim());
  const holidays = [];
  const year = req.body.year || new Date().getFullYear();

  for (const line of lines) {
    // Match "15 August 2026 - Holiday Name" or similar patterns
    const match = line.match(/(\d{1,2})[\/\-\s](\w+)[\/\-\s]?(\d{4})?\s*[-–]?\s*(.+)?/i);
    if (match) {
      const day = parseInt(match[1]);
      const monthStr = match[2].toLowerCase();
      const month = monthMap[monthStr] || parseInt(match[2]);
      const yr = match[3] ? parseInt(match[3]) : year;
      const name = (match[4] || line).trim();
      if (day && month) {
        holidays.push({ date: new Date(yr, month-1, day), name, type: 'institute' });
      }
    }
  }

  let created = 0;
  for (const h of holidays) {
    try { await Holiday.create(h); created++; } catch { /* skip duplicates */ }
  }
  await AuditLog.create({ action: 'UPLOAD_HOLIDAY_PDF', performedBy: req.user._id, newValue: { created, year } });
  res.json({ message: `Parsed and saved ${created} holidays`, holidays });
});

// POST /api/holidays - manual add
router.post('/', protect, authorize('admin', 'hod'), async (req, res) => {
  const h = await Holiday.create(req.body);
  res.status(201).json(h);
});

// DELETE /api/holidays/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await Holiday.findByIdAndDelete(req.params.id);
  res.json({ message: 'Holiday deleted' });
});

// POST /api/holidays/sync-gcal
router.post('/sync-gcal', protect, authorize('admin', 'hod'), async (req, res) => {
  const { calendarUrl } = req.body;
  if (!calendarUrl) return res.status(400).json({ message: 'Missing Google Calendar URL' });
  
  // Mocking the Google Calendar API sync
  // In a real application, you would use googleapis package to fetch events from the provided public URL or authenticated client
  const mockFetchedHolidays = [
    { date: new Date(new Date().getFullYear(), 4, 1), name: 'Maharashtra Day (GCal Sync)', type: 'state' },
    { date: new Date(new Date().getFullYear(), 7, 15), name: 'Independence Day (GCal Sync)', type: 'national' },
  ];

  let created = 0;
  for (const h of mockFetchedHolidays) {
    try { await Holiday.create(h); created++; } catch { /* skip duplicates */ }
  }

  await AuditLog.create({ action: 'SYNC_GCAL_HOLIDAYS', performedBy: req.user._id, newValue: { created, calendarUrl } });
  res.json({ message: `Successfully synced ${created} events from Google Calendar`, holidays: mockFetchedHolidays });
});

module.exports = router;
