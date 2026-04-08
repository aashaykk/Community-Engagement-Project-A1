require('express-async-errors');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/appliances', require('./routes/appliances'));
app.use('/api/proposals', require('./routes/proposals'));
app.use('/api/solar', require('./routes/solar'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/faults', require('./routes/faults'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/holidays', require('./routes/holidays'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/consumption', require('./routes/consumption'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Connect to MongoDB and start crons
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('✅ MongoDB connected');
  require('./services/escalationJob');
  require('./services/snapshotService');
  app.listen(process.env.PORT, () =>
    console.log(`🚀 Server running on http://localhost:${process.env.PORT}`)
  );
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
