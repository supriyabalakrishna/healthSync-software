import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function Emergency({ userId }) {
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [alertResult, setAlertResult] = useState(null);
  const [form, setForm] = useState({
    name: '', relationship: 'emergency', phone: '', email: '', hospital: '', specialty: ''
  });

  useEffect(() => {
    axios.get(`/api/contacts/${userId}`).then(r => setContacts(r.data)).catch(() => {});
  }, [userId]);

  const addContact = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/contacts', { ...form, userId });
      setContacts(prev => [...prev, res.data]);
      setForm({ name: '', relationship: 'emergency', phone: '', email: '', hospital: '', specialty: '' });
      setShowForm(false);
    } catch (err) { console.error(err); }
  };

  const deleteContact = async (id) => {
    await axios.delete(`/api/contacts/${id}`).catch(() => {});
    setContacts(c => c.filter(x => x._id !== id));
  };

  const triggerAlert = async () => {
    try {
      const res = await axios.post(`/api/contacts/emergency/${userId}`);
      setAlertResult(res.data);
      setTimeout(() => setAlertResult(null), 8000);
    } catch (err) { console.error(err); }
  };

  const icons = { doctor: '👨‍⚕️', caretaker: '🧑‍🤝‍🧑', emergency: '🚨', family: '👨‍👩‍👧' };
  const colors = {
    doctor: { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)' },
    caretaker: { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)' },
    emergency: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
    family: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)' },
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <motion.div
        className="flex items-center justify-between flex-wrap gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-text-primary">🚨 Emergency & Contacts</h1>
          <p className="text-text-secondary mt-1">Manage your healthcare contacts and emergency alerts</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(!showForm)} className="btn-outline">
            ➕ Add Contact
          </button>
          <button onClick={triggerAlert} className="btn-danger pulse-glow">
            🆘 Emergency Alert
          </button>
        </div>
      </motion.div>

      {/* Alert Result */}
      <AnimatePresence>
        {alertResult && (
          <motion.div
            className="glass-card p-5"
            style={{ borderColor: 'rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.08)' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <h3 className="text-lg font-bold text-danger mb-3">
              🚨 Emergency Alert Sent — {alertResult.alertsSent} contacts notified
            </h3>
            <div className="space-y-2">
              {alertResult.alerts.map((a, i) => (
                <div key={i} className="p-3 rounded-xl bg-surface/50 border border-danger/20 text-sm">
                  <p className="text-text-primary font-medium">{a.name} ({a.relationship})</p>
                  <p className="text-text-secondary text-xs mt-1">{a.message}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Contact Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={addContact}
            className="glass-card p-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3 className="text-lg font-bold text-text-primary mb-4">Add New Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Name</label>
                <input type="text" className="input-field" required
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Relationship</label>
                <select className="input-field" value={form.relationship}
                  onChange={e => setForm({ ...form, relationship: e.target.value })}>
                  <option value="doctor">Doctor</option>
                  <option value="caretaker">Caretaker</option>
                  <option value="emergency">Emergency</option>
                  <option value="family">Family</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Phone</label>
                <input type="tel" className="input-field"
                  value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
                <input type="email" className="input-field"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Hospital</label>
                <input type="text" className="input-field"
                  value={form.hospital} onChange={e => setForm({ ...form, hospital: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Specialty</label>
                <input type="text" className="input-field"
                  value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn-primary">Save Contact</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((c, i) => (
          <motion.div
            key={c._id}
            className="glass-card glass-card-hover p-5"
            style={{ borderColor: colors[c.relationship]?.border }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ background: colors[c.relationship]?.bg }}>
                  {icons[c.relationship]}
                </div>
                <div>
                  <h4 className="font-bold text-text-primary">{c.name}</h4>
                  <span className="badge capitalize" style={{
                    background: colors[c.relationship]?.bg,
                    color: c.relationship === 'emergency' ? '#ef4444' : c.relationship === 'doctor' ? '#818cf8' : '#a78bfa'
                  }}>
                    {c.relationship}
                  </span>
                </div>
              </div>
              <button onClick={() => deleteContact(c._id)}
                className="text-text-secondary/50 hover:text-danger text-sm transition-colors">✕</button>
            </div>
            <div className="mt-4 space-y-1.5 text-sm text-text-secondary">
              {c.phone && <p>📞 {c.phone}</p>}
              {c.email && <p>📧 {c.email}</p>}
              {c.hospital && <p>🏥 {c.hospital}</p>}
              {c.specialty && <p>🩺 {c.specialty}</p>}
            </div>
            {c.isPrimary && (
              <div className="mt-3">
                <span className="badge badge-success">Primary</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
