const express = require('express');
const router = express.Router();
const Vital = require('../models/Vital');

// AI suggestion engine
function generateSuggestions(vital) {
  const suggestions = [];
  const { sugarFasting, sugarPostMeal, bpSystolic, bpDiastolic, heartRate } = vital;

  // Blood Sugar Analysis
  if (sugarFasting) {
    if (sugarFasting > 126) {
      suggestions.push('⚠️ Fasting sugar is HIGH (>126 mg/dL). This indicates diabetic range. Consult your doctor and consider reducing carb intake.');
    } else if (sugarFasting > 100) {
      suggestions.push('🟡 Fasting sugar is slightly elevated (100-126 mg/dL). Pre-diabetic range. Consider a low-carb breakfast and increase fiber intake.');
    } else if (sugarFasting < 70) {
      suggestions.push('🔴 Fasting sugar is LOW (<70 mg/dL). Hypoglycemia detected. Eat something sweet immediately and consult your doctor.');
    } else {
      suggestions.push('✅ Fasting blood sugar is normal. Keep up the healthy eating habits!');
    }
  }

  if (sugarPostMeal) {
    if (sugarPostMeal > 200) {
      suggestions.push('🔴 Post-meal sugar is critically HIGH (>200 mg/dL). Avoid sugary foods, increase water intake, and consult your doctor immediately.');
    } else if (sugarPostMeal > 140) {
      suggestions.push('⚠️ Post-meal sugar is elevated (>140 mg/dL). Your sugar is slightly high, consider a low-carb meal next time.');
    } else {
      suggestions.push('✅ Post-meal blood sugar is within normal range. Great dietary choices!');
    }
  }

  // Blood Pressure Analysis
  if (bpSystolic && bpDiastolic) {
    if (bpSystolic > 180 || bpDiastolic > 120) {
      suggestions.push('🔴 HYPERTENSIVE CRISIS! BP is dangerously high. Seek emergency medical attention immediately.');
    } else if (bpSystolic > 140 || bpDiastolic > 90) {
      suggestions.push('⚠️ BP elevated — Stage 2 Hypertension. Avoid salty food today, reduce stress, and monitor closely.');
    } else if (bpSystolic > 130 || bpDiastolic > 80) {
      suggestions.push('🟡 BP slightly elevated — Stage 1 Hypertension. Reduce sodium intake, practice deep breathing, and stay hydrated.');
    } else if (bpSystolic < 90 || bpDiastolic < 60) {
      suggestions.push('⚠️ BP is LOW (Hypotension). Increase fluid and salt intake slightly. Avoid standing up suddenly.');
    } else {
      suggestions.push('✅ Blood pressure is normal. Maintain your current lifestyle!');
    }
  }

  // Heart Rate Analysis
  if (heartRate) {
    if (heartRate > 100) {
      suggestions.push('⚠️ Heart rate is elevated (Tachycardia). Avoid caffeine, practice relaxation, and monitor regularly.');
    } else if (heartRate < 60) {
      suggestions.push('🟡 Heart rate is low (Bradycardia). If you feel dizzy or fatigued, consult your doctor.');
    } else {
      suggestions.push('✅ Heart rate is in the healthy range (60-100 bpm). Keep staying active!');
    }
  }

  // Combined analysis
  if (sugarFasting > 126 && bpSystolic > 140) {
    suggestions.push('🔴 COMBINED RISK: Both sugar and BP are elevated. This significantly increases cardiovascular risk. Immediate lifestyle changes and medical consultation recommended.');
  }

  if (sugarPostMeal > 140 && heartRate > 100) {
    suggestions.push('⚠️ Elevated sugar with high heart rate may indicate metabolic stress. Rest, hydrate, and avoid heavy meals.');
  }

  return suggestions;
}

// Calculate health risk score (0-100, lower is better)
function calculateRiskScore(vital) {
  let score = 0;
  const { sugarFasting, sugarPostMeal, bpSystolic, bpDiastolic, heartRate } = vital;

  if (sugarFasting) {
    if (sugarFasting > 126) score += 25;
    else if (sugarFasting > 100) score += 12;
    else if (sugarFasting < 70) score += 15;
  }

  if (sugarPostMeal) {
    if (sugarPostMeal > 200) score += 25;
    else if (sugarPostMeal > 140) score += 12;
  }

  if (bpSystolic) {
    if (bpSystolic > 180) score += 25;
    else if (bpSystolic > 140) score += 18;
    else if (bpSystolic > 130) score += 10;
    else if (bpSystolic < 90) score += 12;
  }

  if (bpDiastolic) {
    if (bpDiastolic > 120) score += 15;
    else if (bpDiastolic > 90) score += 10;
    else if (bpDiastolic < 60) score += 8;
  }

  if (heartRate) {
    if (heartRate > 100) score += 10;
    else if (heartRate < 60) score += 5;
  }

  return Math.min(score, 100);
}

// Get vitals for a user
router.get('/:userId', async (req, res) => {
  try {
    const vitals = await Vital.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(vitals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get latest vital
router.get('/:userId/latest', async (req, res) => {
  try {
    const vital = await Vital.findOne({ userId: req.params.userId }).sort({ date: -1 });
    if (!vital) return res.json(null);
    res.json({ ...vital.toObject(), riskScore: calculateRiskScore(vital) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get analytics (last 7/30 days)
router.get('/:userId/analytics', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const vitals = await Vital.find({ userId: req.params.userId, date: { $gte: since } }).sort({ date: 1 });

    // Calculate trends
    let insights = [];
    if (vitals.length >= 2) {
      const first = vitals[0];
      const last = vitals[vitals.length - 1];

      if (first.sugarFasting && last.sugarFasting) {
        const change = ((last.sugarFasting - first.sugarFasting) / first.sugarFasting * 100).toFixed(1);
        if (change < 0) insights.push(`Your fasting sugar improved by ${Math.abs(change)}% this period.`);
        else if (change > 0) insights.push(`Your fasting sugar increased by ${change}% this period. Consider dietary adjustments.`);
      }

      if (first.bpSystolic && last.bpSystolic) {
        const change = ((last.bpSystolic - first.bpSystolic) / first.bpSystolic * 100).toFixed(1);
        if (change < 0) insights.push(`Your systolic BP improved by ${Math.abs(change)}% this period.`);
        else if (change > 5) insights.push(`⚠️ Risk of hypertension increasing — systolic BP rose by ${change}%.`);
      }
    }

    // Calculate average risk score
    const avgRisk = vitals.length > 0
      ? Math.round(vitals.reduce((sum, v) => sum + calculateRiskScore(v), 0) / vitals.length)
      : 0;

    res.json({ vitals, insights, avgRiskScore: avgRisk });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Record a vital
router.post('/', async (req, res) => {
  try {
    const suggestions = generateSuggestions(req.body);
    const vital = new Vital({ ...req.body, suggestions });
    await vital.save();
    res.status(201).json({ vital, suggestions, riskScore: calculateRiskScore(req.body) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a vital
router.delete('/:id', async (req, res) => {
  try {
    await Vital.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vital deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
