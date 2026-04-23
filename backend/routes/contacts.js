const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Get contacts for a user
router.get('/:userId', async (req, res) => {
  try {
    const { relationship } = req.query;
    const filter = { userId: req.params.userId };
    if (relationship) filter.relationship = relationship;
    const contacts = await Contact.find(filter);
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a contact
router.post('/', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json(contact);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a contact
router.put('/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(contact);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a contact
router.delete('/:id', async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Simulate emergency alert
router.post('/emergency/:userId', async (req, res) => {
  try {
    const contacts = await Contact.find({ userId: req.params.userId, relationship: { $in: ['emergency', 'doctor', 'caretaker'] } });
    const alerts = contacts.map(c => ({
      name: c.name,
      phone: c.phone,
      relationship: c.relationship,
      alertSent: true,
      message: `EMERGENCY ALERT: Patient needs immediate assistance. Contact ${c.name} at ${c.phone}.`
    }));
    res.json({ success: true, alertsSent: alerts.length, alerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
