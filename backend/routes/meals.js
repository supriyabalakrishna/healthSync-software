const express = require('express');
const router = express.Router();
const mealsData = require('../data/meals.json');

// Get all meals with filters
router.get('/', (req, res) => {
  let { cuisine, diet, category, lowSugar, lowSodium, maxCalories } = req.query;
  let filtered = [...mealsData.meals];

  if (cuisine) filtered = filtered.filter(m => m.cuisine === cuisine.toLowerCase());
  if (diet) filtered = filtered.filter(m => m.diet.includes(diet.toLowerCase()));
  if (category) filtered = filtered.filter(m => m.category === category.toLowerCase());
  if (lowSugar === 'true') filtered = filtered.filter(m => m.lowSugar);
  if (lowSodium === 'true') filtered = filtered.filter(m => m.lowSodium);
  if (maxCalories) filtered = filtered.filter(m => m.calories <= parseInt(maxCalories));

  res.json(filtered);
});

// Generate meal plan
router.post('/plan', (req, res) => {
  const { cuisine, diet, calorieGoal, highSugar, highBP } = req.body;
  let pool = [...mealsData.meals];

  // Filter by diet preference
  if (cuisine && cuisine !== 'all') pool = pool.filter(m => m.cuisine === cuisine.toLowerCase());
  if (diet && diet !== 'all') pool = pool.filter(m => m.diet.includes(diet.toLowerCase()));

  // Health-conscious filtering
  if (highSugar) pool = pool.filter(m => m.lowSugar);
  if (highBP) pool = pool.filter(m => m.lowSodium);

  const targetPerMeal = calorieGoal ? Math.round(parseInt(calorieGoal) / 4) : 500;

  const pick = (items, cat) => {
    const available = items.filter(m => m.category === cat);
    if (available.length === 0) return null;
    // Pick meals closest to target calories
    const sorted = available.sort((a, b) => Math.abs(a.calories - targetPerMeal) - Math.abs(b.calories - targetPerMeal));
    // Randomize among top 5 closest
    const top = sorted.slice(0, Math.min(5, sorted.length));
    return top[Math.floor(Math.random() * top.length)];
  };

  const plan = {
    breakfast: pick(pool, 'breakfast'),
    lunch: pick(pool, 'lunch'),
    dinner: pick(pool, 'dinner'),
    snack: pick(pool, 'snack'),
    totalCalories: 0,
    healthNotes: []
  };

  plan.totalCalories = [plan.breakfast, plan.lunch, plan.dinner, plan.snack]
    .filter(Boolean)
    .reduce((sum, m) => sum + m.calories, 0);

  if (highSugar) plan.healthNotes.push('🩺 Meals selected are sugar-controlled for diabetic management.');
  if (highBP) plan.healthNotes.push('🩺 Low-sodium meals selected for blood pressure management.');
  if (calorieGoal && plan.totalCalories > parseInt(calorieGoal)) {
    plan.healthNotes.push(`⚠️ Total calories (${plan.totalCalories}) slightly exceed your goal of ${calorieGoal}. Consider smaller portions.`);
  }

  res.json(plan);
});

module.exports = router;
