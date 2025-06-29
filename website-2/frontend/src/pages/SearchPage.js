import React, { useState } from 'react';
import { Search, UserPlus, UserCheck, Clock, User, FileText, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [contentResults, setContentResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [followingStatus, setFollowingStatus] = useState({});

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

  const handleSearch = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setContentResults([]);
      setFollowingStatus({});
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      
      // Search users
      const userResponse = await axios.get(`${API_URL}/users/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (userResponse.data) {
        setSearchResults(userResponse.data.users || []);
        
        // Set follow status from search results
        const statusMap = {};
        (userResponse.data.users || []).forEach(user => {
          statusMap[user._id] = {
            isFollowing: user.isFollowing,
            hasPendingRequest: user.hasPendingRequest
          };
        });
        setFollowingStatus(statusMap);
      }

      // Search content
      const contentResponse = await axios.get(`${API_URL}/content/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (contentResponse.data) {
        setContentResults(contentResponse.data.content || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (username, userId) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        alert('Please log in to follow users');
        return;
      }

      const currentStatus = followingStatus[userId];
      const endpoint = currentStatus?.isFollowing 
        ? `${API_URL}/users/${username}/unfollow`
        : `${API_URL}/users/${username}/follow`;

      const response = await axios.post(endpoint, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        setFollowingStatus(prev => ({
          ...prev,
          [userId]: {
            isFollowing: !currentStatus?.isFollowing,
            hasPendingRequest: response.data.hasPendingRequest || false
          }
        }));
      }
    } catch (error) {
      console.error('Follow toggle failed:', error);
      alert('Failed to update follow status');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <Search size={32} className="text-accent" />
        <h1 className="heading-lg">Search</h1>
        <p className="text-secondary">Find users and content</p>
      </div>

      {/* Search Input */}
      <div className="card mb-lg">
        <div className="search-input-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search users and content..."
            value={searchQuery}
            onChange={handleInputChange}
            className="search-input"
          />
        </div>
      </div>

      {/* Search Tabs */}
      {searchQuery && (
        <div className="search-tabs">
          <button
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <User size={16} />
            Users ({searchResults.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <FileText size={16} />
            Content ({contentResults.length})
          </button>
        </div>
      )}

      {/* Search Results */}
      {loading && (
        <div className="card">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Searching...</p>
          </div>
        </div>
      )}

      {!loading && searchQuery && (
        <>
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="search-results">
              {searchResults.length > 0 ? (
                searchResults.map(user => (
                  <div key={user._id} className="user-result-card">
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.username} />
                        ) : (
                          <User size={20} />
                        )}
                      </div>
                      <div className="user-details">
                        <h3 className="user-name">{user.fullName || user.username}</h3>
                        <p className="user-username">@{user.username}</p>
                        <div className="user-stats">
                          <span>{user.followerCount || 0} followers</span>
                          <span>{user.followingCount || 0} following</span>
                          <span>{user.contentCount || 0} content</span>
                        </div>
                      </div>
                    </div>
                    <div className="user-actions">
                      <Link to={`/profile/${user.username}`} className="btn btn-ghost btn-sm">
                        View Profile
                      </Link>
                      <button
                        onClick={() => handleFollowToggle(user.username, user._id)}
                        className={`btn btn-sm ${
                          followingStatus[user._id]?.isFollowing 
                            ? 'btn-secondary' 
                            : followingStatus[user._id]?.hasPendingRequest
                            ? 'btn-ghost'
                            : 'btn-primary'
                        }`}
                        disabled={followingStatus[user._id]?.hasPendingRequest}
                      >
                        {followingStatus[user._id]?.isFollowing ? (
                          <>
                            <UserCheck size={14} />
                            Following
                          </>
                        ) : followingStatus[user._id]?.hasPendingRequest ? (
                          <>
                            <Clock size={14} />
                            Pending
                          </>
                        ) : (
                          <>
                            <UserPlus size={14} />
                            Follow
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card">
                  <div className="empty-state">
                    <User size={48} className="text-muted" />
                    <h3>No users found</h3>
                    <p className="text-secondary">Try searching with different keywords</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="search-results">
              {contentResults.length > 0 ? (
                contentResults.map(content => (
                  <div key={content._id} className="content-result-card">
                    <div className="content-header">
                      <h3 className="content-title">{content.title}</h3>
                      <span className="content-source">{content.siteName}</span>
                    </div>
                    <div className="content-summary">
                      {content.summary && (
                        <p>
                          {typeof content.summary === 'string' 
                            ? content.summary.substring(0, 200)
                            : content.summary.text?.substring(0, 200) || 'No summary available'
                          }...
                        </p>
                      )}
                    </div>
                    <div className="content-footer">
                      <span className="content-date">
                        {new Date(content.createdAt).toLocaleDateString()}
                      </span>
                      <div className="content-actions">
                        <Link to={`/profile/${content.userId?.username}`} className="content-author">
                          by @{content.userId?.username}
                        </Link>
                        <a 
                          href={content.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-sm"
                        >
                          <ExternalLink size={14} />
                          View Original
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card">
                  <div className="empty-state">
                    <FileText size={48} className="text-muted" />
                    <h3>No content found</h3>
                    <p className="text-secondary">Try searching with different keywords</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!searchQuery && (
        <div className="card">
          <div className="empty-state">
            <Search size={48} className="text-muted" />
            <h3>Search Users and Content</h3>
            <p className="text-secondary">Start typing to find users and their content</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .search-input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-secondary);
          z-index: 1;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          color: var(--text-primary);
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.1);
        }

        .search-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-button:hover {
          background: var(--surface-hover);
          color: var(--text-primary);
        }

        .tab-button.active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .search-results {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .user-result-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s ease;
        }

        .user-result-card:hover {
          background: var(--surface-hover);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          overflow: hidden;
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .user-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .user-username {
          color: var(--text-secondary);
          margin: 0;
        }

        .user-stats {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .user-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .content-result-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 1.5rem;
          transition: all 0.2s ease;
        }

        .content-result-card:hover {
          background: var(--surface-hover);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .content-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
          flex: 1;
        }

        .content-source {
          font-size: 0.875rem;
          color: var(--accent);
          font-weight: 500;
        }

        .content-summary {
          margin-bottom: 1rem;
        }

        .content-summary p {
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
        }

        .content-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .content-date {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .content-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .content-author {
          font-size: 0.875rem;
          color: var(--accent);
          text-decoration: none;
        }

        .content-author:hover {
          text-decoration: underline;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 2px solid var(--border);
          border-top: 2px solid var(--accent);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .user-result-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .user-actions {
            width: 100%;
            justify-content: flex-end;
          }

          .content-header {
            flex-direction: column;
            gap: 0.5rem;
          }

          .content-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .search-tabs {
            flex-direction: column;
          }

          .tab-button {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchPage;
