const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/healthsync';

// Import services
const pillNotificationService = require('./services/pillsNotificationService');

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with better error handling
console.log('📍 Attempting to connect to MongoDB at:', MONGO_URI);
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('   Make sure MongoDB is running and the connection string is correct');
  });

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/vitals', require('./routes/vitals'));
app.use('/api/meals', require('./routes/meals'));
app.use('/api/pills', require('./routes/pills'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/reports', require('./routes/reports'));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'HealthSync API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Schedule pill reminder checks every hour
cron.schedule('0 * * * *', async () => {
  console.log('🔍 Running scheduled pill reminder check...');
  await pillNotificationService.checkMissedPills();
});

// Also run a check every 15 minutes for more frequent monitoring
cron.schedule('*/15 * * * *', async () => {
  console.log('🔍 Running frequent pill status check...');
  await pillNotificationService.checkMissedPills();
});

app.listen(PORT, () => {
  console.log(`🚀 HealthSync server running on port ${PORT}`);
  console.log(`   API endpoint: http://localhost:${PORT}`);
  console.log(`   Pill reminder service: Active (checks every 15 minutes and hourly)`);
});

