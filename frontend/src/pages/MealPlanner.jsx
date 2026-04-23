import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const cuisines = ['all', 'indian', 'american', 'asian', 'european'];
const diets = ['all', 'vegetarian', 'vegan', 'non-veg'];

export default function MealPlanner({ userId }) {
  const [cuisine, setCuisine] = useState('all');
  const [diet, setDiet] = useState('all');
  const [calorieGoal, setCalorieGoal] = useState('2000');
  const [plan, setPlan] = useState(null);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`/api/vitals/${userId}/latest`).then(r => setLatest(r.data)).catch(() => {});
  }, [userId]);

  const generatePlan = async () => {
    setLoading(true);
    try {
      const highSugar = latest?.sugarFasting > 100 || latest?.sugarPostMeal > 140;
      const highBP = latest?.bpSystolic > 130;
      const res = await axios.post('/api/meals/plan', {
        cuisine: cuisine === 'all' ? null : cuisine,
        diet: diet === 'all' ? null : diet,
        calorieGoal: Number(calorieGoal),
        highSugar,
        highBP
      });
      setPlan(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { key: 'breakfast', icon: '🌅', label: 'Breakfast' },
    { key: 'lunch', icon: '☀️', label: 'Lunch' },
    { key: 'dinner', icon: '🌙', label: 'Dinner' },
    { key: 'snack', icon: '🍿', label: 'Snack' },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-text-primary">🍽️ AI Meal Planner</h1>
        <p className="text-text-secondary mt-1">Get personalized meal plans based on your health profile</p>
      </motion.div>

      {/* Health Alerts */}
      {latest && (latest.sugarFasting > 100 || latest.bpSystolic > 130) && (
        <motion.div
          className="glass-card p-4 border-warning/30"
          style={{ borderColor: 'rgba(234,179,8,0.3)', background: 'rgba(234,179,8,0.08)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-sm text-warning font-semibold">🩺 Health-aware mode active</p>
          <p className="text-xs text-text-secondary mt-1">
            {latest.sugarFasting > 100 && 'Sugar-controlled meals will be prioritized. '}
            {latest.bpSystolic > 130 && 'Low-sodium options will be selected.'}
          </p>
        </motion.div>
      )}

      {/* Controls */}
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Cuisine Preference</label>
            <div className="flex flex-wrap gap-2">
              {cuisines.map(c => (
                <button
                  key={c}
                  onClick={() => setCuisine(c)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                    cuisine === c
                      ? 'bg-primary/20 text-primary-light border border-primary/40'
                      : 'bg-surface/50 text-text-secondary border border-transparent hover:border-border'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Diet Type</label>
            <div className="flex flex-wrap gap-2">
              {diets.map(d => (
                <button
                  key={d}
                  onClick={() => setDiet(d)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                    diet === d
                      ? 'bg-primary/20 text-primary-light border border-primary/40'
                      : 'bg-surface/50 text-text-secondary border border-transparent hover:border-border'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Daily Calorie Goal</label>
            <input
              type="number" className="input-field" placeholder="2000"
              value={calorieGoal} onChange={e => setCalorieGoal(e.target.value)}
            />
          </div>
        </div>
        <button onClick={generatePlan} disabled={loading} className="btn-primary mt-5 disabled:opacity-50">
          {loading ? 'Generating...' : '✨ Generate Meal Plan'}
        </button>
      </motion.div>

      {/* Meal Plan Results */}
      <AnimatePresence>
        {plan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Health Notes */}
            {plan.healthNotes?.length > 0 && (
              <div className="glass-card p-4 mb-4 border-primary/30" style={{ borderColor: 'rgba(99,102,241,0.3)' }}>
                {plan.healthNotes.map((n, i) => (
                  <p key={i} className="text-sm text-primary-light">{n}</p>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat, i) => {
                const meal = plan[cat.key];
                if (!meal) return null;
                return (
                  <motion.div
                    key={cat.key}
                    className="glass-card glass-card-hover p-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <h3 className="text-sm font-semibold text-primary-light uppercase tracking-wide">{cat.label}</h3>
                    </div>
                    <h4 className="text-lg font-bold text-text-primary">{meal.name}</h4>
                    <p className="text-sm text-text-secondary mt-1">{meal.benefits}</p>

                    <div className="flex gap-3 mt-3">
                      <div className="px-2.5 py-1 rounded-lg bg-primary/10 text-xs text-primary-light font-semibold">
                        🔥 {meal.calories} cal
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-surface/50 text-xs text-text-secondary">
                        P: {meal.protein}g
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-surface/50 text-xs text-text-secondary">
                        C: {meal.carbs}g
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-surface/50 text-xs text-text-secondary">
                        F: {meal.fat}g
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      {meal.lowSugar && <span className="badge badge-success">Sugar-safe</span>}
                      {meal.lowSodium && <span className="badge badge-info">Low Sodium</span>}
                      <span className="badge bg-surface/50 text-text-secondary capitalize">{meal.cuisine}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Total Calories */}
            <div className="glass-card p-4 mt-4 text-center">
              <p className="text-sm text-text-secondary">
                Total Calories: <span className="text-xl font-bold text-primary-light">{plan.totalCalories}</span>
                <span className="text-text-secondary"> / {calorieGoal} target</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
