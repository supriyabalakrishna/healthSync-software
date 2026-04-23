import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs">
      <p className="text-text-secondary mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function Analytics({ userId }) {
  const [days, setDays] = useState(7);
  const [data, setData] = useState({ vitals: [], insights: [], avgRiskScore: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/vitals/${userId}/analytics?days=${days}`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId, days]);

  const chartData = data.vitals.map(v => ({
    date: new Date(v.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    'Fasting Sugar': v.sugarFasting,
    'Post-Meal Sugar': v.sugarPostMeal,
    'Systolic BP': v.bpSystolic,
    'Diastolic BP': v.bpDiastolic,
    'Heart Rate': v.heartRate,
  }));

  const downloadPDF = () => {
    window.open(`/api/reports/${userId}/pdf?days=${days}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <motion.div
        className="flex items-center justify-between flex-wrap gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-text-primary">📊 Analytics</h1>
          <p className="text-text-secondary mt-1">Track your health trends and download reports</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex bg-surface/50 rounded-xl p-1 border border-border">
            {[7, 14, 30].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  days === d ? 'bg-primary/20 text-primary-light' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {d}D
              </button>
            ))}
          </div>
          <button onClick={downloadPDF} className="btn-primary">
            📄 Download PDF
          </button>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Avg Risk Score', value: data.avgRiskScore, color: data.avgRiskScore <= 25 ? '#22c55e' : data.avgRiskScore <= 50 ? '#eab308' : '#ef4444', icon: '🎯' },
              { label: 'Readings', value: data.vitals.length, color: '#6366f1', icon: '📋' },
              { label: 'Days Tracked', value: days, color: '#8b5cf6', icon: '📅' },
              { label: 'Period', value: `${days} days`, color: '#ec4899', icon: '⏱️' },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                className="glass-card p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{card.icon}</span>
                  <span className="text-xs text-text-secondary">{card.label}</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Sugar Chart */}
          <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-bold text-text-primary mb-4">🩸 Blood Sugar Trends</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="sugarF" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="sugarP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#eab308" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#eab308" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                <Area type="monotone" dataKey="Fasting Sugar" stroke="#f97316" fill="url(#sugarF)" strokeWidth={2} />
                <Area type="monotone" dataKey="Post-Meal Sugar" stroke="#eab308" fill="url(#sugarP)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* BP Chart */}
          <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-bold text-text-primary mb-4">💓 Blood Pressure & Heart Rate</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                <Line type="monotone" dataKey="Systolic BP" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Diastolic BP" stroke="#818cf8" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Heart Rate" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* AI Insights */}
          {data.insights.length > 0 && (
            <motion.div
              className="glass-card p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-bold text-text-primary mb-3">🤖 AI Insights</h3>
              <div className="space-y-2">
                {data.insights.map((insight, i) => (
                  <div key={i} className="p-3 rounded-xl bg-surface/50 border border-border text-sm text-text-secondary">
                    {insight}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
