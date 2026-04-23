const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  relationship: { type: String, enum: ['doctor', 'caretaker', 'emergency', 'family'], required: true },
  phone: String,
  email: String,
  hospital: String,
  specialty: String,
  address: String,
  isPrimary: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contact', contactSchema);
