import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Sparkles, 
  User, 
  Search, 
  Compass, 
  Bell, 
  UserPlus, 
  LogOut,
  Menu,
  X,
  Home
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = user ? [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/explore', icon: Compass, label: 'Explore' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/follow-requests', icon: UserPlus, label: 'Requests' },
    { path: '/profile', icon: User, label: 'Profile' },
  ] : [];

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} className="navbar-logo">
          <Sparkles className="logo-icon" size={24} />
          <span className="logo-text">SummarizeAI</span>
        </Link>

        {/* Desktop Navigation */}
        {user && (
          <div className="navbar-nav desktop-nav">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActivePath(item.path) ? 'active' : ''}`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Auth Section */}
        <div className="navbar-auth">
          {user ? (
            <div className="auth-dropdown">
              <div className="user-info">
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} />
                  ) : (
                    <User size={18} />
                  )}
                </div>
                <span className="username">@{user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-sm"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && user && (
        <div className="mobile-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${isActivePath(item.path) ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}

      <style jsx>{`
        .navbar {
          background: rgba(26, 26, 27, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 1rem 0;
        }

        .navbar-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          color: var(--text-primary);
          font-weight: 700;
          font-size: 1.25rem;
        }

        .logo-icon {
          color: var(--accent-primary);
        }

        .logo-text {
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .desktop-nav {
          display: flex;
          gap: 0.5rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          text-decoration: none;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .nav-link:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
          transform: translateY(-1px);
        }

        .nav-link.active {
          background: var(--gradient-primary);
          color: white;
          box-shadow: var(--shadow-glow);
        }

        .navbar-auth {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .auth-dropdown {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          overflow: hidden;
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .username {
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .auth-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .mobile-menu-button {
          display: none;
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: var(--radius-sm);
        }

        .mobile-menu-button:hover {
          background: var(--bg-hover);
        }

        .mobile-nav {
          display: none;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: var(--bg-secondary);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: var(--radius-md);
          text-decoration: none;
          color: var(--text-secondary);
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .mobile-nav-link:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .mobile-nav-link.active {
          background: var(--gradient-primary);
          color: white;
        }

        @media (max-width: 768px) {
          .desktop-nav {
            display: none;
          }

          .mobile-menu-button {
            display: block;
          }

          .mobile-nav {
            display: flex;
          }

          .navbar-container {
            padding: 0 1rem;
          }

          .auth-dropdown {
            gap: 0.5rem;
          }

          .username {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
