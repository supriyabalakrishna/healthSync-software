import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function HabitTracker({ userId }) {
  const [habit, setHabit] = useState(null);

  useEffect(() => {
    if (userId) {
      axios.get(`/api/habits/${userId}/today`).then(r => setHabit(r.data)).catch(() => {});
    }
  }, [userId]);

  const update = async (field, value) => {
    if (!habit) return;
    const updated = { ...habit, [field]: value };
    setHabit(updated);
    const today = new Date().toISOString().split('T')[0];
    await axios.put(`/api/habits/${userId}/${today}`, { [field]: value }).catch(() => {});
  };

  const trackers = [
    {
      label: 'Water', icon: '💧', field: 'waterIntake',
      value: habit?.waterIntake || 0, max: 10, unit: 'glasses',
      color: '#3b82f6'
    },
    {
      label: 'Steps', icon: '👟', field: 'steps',
      value: habit?.steps || 0, max: 10000, unit: 'steps',
      color: '#22c55e'
    },
    {
      label: 'Exercise', icon: '🏋️', field: 'exerciseMinutes',
      value: habit?.exerciseMinutes || 0, max: 60, unit: 'min',
      color: '#f97316'
    },
    {
      label: 'Meds', icon: '💊', field: 'medicationAdherence',
      value: habit?.medicationAdherence || 0, max: 100, unit: '%',
      color: '#8b5cf6'
    },
  ];

  return (
    <div className="glass-card p-5">
      <h3 className="text-lg font-bold text-text-primary mb-4">📋 Today's Habits</h3>
      <div className="grid grid-cols-2 gap-3">
        {trackers.map((t, i) => {
          const pct = Math.min((t.value / t.max) * 100, 100);
          return (
            <motion.div
              key={t.field}
              className="p-3 rounded-xl bg-surface/50 border border-border"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{t.icon}</span>
                <span className="text-xs text-text-secondary">{t.label}</span>
              </div>
              <p className="text-xl font-bold text-text-primary">
                {t.value}<span className="text-xs text-text-secondary ml-1">{t.unit}</span>
              </p>
              <div className="w-full h-1.5 bg-surface-light rounded-full mt-2 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: t.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <div className="flex gap-1 mt-2">
                <button
                  onClick={() => update(t.field, Math.max(0, t.value - (t.max > 100 ? 500 : 1)))}
                  className="flex-1 text-xs py-1 rounded bg-surface-light text-text-secondary hover:text-text-primary transition-colors"
                >−</button>
                <button
                  onClick={() => update(t.field, Math.min(t.max, t.value + (t.max > 100 ? 500 : 1)))}
                  className="flex-1 text-xs py-1 rounded bg-primary/20 text-primary-light hover:bg-primary/30 transition-colors"
                >+</button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
