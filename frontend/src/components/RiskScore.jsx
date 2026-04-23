import { motion } from 'framer-motion';

export default function RiskScore({ score = 0 }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score <= 25) return '#22c55e';
    if (score <= 50) return '#eab308';
    if (score <= 75) return '#f97316';
    return '#ef4444';
  };

  const getLabel = () => {
    if (score <= 25) return 'Excellent';
    if (score <= 50) return 'Good';
    if (score <= 75) return 'Moderate';
    return 'High Risk';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="10" />
          <motion.circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold"
            style={{ color: getColor() }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-text-secondary">/ 100</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-semibold" style={{ color: getColor() }}>{getLabel()}</p>
      <p className="text-xs text-text-secondary">Health Risk Score</p>
    </div>
  );
}
