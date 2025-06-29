import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
    } catch (error) {
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="text-center mb-6">
            <div className="auth-icon">
              <LogIn size={28} />
            </div>
            <h1 className="heading-lg mt-4">Welcome Back</h1>
            <p className="text-secondary text-sm">Sign in to continue exploring MindTrail</p>
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-md">
            <div className="form-group">
              <label className="form-label flex items-center gap-2">
                <Mail size={16} /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label flex items-center gap-2">
                <Lock size={16} /> Password
              </label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer mt-6 text-center">
            <p className="text-sm text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="auth-link text-accent">Sign up here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
