const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');

// Get habits for a user (recent days)
router.get('/:userId', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const habits = await Habit.find({ userId: req.params.userId }).sort({ date: -1 }).limit(days);
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get or create today's habit
router.get('/:userId/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let habit = await Habit.findOne({ userId: req.params.userId, date: today });
    if (!habit) {
      habit = new Habit({ userId: req.params.userId, date: today });
      await habit.save();
    }
    res.json(habit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update habit for a date
router.put('/:userId/:date', async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { userId: req.params.userId, date: req.params.date },
      req.body,
      { new: true, upsert: true }
    );
    res.json(habit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
