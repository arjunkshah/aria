import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="auth-card"
    >
      <div className="auth-header">
        <h2 className="text-2xl font-bold text-text-strong mb-2">Welcome Back</h2>
        <p className="text-text-secondary">Sign in to your ARIA account</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="Enter your password"
            required
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="form-error"
          >
            {error}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="spinner mr-2"></div>
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Don't have an account?{' '}
          <button
            onClick={() => window.location.href = '/register'}
            className="text-primary hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </motion.div>
  );
};

export default LoginForm; 