const mongoose = require('mongoose');
const User = require('./models/User');
const Vital = require('./models/Vital');
const Pill = require('./models/Pill');
const Contact = require('./models/Contact');
const Habit = require('./models/Habit');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/healthsync';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Vital.deleteMany({});
  await Pill.deleteMany({});
  await Contact.deleteMany({});
  await Habit.deleteMany({});

  // Create users
  const patient = await User.create({
    name: 'Ravi Kumar',
    email: 'ravi@example.com',
    role: 'patient',
    age: 45,
    gender: 'Male'
  });

  const doctor = await User.create({
    name: 'Dr. Priya Sharma',
    email: 'priya@example.com',
    role: 'doctor',
    age: 38,
    gender: 'Female'
  });

  const caretaker = await User.create({
    name: 'Anita Kumar',
    email: 'anita@example.com',
    role: 'caretaker',
    age: 40,
    gender: 'Female'
  });

  // Link relationships
  patient.linkedDoctor = doctor._id;
  patient.linkedCaretaker = caretaker._id;
  await patient.save();

  doctor.linkedPatients = [patient._id];
  await doctor.save();

  caretaker.linkedPatients = [patient._id];
  await caretaker.save();

  // Create sample vitals (last 7 days)
  const vitalsData = [
    { sugarFasting: 110, sugarPostMeal: 145, bpSystolic: 128, bpDiastolic: 82, heartRate: 72, daysAgo: 7 },
    { sugarFasting: 105, sugarPostMeal: 138, bpSystolic: 125, bpDiastolic: 80, heartRate: 70, daysAgo: 6 },
    { sugarFasting: 118, sugarPostMeal: 155, bpSystolic: 132, bpDiastolic: 85, heartRate: 75, daysAgo: 5 },
    { sugarFasting: 98, sugarPostMeal: 130, bpSystolic: 120, bpDiastolic: 78, heartRate: 68, daysAgo: 4 },
    { sugarFasting: 102, sugarPostMeal: 142, bpSystolic: 135, bpDiastolic: 88, heartRate: 74, daysAgo: 3 },
    { sugarFasting: 95, sugarPostMeal: 128, bpSystolic: 118, bpDiastolic: 76, heartRate: 66, daysAgo: 2 },
    { sugarFasting: 92, sugarPostMeal: 125, bpSystolic: 122, bpDiastolic: 79, heartRate: 71, daysAgo: 1 }
  ];

  for (const v of vitalsData) {
    const date = new Date();
    date.setDate(date.getDate() - v.daysAgo);
    const suggestions = [];
    if (v.sugarFasting > 100) suggestions.push('Fasting sugar slightly elevated. Consider low-carb breakfast.');
    if (v.sugarPostMeal > 140) suggestions.push('Post-meal sugar elevated. Consider reducing portion sizes.');
    if (v.bpSystolic > 130) suggestions.push('BP slightly elevated. Reduce sodium intake today.');

    await Vital.create({
      userId: patient._id,
      sugarFasting: v.sugarFasting,
      sugarPostMeal: v.sugarPostMeal,
      bpSystolic: v.bpSystolic,
      bpDiastolic: v.bpDiastolic,
      heartRate: v.heartRate,
      date,
      suggestions
    });
  }

  // Create pills
  await Pill.create([
    { userId: patient._id, name: 'Metformin', dosage: '500mg', timing: 'morning', time: '08:00' },
    { userId: patient._id, name: 'Amlodipine', dosage: '5mg', timing: 'morning', time: '08:00' },
    { userId: patient._id, name: 'Metformin', dosage: '500mg', timing: 'evening', time: '20:00' },
    { userId: patient._id, name: 'Vitamin D3', dosage: '1000IU', timing: 'afternoon', time: '13:00' }
  ]);

  // Create contacts
  await Contact.create([
    { userId: patient._id, name: 'Dr. Priya Sharma', relationship: 'doctor', phone: '+91-9876543210', email: 'priya@example.com', hospital: 'Apollo Hospital', specialty: 'Endocrinologist', isPrimary: true },
    { userId: patient._id, name: 'Anita Kumar', relationship: 'caretaker', phone: '+91-9876543211', email: 'anita@example.com' },
    { userId: patient._id, name: 'Suresh Kumar', relationship: 'emergency', phone: '+91-9876543212', email: 'suresh@example.com' },
    { userId: patient._id, name: 'City Hospital ER', relationship: 'emergency', phone: '108', isPrimary: true }
  ]);

  // Create habits for last 7 days
  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    await Habit.create({
      userId: patient._id,
      date: date.toISOString().split('T')[0],
      waterIntake: Math.floor(Math.random() * 4 + 5),
      steps: Math.floor(Math.random() * 5000 + 3000),
      sleepHours: Math.round((Math.random() * 3 + 5) * 10) / 10,
      exerciseMinutes: Math.floor(Math.random() * 30 + 10),
      medicationAdherence: Math.floor(Math.random() * 30 + 70),
      mood: ['great', 'good', 'okay', 'good', 'great', 'okay', 'good'][i - 1]
    });
  }

  console.log('✅ Seed data created successfully!');
  console.log(`Patient ID: ${patient._id}`);
  console.log(`Doctor ID: ${doctor._id}`);
  console.log(`Caretaker ID: ${caretaker._id}`);

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
