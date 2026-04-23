import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function VitalRecording({ userId }) {
  const [form, setForm] = useState({
    sugarFasting: '', sugarPostMeal: '', bpSystolic: '', bpDiastolic: '', heartRate: ''
  });
  const [suggestions, setSuggestions] = useState(null);
  const [riskScore, setRiskScore] = useState(null);
  const [history, setHistory] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get(`/api/vitals/${userId}`).then(r => setHistory(r.data)).catch(() => {});
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { userId };
      if (form.sugarFasting) payload.sugarFasting = Number(form.sugarFasting);
      if (form.sugarPostMeal) payload.sugarPostMeal = Number(form.sugarPostMeal);
      if (form.bpSystolic) payload.bpSystolic = Number(form.bpSystolic);
      if (form.bpDiastolic) payload.bpDiastolic = Number(form.bpDiastolic);
      if (form.heartRate) payload.heartRate = Number(form.heartRate);

      const res = await axios.post('/api/vitals', payload);
      setSuggestions(res.data.suggestions);
      setRiskScore(res.data.riskScore);
      setHistory(prev => [res.data.vital, ...prev]);
      setForm({ sugarFasting: '', sugarPostMeal: '', bpSystolic: '', bpDiastolic: '', heartRate: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteVital = async (id) => {
    await axios.delete(`/api/vitals/${id}`).catch(() => {});
    setHistory(h => h.filter(v => v._id !== id));
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-text-primary">❤️ Record Vitals</h1>
        <p className="text-text-secondary mt-1">Enter your health readings for instant AI analysis</p>
      </motion.div>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Fasting Blood Sugar (mg/dL)</label>
            <input
              type="number" className="input-field" placeholder="e.g. 105"
              value={form.sugarFasting} onChange={e => setForm({ ...form, sugarFasting: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Post-Meal Blood Sugar (mg/dL)</label>
            <input
              type="number" className="input-field" placeholder="e.g. 140"
              value={form.sugarPostMeal} onChange={e => setForm({ ...form, sugarPostMeal: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Systolic BP (mmHg)</label>
            <input
              type="number" className="input-field" placeholder="e.g. 120"
              value={form.bpSystolic} onChange={e => setForm({ ...form, bpSystolic: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Diastolic BP (mmHg)</label>
            <input
              type="number" className="input-field" placeholder="e.g. 80"
              value={form.bpDiastolic} onChange={e => setForm({ ...form, bpDiastolic: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Heart Rate (bpm)</label>
            <input
              type="number" className="input-field" placeholder="e.g. 72"
              value={form.heartRate} onChange={e => setForm({ ...form, heartRate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Date & Time</label>
            <input type="text" className="input-field" value={new Date().toLocaleString()} readOnly />
          </div>
        </div>
        <button
          type="submit" disabled={submitting}
          className="btn-primary mt-5 disabled:opacity-50"
        >
          {submitting ? 'Analyzing...' : '🔍 Analyze & Save'}
        </button>
      </motion.form>

      {/* AI Results */}
      <AnimatePresence>
        {suggestions && (
          <motion.div
            className="glass-card p-5"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-primary">🤖 AI Analysis Results</h3>
              {riskScore !== null && (
                <span className={`badge ${riskScore <= 25 ? 'badge-success' : riskScore <= 50 ? 'badge-warning' : 'badge-danger'}`}>
                  Risk Score: {riskScore}/100
                </span>
              )}
            </div>
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <motion.div
                  key={i}
                  className="p-3 rounded-xl bg-surface/50 border border-border text-sm text-text-secondary"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {s}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Table */}
      <motion.div
        className="glass-card p-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-bold text-text-primary mb-4">📋 Previous Recordings</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Sugar (F)</th>
                <th>Sugar (PM)</th>
                <th>BP</th>
                <th>HR</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 15).map(v => (
                <tr key={v._id}>
                  <td>{new Date(v.date).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className={v.sugarFasting > 126 ? 'text-danger' : v.sugarFasting > 100 ? 'text-warning' : 'text-success'}>
                    {v.sugarFasting || '—'}
                  </td>
                  <td className={v.sugarPostMeal > 200 ? 'text-danger' : v.sugarPostMeal > 140 ? 'text-warning' : 'text-success'}>
                    {v.sugarPostMeal || '—'}
                  </td>
                  <td className={v.bpSystolic > 140 ? 'text-danger' : v.bpSystolic > 130 ? 'text-warning' : 'text-success'}>
                    {v.bpSystolic && v.bpDiastolic ? `${v.bpSystolic}/${v.bpDiastolic}` : '—'}
                  </td>
                  <td>{v.heartRate || '—'}</td>
                  <td>
                    <button onClick={() => deleteVital(v._id)} className="text-xs text-danger/60 hover:text-danger transition-colors">✕</button>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr><td colSpan="6" className="text-center text-text-secondary py-8">No vitals recorded yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
