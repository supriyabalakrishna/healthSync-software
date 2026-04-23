import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/', icon: '🏠', label: 'Dashboard' },
  { path: '/vitals', icon: '❤️', label: 'Record Vitals' },
  { path: '/meals', icon: '🍽️', label: 'Meal Planner' },
  { path: '/analytics', icon: '📊', label: 'Analytics' },
  { path: '/emergency', icon: '🚨', label: 'Emergency' },
  { path: '/pills', icon: '💊', label: 'Pill Reminder' },
];

export default function Sidebar({ userName = 'User', userRole = 'patient', onLogout }) {
  const navigate = useNavigate();
  const firstLetter = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 glass-card rounded-none border-r border-t-0 border-b-0 border-l-0 z-50 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <motion.h1
          className="text-2xl font-bold gradient-text"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          HealthSync
        </motion.h1>
        <p className="text-xs text-text-secondary mt-1">Smart Healthcare Platform</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item, i) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <NavLink
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/20 text-primary-light border border-primary/30 shadow-lg shadow-primary/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-3">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
            {firstLetter}
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">{userName}</p>
            <p className="text-xs text-text-secondary capitalize">{userRole}</p>
          </div>
        </div>
        <motion.button
          onClick={handleLogout}
          className="w-full px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 border border-red-500/30 transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          🚪 Logout
        </motion.button>
      </div>
    </aside>
  );
}
