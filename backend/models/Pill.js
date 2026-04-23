const mongoose = require('mongoose');

const pillSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  dosage: String,
  timing: { type: String, enum: ['morning', 'afternoon', 'evening', 'night'], required: true },
  time: String, // Expected time to take the pill (e.g., "08:00")
  schedule: {
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
    daysOfWeek: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }], // For weekly frequency
    daysOfMonth: [{ type: Number, min: 1, max: 31 }], // For monthly frequency
  },
  medicationLog: [{
    date: { type: Date, required: true },
    scheduledTime: String, // When it was supposed to be taken
    actualTime: Date, // When it was actually taken (null if missed)
    status: { type: String, enum: ['taken', 'missed', 'late'], required: true },
    notes: String // Optional notes about the medication
  }],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastChecked: { type: Date, default: Date.now } // For tracking when we last checked for missed pills
});

// Index for efficient queries
pillSchema.index({ userId: 1, active: 1 });
pillSchema.index({ 'medicationLog.date': -1 });

module.exports = mongoose.model('Pill', pillSchema);
