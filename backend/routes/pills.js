const express = require('express');
const router = express.Router();
const Pill = require('../models/Pill');
const pillNotificationService = require('../services/pillsNotificationService');

// Get pills for a user
router.get('/:userId', async (req, res) => {
  try {
    const pills = await Pill.find({ userId: req.params.userId, active: true });
    res.json(pills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a pill
router.post('/', async (req, res) => {
  try {
    const pill = new Pill(req.body);
    await pill.save();
    res.status(201).json(pill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Mark pill as taken
router.put('/:id/taken', async (req, res) => {
  try {
    const { userId, notes } = req.body;
    const pill = await pillNotificationService.markPillAsTaken(req.params.id, userId, notes);
    res.json(pill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get medication history for a user
router.get('/:userId/history', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const end = endDate ? new Date(endDate) : new Date();

    const history = await pillNotificationService.getMedicationHistory(req.params.userId, start, end);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get today's medication status for a user
router.get('/:userId/today', async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const pills = await Pill.find({
      userId: req.params.userId,
      active: true,
      'medicationLog.date': {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    const todayStatus = pills.map(pill => {
      const todayLog = pill.medicationLog.find(log => {
        const logDate = new Date(log.date);
        return logDate >= startOfDay && logDate < endOfDay;
      });

      return {
        pillId: pill._id,
        name: pill.name,
        dosage: pill.dosage,
        timing: pill.timing,
        scheduledTime: pillNotificationService.getExpectedTime(pill),
        status: todayLog ? todayLog.status : 'pending',
        takenAt: todayLog ? todayLog.actualTime : null,
        notes: todayLog ? todayLog.notes : null
      };
    });

    res.json(todayStatus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete (deactivate) a pill
router.delete('/:id', async (req, res) => {
  try {
    await Pill.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ message: 'Pill deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
