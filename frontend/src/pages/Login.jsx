import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!form.email || !form.password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      console.log('🔐 Logging in user:', form.email);

      const res = await api.post('/users/login', {
        email: form.email,
        password: form.password
      });

      console.log('✅ Login successful:', res.data);

      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('userId', res.data.user._id);

      navigate('/');
    } catch (err) {
      console.error('❌ Login error:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Login failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.h1
            className="text-4xl font-bold gradient-text mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            HealthSync
          </motion.h1>
          <p className="text-text-secondary text-sm">Smart Healthcare Platform</p>
        </div>

        {/* Login Card */}
        <motion.div
          className="glass-card p-8 rounded-2xl border border-border"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-text-primary mb-6">Welcome Back</h2>

          {error && (
            <motion.div
              className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-field w-full"
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input-field w-full"
                disabled={loading}
              />
            </div>

            {/* Login Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-text-secondary text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:text-primary-light transition">
              Sign Up
            </Link>
          </p>
        </motion.div>

        {/* Demo Info */}
        <motion.div
          className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p>Demo credentials:</p>
          <p className="text-blue-300 mt-1">Email: test@example.com | Password: password123</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
