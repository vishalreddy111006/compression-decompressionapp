import React, { useState, useEffect } from 'react';
import { Compass, TrendingUp, Users, Calendar, Filter } from 'lucide-react';
import axios from 'axios';
import ContentAccordion from '../components/ContentAccordion';

const ExplorePage = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('recent'); // recent, popular, trending
  const [timeFilter, setTimeFilter] = useState('all'); // all, today, week, month

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

  useEffect(() => {
    fetchPublicContent();
  }, [filter, timeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPublicContent = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const params = new URLSearchParams({
        filter,
        timeFilter,
        limit: '50'
      });

      const response = await axios.get(`${API_URL}/content/public?${params}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });

      setContent(response.data.content || []);
    } catch (error) {
      console.error('Error fetching public content:', error);
      // Set empty content on error instead of leaving old data
      setContent([]);
    } finally {
      setLoading(false);
    }
  };

  const handleContentClick = async (contentId) => {
    // For explore page, we can show content details in a modal
    // For now, we'll just log it - you can implement modal later
    console.log('View content details:', contentId);
  };

  // For explore page, we won't allow deleting content (users can only delete their own)
  const handleDelete = () => {
    // No-op for explore page
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading public content...</p>
        </div>

        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4rem 2rem;
            gap: 1rem;
          }

          .spinner {
            width: 32px;
            height: 32px;
            border: 3px solid var(--border);
            border-top: 3px solid var(--accent);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <Compass size={32} className="text-accent" />
        <h1 className="heading-lg">Explore</h1>
        <p className="text-secondary">Discover content from the community</p>
      </div>

      {/* Filters */}
      <div className="explore-filters">
        <div className="filter-group">
          <Filter size={16} />
          <span className="filter-label">Sort by:</span>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="trending">Trending</option>
          </select>
        </div>

        <div className="filter-group">
          <Calendar size={16} />
          <span className="filter-label">Time:</span>
          <select 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Content Stats */}
      <div className="explore-stats">
        <div className="stat-item">
          <TrendingUp size={20} />
          <span>{content.length} pieces of content</span>
        </div>
        <div className="stat-item">
          <Users size={20} />
          <span>{new Set(content.map(item => item.userId?._id || item.userId)).size} contributors</span>
        </div>
      </div>

      {/* Content Display */}
      <div className="explore-content">
        {content.length > 0 ? (
          <ContentAccordion 
            content={content}
            onDelete={handleDelete}
            onContentClick={handleContentClick}
          />
        ) : (
          <div className="card">
            <div className="empty-state">
              <Compass size={48} className="text-muted" />
              <h3>No public content found</h3>
              <p className="text-secondary">
                Be the first to share content with the community!
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .explore-filters {
          display: flex;
          gap: 2rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .filter-select {
          padding: 0.5rem;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 0.375rem;
          color: var(--text-primary);
          font-size: 0.875rem;
          cursor: pointer;
        }

        .filter-select:focus {
          outline: none;
          border-color: var(--accent);
        }

        .explore-stats {
          display: flex;
          gap: 2rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .explore-content {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 1.5rem;
        }

        @media (max-width: 768px) {
          .explore-filters {
            flex-direction: column;
            gap: 1rem;
          }

          .filter-group {
            justify-content: space-between;
            width: 100%;
          }

          .explore-stats {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ExplorePage;
