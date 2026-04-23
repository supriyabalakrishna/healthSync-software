const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  role: { type: String, enum: ['patient', 'doctor', 'caretaker'], default: 'patient' },
  age: Number,
  gender: String,
  address: String,
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  medicalHistory: [String],
  allergies: [String],
  linkedPatients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  linkedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  linkedCaretaker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: [{ text: String, by: String, date: { type: Date, default: Date.now } }],
  prescriptions: [{ medicine: String, dosage: String, frequency: String, date: { type: Date, default: Date.now } }],
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
