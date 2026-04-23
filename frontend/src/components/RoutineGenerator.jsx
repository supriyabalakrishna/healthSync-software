import { motion } from 'framer-motion';

const routines = {
  morning: [
    { time: '6:00 AM', activity: 'Wake up & hydrate', icon: '💧', desc: 'Drink a glass of warm water with lemon' },
    { time: '6:30 AM', activity: 'Morning walk', icon: '🚶', desc: '30 minutes brisk walking' },
    { time: '7:00 AM', activity: 'Meditation', icon: '🧘', desc: '15 minutes mindful breathing' },
    { time: '7:30 AM', activity: 'Healthy breakfast', icon: '🍳', desc: 'High protein, low carb meal' },
    { time: '8:00 AM', activity: 'Morning medication', icon: '💊', desc: 'Take prescribed medicines' },
  ],
  afternoon: [
    { time: '12:30 PM', activity: 'Balanced lunch', icon: '🥗', desc: 'Include vegetables and lean protein' },
    { time: '1:00 PM', activity: 'Light walk', icon: '🚶', desc: '15 minutes post-meal walk' },
    { time: '3:00 PM', activity: 'Healthy snack', icon: '🍎', desc: 'Fruits or nuts' },
    { time: '4:00 PM', activity: 'Hydration check', icon: '💧', desc: 'Ensure 6+ glasses by now' },
  ],
  evening: [
    { time: '6:00 PM', activity: 'Light exercise', icon: '🏋️', desc: 'Yoga or stretching for 20 min' },
    { time: '7:00 PM', activity: 'Early dinner', icon: '🍱', desc: 'Light meal, avoid heavy carbs' },
    { time: '8:00 PM', activity: 'Evening medication', icon: '💊', desc: 'Take prescribed medicines' },
    { time: '9:00 PM', activity: 'Wind down', icon: '📖', desc: 'Read or relax, no screens' },
    { time: '10:00 PM', activity: 'Sleep', icon: '😴', desc: 'Aim for 7-8 hours of sleep' },
  ]
};

export default function RoutineGenerator({ vitals }) {
  const getPersonalized = () => {
    const tips = [];
    if (vitals?.sugarFasting > 100) tips.push('⚡ Add a 10-min post-meal walk to manage sugar levels');
    if (vitals?.bpSystolic > 130) tips.push('🧘 Include extra relaxation time to manage blood pressure');
    if (vitals?.heartRate > 90) tips.push('💆 Practice deep breathing exercises between activities');
    return tips;
  };

  const tips = getPersonalized();

  return (
    <div className="glass-card p-5">
      <h3 className="text-lg font-bold text-text-primary mb-4">🗓️ Smart Daily Routine</h3>

      {tips.length > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20">
          <p className="text-xs font-semibold text-primary-light mb-2">Personalized Tips</p>
          {tips.map((tip, i) => (
            <p key={i} className="text-xs text-text-secondary mb-1">{tip}</p>
          ))}
        </div>
      )}

      {Object.entries(routines).map(([period, items]) => (
        <div key={period} className="mb-4">
          <h4 className="text-sm font-semibold text-primary-light capitalize mb-2">{period}</h4>
          <div className="space-y-2">
            {items.map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-surface/50 hover:bg-surface-light/50 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-primary-light font-mono">{item.time}</span>
                    <span className="text-sm font-medium text-text-primary">{item.activity}</span>
                  </div>
                  <p className="text-xs text-text-secondary truncate">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
