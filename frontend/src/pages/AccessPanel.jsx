import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import RiskScore from '../components/RiskScore';

export default function AccessPanel() {
  const [role, setRole] = useState('doctor');
  const [users, setUsers] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientVitals, setPatientVitals] = useState([]);
  const [patientPills, setPatientPills] = useState([]);
  const [latestVital, setLatestVital] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [rxForm, setRxForm] = useState({ medicine: '', dosage: '', frequency: '' });

  useEffect(() => {
    axios.get(`/api/users?role=patient`).then(r => setUsers(r.data)).catch(() => {});
  }, []);

  const selectPatient = async (patient) => {
    setSelectedPatient(patient);
    try {
      const [vitalsRes, latestRes, pillsRes] = await Promise.all([
        axios.get(`/api/vitals/${patient._id}`),
        axios.get(`/api/vitals/${patient._id}/latest`),
        axios.get(`/api/pills/${patient._id}`),
      ]);
      setPatientVitals(vitalsRes.data.slice(0, 7));
      setLatestVital(latestRes.data);
      setPatientPills(pillsRes.data);
    } catch (err) { console.error(err); }
  };

  const addNote = async () => {
    if (!noteText.trim() || !selectedPatient) return;
    try {
      const byName = role === 'doctor' ? 'Dr. Priya Sharma' : 'Anita Kumar';
      await axios.post(`/api/users/${selectedPatient._id}/notes`, { text: noteText, by: byName });
      setSelectedPatient(prev => ({
        ...prev,
        notes: [...(prev.notes || []), { text: noteText, by: byName, date: new Date() }]
      }));
      setNoteText('');
    } catch (err) { console.error(err); }
  };

  const addPrescription = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    try {
      await axios.post(`/api/users/${selectedPatient._id}/prescriptions`, rxForm);
      setSelectedPatient(prev => ({
        ...prev,
        prescriptions: [...(prev.prescriptions || []), { ...rxForm, date: new Date() }]
      }));
      setRxForm({ medicine: '', dosage: '', frequency: '' });
    } catch (err) { console.error(err); }
  };

  const today = new Date().toISOString().split('T')[0];
  const adherenceRate = patientPills.length > 0
    ? Math.round(patientPills.filter(p => p.taken?.find(t => t.date === today && t.status === 'taken')).length / patientPills.length * 100)
    : 0;

  const roleConfig = {
    doctor: { icon: '👨‍⚕️', label: 'Doctor Panel', color: '#6366f1', desc: 'View vitals, add notes, update prescriptions' },
    caretaker: { icon: '🧑‍🤝‍🧑', label: 'Caretaker Panel', color: '#8b5cf6', desc: 'Monitor adherence and receive alerts' },
    patient: { icon: '🧑', label: 'Patient View', color: '#22c55e', desc: 'View your own health summary' },
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-text-primary">👥 Access Panel</h1>
        <p className="text-text-secondary mt-1">Role-based healthcare management</p>
      </motion.div>

      {/* Role Selector */}
      <div className="flex gap-3">
        {Object.entries(roleConfig).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => { setRole(key); setSelectedPatient(null); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
              role === key
                ? 'glass-card border-primary/40 text-primary-light shadow-lg shadow-primary/10'
                : 'bg-surface/30 text-text-secondary hover:bg-surface/50 border border-transparent'
            }`}
          >
            <span className="text-xl">{cfg.icon}</span>
            <span className="text-sm">{cfg.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="text-lg font-bold text-text-primary mb-4">👤 Patients</h3>
          <div className="space-y-2">
            {users.map(u => (
              <button
                key={u._id}
                onClick={() => selectPatient(u)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  selectedPatient?._id === u._id
                    ? 'bg-primary/15 border border-primary/30'
                    : 'bg-surface/30 hover:bg-surface/50 border border-transparent'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                  {u.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{u.name}</p>
                  <p className="text-xs text-text-secondary">{u.age} yrs, {u.gender}</p>
                </div>
              </button>
            ))}
            {users.length === 0 && <p className="text-sm text-text-secondary text-center py-4">No patients found</p>}
          </div>
        </motion.div>

        {/* Patient Details */}
        <motion.div
          className="lg:col-span-2 space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {selectedPatient ? (
            <>
              {/* Overview */}
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">{selectedPatient.name}</h3>
                    <p className="text-sm text-text-secondary">{selectedPatient.age} yrs • {selectedPatient.gender} • {selectedPatient.email}</p>
                  </div>
                  {latestVital && <RiskScore score={latestVital.riskScore || 0} />}
                </div>

                {/* Latest Vitals */}
                {latestVital && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    <div className="p-3 rounded-xl bg-surface/50 border border-border">
                      <p className="text-xs text-text-secondary">Fasting Sugar</p>
                      <p className={`text-lg font-bold ${latestVital.sugarFasting > 126 ? 'text-danger' : latestVital.sugarFasting > 100 ? 'text-warning' : 'text-success'}`}>
                        {latestVital.sugarFasting} <span className="text-xs font-normal text-text-secondary">mg/dL</span>
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-surface/50 border border-border">
                      <p className="text-xs text-text-secondary">Blood Pressure</p>
                      <p className={`text-lg font-bold ${latestVital.bpSystolic > 140 ? 'text-danger' : latestVital.bpSystolic > 130 ? 'text-warning' : 'text-success'}`}>
                        {latestVital.bpSystolic}/{latestVital.bpDiastolic}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-surface/50 border border-border">
                      <p className="text-xs text-text-secondary">Heart Rate</p>
                      <p className="text-lg font-bold text-text-primary">{latestVital.heartRate} bpm</p>
                    </div>
                    <div className="p-3 rounded-xl bg-surface/50 border border-border">
                      <p className="text-xs text-text-secondary">Med Adherence</p>
                      <p className={`text-lg font-bold ${adherenceRate >= 80 ? 'text-success' : 'text-warning'}`}>
                        {adherenceRate}%
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Doctor-specific: Notes & Prescriptions */}
              {role === 'doctor' && (
                <>
                  <div className="glass-card p-5">
                    <h4 className="text-lg font-bold text-text-primary mb-3">📝 Doctor Notes</h4>
                    <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                      {(selectedPatient.notes || []).map((n, i) => (
                        <div key={i} className="p-3 rounded-xl bg-surface/50 border border-border text-sm">
                          <p className="text-text-primary">{n.text}</p>
                          <p className="text-xs text-text-secondary mt-1">— {n.by} • {new Date(n.date).toLocaleDateString()}</p>
                        </div>
                      ))}
                      {(!selectedPatient.notes || selectedPatient.notes.length === 0) && (
                        <p className="text-sm text-text-secondary">No notes yet</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" className="input-field" placeholder="Add a note..."
                        value={noteText} onChange={e => setNoteText(e.target.value)} />
                      <button onClick={addNote} className="btn-primary whitespace-nowrap">Add Note</button>
                    </div>
                  </div>

                  <div className="glass-card p-5">
                    <h4 className="text-lg font-bold text-text-primary mb-3">💊 Prescriptions</h4>
                    <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                      {(selectedPatient.prescriptions || []).map((rx, i) => (
                        <div key={i} className="p-3 rounded-xl bg-surface/50 border border-border text-sm flex items-center justify-between">
                          <div>
                            <p className="text-text-primary font-medium">{rx.medicine} — {rx.dosage}</p>
                            <p className="text-xs text-text-secondary">{rx.frequency} • {new Date(rx.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={addPrescription} className="flex gap-2 flex-wrap">
                      <input type="text" className="input-field flex-1 min-w-[120px]" placeholder="Medicine" required
                        value={rxForm.medicine} onChange={e => setRxForm({ ...rxForm, medicine: e.target.value })} />
                      <input type="text" className="input-field flex-1 min-w-[80px]" placeholder="Dosage"
                        value={rxForm.dosage} onChange={e => setRxForm({ ...rxForm, dosage: e.target.value })} />
                      <input type="text" className="input-field flex-1 min-w-[100px]" placeholder="Frequency"
                        value={rxForm.frequency} onChange={e => setRxForm({ ...rxForm, frequency: e.target.value })} />
                      <button type="submit" className="btn-primary whitespace-nowrap">Add Rx</button>
                    </form>
                  </div>
                </>
              )}

              {/* Caretaker-specific: Adherence monitoring */}
              {role === 'caretaker' && (
                <div className="glass-card p-5">
                  <h4 className="text-lg font-bold text-text-primary mb-3">📋 Medication Monitoring</h4>
                  <div className="space-y-2">
                    {patientPills.map(pill => {
                      const todayEntry = pill.taken?.find(t => t.date === today);
                      const status = todayEntry?.status || 'pending';
                      return (
                        <div key={pill._id} className="flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-border">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">💊</span>
                            <div>
                              <p className="text-sm font-medium text-text-primary">{pill.name} ({pill.dosage})</p>
                              <p className="text-xs text-text-secondary capitalize">{pill.timing} — {pill.time}</p>
                            </div>
                          </div>
                          <span className={`badge ${status === 'taken' ? 'badge-success' : status === 'missed' ? 'badge-danger' : 'badge-warning'}`}>
                            {status === 'taken' ? '✅ Taken' : status === 'missed' ? '❌ Missed' : '⏳ Pending'}
                          </span>
                        </div>
                      );
                    })}
                    {patientPills.length === 0 && <p className="text-sm text-text-secondary">No medications assigned</p>}
                  </div>

                  {/* Warning for missed meds */}
                  {patientPills.some(p => { const e = p.taken?.find(t => t.date === today); return e?.status === 'missed'; }) && (
                    <div className="mt-4 p-3 rounded-xl bg-danger/10 border border-danger/30">
                      <p className="text-sm text-danger font-semibold">⚠️ Alert: Patient has missed medication(s) today!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Patient view: own vitals history */}
              {role === 'patient' && (
                <div className="glass-card p-5">
                  <h4 className="text-lg font-bold text-text-primary mb-3">📋 Recent Vitals</h4>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr><th>Date</th><th>Sugar (F)</th><th>BP</th><th>HR</th></tr>
                      </thead>
                      <tbody>
                        {patientVitals.map(v => (
                          <tr key={v._id}>
                            <td>{new Date(v.date).toLocaleDateString()}</td>
                            <td>{v.sugarFasting || '—'}</td>
                            <td>{v.bpSystolic}/{v.bpDiastolic}</td>
                            <td>{v.heartRate || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="glass-card p-12 text-center">
              <p className="text-4xl mb-3">{roleConfig[role].icon}</p>
              <p className="text-lg font-semibold text-text-primary">{roleConfig[role].label}</p>
              <p className="text-sm text-text-secondary mt-1">{roleConfig[role].desc}</p>
              <p className="text-text-secondary text-sm mt-4">Select a patient from the list to get started</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
