import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await register(formData);
    } catch (error) {
      setError(error.message || 'Registration failed');
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
          <div className="auth-header">
            <div className="auth-icon">
              <UserPlus size={32} />
            </div>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join the privacy-first summarization platform</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                <User size={16} />
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <User size={16} />
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-input"
                placeholder="Choose a username"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Mail size={16} />
                Email Address
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
              <label className="form-label">
                <Lock size={16} />
                Password
              </label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Create a strong password"
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
              style={{ width: '100%' }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: 
            radial-gradient(circle at 25% 25%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(124, 58, 237, 0.1) 0%, transparent 50%);
        }

        .auth-container {
          width: 100%;
          max-width: 400px;
        }

        .auth-card {
          background: var(--gradient-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-lg);
          padding: 3rem;
          box-shadow: var(--shadow-large);
          backdrop-filter: blur(20px);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .auth-icon {
          width: 60px;
          height: 60px;
          background: var(--gradient-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: white;
        }

        .auth-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .auth-subtitle {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .auth-form {
          margin-bottom: 2rem;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .password-input {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: var(--radius-sm);
        }

        .password-toggle:hover {
          color: var(--text-primary);
          background: var(--bg-hover);
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: var(--accent-error);
          padding: 0.75rem;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .auth-footer {
          text-align: center;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .auth-footer p {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .auth-link {
          color: var(--accent-primary);
          text-decoration: none;
          font-weight: 500;
        }

        .auth-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
