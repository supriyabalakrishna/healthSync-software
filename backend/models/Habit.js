const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  waterIntake: { type: Number, default: 0 },
  steps: { type: Number, default: 0 },
  sleepHours: { type: Number, default: 0 },
  exerciseMinutes: { type: Number, default: 0 },
  medicationAdherence: { type: Number, default: 0 },
  mood: { type: String, enum: ['great', 'good', 'okay', 'bad', 'terrible'], default: 'okay' }
});

habitSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Habit', habitSchema);
