const mongoose = require('mongoose');

const vitalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sugarFasting: Number,
  sugarPostMeal: Number,
  bpSystolic: Number,
  bpDiastolic: Number,
  heartRate: Number,
  date: { type: Date, default: Date.now },
  suggestions: [String]
});

module.exports = mongoose.model('Vital', vitalSchema);
