import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function PillReminder({ userId }) {
  const [pills, setPills] = useState([]);
  const [todayStatus, setTodayStatus] = useState([]);
  const [medicationHistory, setMedicationHistory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [notification, setNotification] = useState(null);
  const [form, setForm] = useState({
    name: '',
    dosage: '',
    timing: 'morning',
    time: '08:00',
    schedule: { frequency: 'daily', daysOfWeek: [], daysOfMonth: [] }
  });

  const loadPills = useCallback(() => {
    axios.get(`/api/pills/${userId}`).then(r => setPills(r.data)).catch(() => {});
  }, [userId]);

  const loadTodayStatus = useCallback(() => {
    axios.get(`/api/pills/${userId}/today`).then(r => setTodayStatus(r.data)).catch(() => {});
  }, [userId]);

  const loadMedicationHistory = useCallback(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    axios.get(`/api/pills/${userId}/history`, {
      params: { startDate: thirtyDaysAgo.toISOString(), endDate: new Date().toISOString() }
    }).then(r => setMedicationHistory(r.data)).catch(() => {});
  }, [userId]);

  useEffect(() => {
    loadPills();
    loadTodayStatus();
    loadMedicationHistory();
  }, [loadPills, loadTodayStatus, loadMedicationHistory]);

  // Check for due reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentHour = now.getHours();

      todayStatus.forEach(pill => {
        if (pill.status === 'pending') {
          const [hours, minutes] = pill.scheduledTime.split(':').map(Number);
          const scheduledHour = hours;

          if (currentHour >= scheduledHour && currentHour <= scheduledHour + 2) {
            setNotification({
              pill: pill.name,
              message: `Time to take ${pill.name} ${pill.dosage || ''}`
            });
            setTimeout(() => setNotification(null), 10000);
          }
        }
      });
    };

    if (todayStatus.length > 0) checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [todayStatus]);

  const addPill = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/pills', { ...form, userId });
      setPills(prev => [...prev, res.data]);
      setForm({
        name: '',
        dosage: '',
        timing: 'morning',
        time: '08:00',
        schedule: { frequency: 'daily', daysOfWeek: [], daysOfMonth: [] }
      });
      setShowForm(false);
      loadTodayStatus();
    } catch (err) { console.error(err); }
  };

  const markAsTaken = async (pillId, notes = '') => {
    try {
      const res = await axios.put(`/api/pills/${pillId}/taken`, { userId, notes });
      loadTodayStatus();
      loadMedicationHistory();
      setNotification({
        pill: res.data.name,
        message: `✅ ${res.data.name} marked as taken!`
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.error) {
        setNotification({
          pill: 'Error',
          message: err.response.data.error
        });
        setTimeout(() => setNotification(null), 5000);
      }
    }
  };

  const deletePill = async (id) => {
    await axios.delete(`/api/pills/${id}`).catch(() => {});
    setPills(p => p.filter(x => x._id !== id));
    loadTodayStatus();
  };

  const statusConfig = {
    taken: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', text: '#22c55e', label: '✅ Taken', icon: '✅' },
    missed: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#ef4444', label: '❌ Missed', icon: '❌' },
    late: { bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.3)', text: '#fb923c', label: '⏰ Late', icon: '⏰' },
    pending: { bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)', text: '#eab308', label: '⏳ Pending', icon: '⏳' },
  };

  const timingIcons = { morning: '🌅', afternoon: '☀️', evening: '🌆', night: '🌙' };

  // Calculate adherence stats
  const totalDoses = medicationHistory.length;
  const takenDoses = medicationHistory.filter(h => h.status === 'taken' || h.status === 'late').length;
  const adherence = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

  const todayTaken = todayStatus.filter(p => p.status === 'taken' || p.status === 'late').length;
  const todayTotal = todayStatus.length;

  return (
    <div className="space-y-6 max-w-7xl">
      <motion.div
        className="flex items-center justify-between flex-wrap gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-text-primary">💊 Pill Reminder</h1>
          <p className="text-text-secondary mt-1">Track your medication schedule and never miss a dose</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowHistory(!showHistory)} className="btn-outline">
            📋 History
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            ➕ Add Medicine
          </button>
        </div>
      </motion.div>

      {/* Notification Banner */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className="glass-card p-4 border-warning/40"
            style={{ borderColor: 'rgba(234,179,8,0.4)', background: 'rgba(234,179,8,0.1)' }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <p className="text-sm font-semibold text-warning">🔔 {notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-text-secondary">Active Medicines</p>
          <p className="text-2xl font-bold text-primary-light">{pills.length}</p>
        </motion.div>
        <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="text-xs text-text-secondary">Today's Progress</p>
          <p className="text-2xl font-bold text-success">
            {todayTaken}/{todayTotal}
          </p>
        </motion.div>
        <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <p className="text-xs text-text-secondary">30-Day Adherence</p>
          <p className={`text-2xl font-bold ${adherence >= 80 ? 'text-success' : adherence >= 50 ? 'text-warning' : 'text-danger'}`}>
            {adherence}%
          </p>
        </motion.div>
        <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="text-xs text-text-secondary">Total Logged Doses</p>
          <p className="text-2xl font-bold text-info">{totalDoses}</p>
        </motion.div>
      </div>

      {/* Medication History */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-primary">📋 Medication History (Last 30 Days)</h3>
              <button onClick={() => setShowHistory(false)} className="text-text-secondary hover:text-danger">✕</button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {medicationHistory.length === 0 ? (
                <p className="text-text-secondary text-center py-4">No medication history yet</p>
              ) : (
                medicationHistory.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background-secondary/50">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{statusConfig[entry.status]?.icon}</span>
                      <div>
                        <p className="font-medium text-text-primary">{entry.pillName}</p>
                        <p className="text-sm text-text-secondary">
                          {new Date(entry.date).toLocaleDateString()} at {entry.scheduledTime}
                          {entry.actualTime && ` (taken at ${new Date(entry.actualTime).toLocaleTimeString()})`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="badge" style={{
                        background: statusConfig[entry.status]?.bg,
                        color: statusConfig[entry.status]?.text
                      }}>
                        {statusConfig[entry.status]?.label}
                      </span>
                      {entry.notes && (
                        <p className="text-xs text-text-secondary mt-1">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={addPill}
            className="glass-card p-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3 className="text-lg font-bold text-text-primary mb-4">Add Medicine</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Medicine Name</label>
                <input type="text" className="input-field" required placeholder="e.g. Metformin"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Dosage</label>
                <input type="text" className="input-field" placeholder="e.g. 500mg"
                  value={form.dosage} onChange={e => setForm({ ...form, dosage: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Timing</label>
                <select className="input-field" value={form.timing}
                  onChange={e => setForm({ ...form, timing: e.target.value })}>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Time</label>
                <input type="time" className="input-field"
                  value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Today's Medication Cards */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text-primary">Today's Medications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {todayStatus.map((pill, i) => {
            const config = statusConfig[pill.status];
            return (
              <motion.div
                key={pill.pillId}
                className="glass-card glass-card-hover p-5"
                style={{ borderColor: config.border }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: config.bg }}>
                      💊
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary text-lg">{pill.name}</h4>
                      <p className="text-sm text-text-secondary">{pill.dosage}</p>
                    </div>
                  </div>
                  <button onClick={() => deletePill(pill.pillId)}
                    className="text-text-secondary/50 hover:text-danger text-sm transition-colors">✕</button>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <span className="text-lg">{timingIcons[pill.timing]}</span>
                  <span className="text-sm text-text-secondary capitalize">{pill.timing}</span>
                  <span className="text-sm text-primary-light font-mono">{pill.scheduledTime}</span>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <span className="badge" style={{ background: config.bg, color: config.text }}>
                    {config.label}
                  </span>
                  {pill.status === 'pending' && (
                    <button onClick={() => markAsTaken(pill.pillId)}
                      className="badge badge-success cursor-pointer hover:opacity-80 transition-opacity">
                      Mark Taken
                    </button>
                  )}
                  {pill.takenAt && (
                    <span className="text-xs text-text-secondary">
                      Taken at {new Date(pill.takenAt).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {todayStatus.length === 0 && (
          <div className="glass-card p-12 text-center">
            <p className="text-4xl mb-3">💊</p>
            <p className="text-text-secondary">No medications scheduled for today.</p>
          </div>
        )}
      </div>

      {/* All Medicines List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text-primary">All Medicines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pills.map((pill, i) => (
            <motion.div
              key={pill._id}
              className="glass-card p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💊</span>
                  <div>
                    <h4 className="font-bold text-text-primary">{pill.name}</h4>
                    <p className="text-sm text-text-secondary">{pill.dosage}</p>
                  </div>
                </div>
                <span className="text-lg">{timingIcons[pill.timing]}</span>
              </div>
              <p className="text-sm text-text-secondary mt-2">
                {pill.timing} at {pill.time || 'default time'}
              </p>
            </motion.div>
          ))}
        </div>

        {pills.length === 0 && (
          <div className="glass-card p-12 text-center">
            <p className="text-4xl mb-3">💊</p>
            <p className="text-text-secondary">No medicines added yet. Click "Add Medicine" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
