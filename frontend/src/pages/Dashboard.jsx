import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import RiskScore from '../components/RiskScore';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const getStatus = (type, value, value2) => {
  if (type === 'sugar') {
    if (value > 126) return { status: 'critical', label: 'High' };
    if (value > 100) return { status: 'warning', label: 'Elevated' };
    if (value < 70) return { status: 'critical', label: 'Low' };
    return { status: 'normal', label: 'Normal' };
  }
  if (type === 'bp') {
    if (value > 140 || value2 > 90) return { status: 'critical', label: 'High' };
    if (value > 130 || value2 > 80) return { status: 'warning', label: 'Elevated' };
    if (value < 90 || value2 < 60) return { status: 'warning', label: 'Low' };
    return { status: 'normal', label: 'Normal' };
  }
  if (type === 'hr') {
    if (value > 100) return { status: 'warning', label: 'High' };
    if (value < 60) return { status: 'warning', label: 'Low' };
    return { status: 'normal', label: 'Normal' };
  }
  return { status: 'normal', label: 'Normal' };
};

const statusColors = {
  normal: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', text: '#22c55e', glow: 'rgba(34,197,94,0.15)' },
  warning: { bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)', text: '#eab308', glow: 'rgba(234,179,8,0.15)' },
  critical: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#ef4444', glow: 'rgba(239,68,68,0.15)' },
};

function VitalCard({ title, icon, value, unit, status, delay }) {
  const colors = statusColors[status.status];
  return (
    <motion.div
      className="glass-card glass-card-hover p-5"
      style={{ borderColor: colors.border, boxShadow: `0 4px 20px ${colors.glow}` }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="badge" style={{ background: colors.bg, color: colors.text }}>
          {status.label}
        </span>
      </div>
      <p className="text-sm text-text-secondary">{title}</p>
      <p className="text-3xl font-bold mt-1" style={{ color: colors.text }}>
        {value} <span className="text-sm font-normal text-text-secondary">{unit}</span>
      </p>
    </motion.div>
  );
}

function MiniChart({ data, dataKey, color, title }) {
  const chartData = data.map(v => ({
    date: new Date(v.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    [dataKey]: v[dataKey],
  }));

  return (
    <div className="glass-card p-4">
      <p className="text-sm font-semibold text-text-secondary mb-3">{title}</p>
      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={chartData}>
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: '#1e1b2e', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '0.75rem', fontSize: '12px', color: '#f1f5f9' }}
          />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 3, fill: color }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Dashboard({ userId, userName = 'User' }) {
  const [latest, setLatest] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [latestRes, analyticsRes] = await Promise.all([
          axios.get(`/api/vitals/${userId}/latest`),
          axios.get(`/api/vitals/${userId}/analytics?days=7`),
        ]);
        setLatest(latestRes.data);
        setVitals(analyticsRes.data.vitals || []);
      } catch (e) {
        console.error('Dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const sugarStatus = latest ? getStatus('sugar', latest.sugarFasting) : { status: 'normal', label: '—' };
  const bpStatus = latest ? getStatus('bp', latest.bpSystolic, latest.bpDiastolic) : { status: 'normal', label: '—' };
  const hrStatus = latest ? getStatus('hr', latest.heartRate) : { status: 'normal', label: '—' };

  const warnings = [];
  if (vitals.length >= 3) {
    const recent = vitals.slice(-3);
    const sugarTrend = recent.every((v, i) => i === 0 || v.sugarFasting >= recent[i-1].sugarFasting);
    const bpTrend = recent.every((v, i) => i === 0 || v.bpSystolic >= recent[i-1].bpSystolic);
    if (sugarTrend && latest?.sugarFasting > 100) warnings.push('📈 Blood sugar showing upward trend. Consider dietary adjustments.');
    if (bpTrend && latest?.bpSystolic > 125) warnings.push('📈 Blood pressure trending upward. Risk of hypertension increasing.');
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Greeting */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            {getGreeting()}, <span className="gradient-text">{userName}</span> 👋
          </h1>
          <p className="text-text-secondary mt-1">Here's your health summary for today</p>
        </div>
        <div className="text-right text-sm text-text-secondary">
          <p>{new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <p>{new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </motion.div>

      {/* Predictive Warnings */}
      {warnings.length > 0 && (
        <motion.div
          className="glass-card p-4 border-warning/30"
          style={{ borderColor: 'rgba(234,179,8,0.3)', background: 'rgba(234,179,8,0.08)' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h3 className="text-sm font-bold text-warning mb-2">⚠️ Predictive Warnings</h3>
          {warnings.map((w, i) => (
            <p key={i} className="text-sm text-text-secondary">{w}</p>
          ))}
        </motion.div>
      )}

      {/* Vital Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <VitalCard
          title="Blood Sugar (Fasting)"
          icon="🩸"
          value={latest?.sugarFasting || '—'}
          unit="mg/dL"
          status={sugarStatus}
          delay={0.1}
        />
        <VitalCard
          title="Blood Pressure"
          icon="💓"
          value={latest ? `${latest.bpSystolic}/${latest.bpDiastolic}` : '—'}
          unit="mmHg"
          status={bpStatus}
          delay={0.2}
        />
        <VitalCard
          title="Heart Rate"
          icon="💗"
          value={latest?.heartRate || '—'}
          unit="bpm"
          status={hrStatus}
          delay={0.3}
        />
      </div>

      {/* Risk Score + AI Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          className="glass-card p-6 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <RiskScore score={latest?.riskScore || 0} />
        </motion.div>

        <motion.div
          className="glass-card p-5 lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-bold text-text-primary mb-3">🤖 AI Health Suggestions</h3>
          {latest?.suggestions?.length > 0 ? (
            <div className="space-y-2">
              {latest.suggestions.map((s, i) => (
                <div key={i} className="p-3 rounded-xl bg-surface/50 text-sm text-text-secondary border border-border">
                  {s}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm">No recent readings. Record your vitals to get personalized suggestions.</p>
          )}
        </motion.div>
      </div>

      {/* Mini Charts (7-day trends) */}
      {vitals.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MiniChart data={vitals} dataKey="sugarFasting" color="#f97316" title="Fasting Sugar (7-day)" />
          <MiniChart data={vitals} dataKey="bpSystolic" color="#6366f1" title="Systolic BP (7-day)" />
          <MiniChart data={vitals} dataKey="heartRate" color="#ec4899" title="Heart Rate (7-day)" />
        </div>
      )}
    </div>
  );
}
