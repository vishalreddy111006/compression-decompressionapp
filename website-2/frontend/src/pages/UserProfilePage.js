import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { 
  User, 
  UserPlus, 
  UserCheck, 
  Clock, 
  Settings, 
  MessageCircle,
  Shield,
  Users,
  FileText,
  Calendar 
} from 'lucide-react';
import axios from 'axios';
import ContentAccordion from '../components/ContentAccordion';

const UserProfilePage = () => {
  const { user: currentUser } = useAuth();
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [followStatus, setFollowStatus] = useState({
    isFollowing: false,
    hasPendingRequest: false
  });
  const [activeTab, setActiveTab] = useState('content');
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';
  const isOwnProfile = !username || username === currentUser?.username;

  useEffect(() => {
    if (isOwnProfile && currentUser) {
      setUser(currentUser);
      setLoading(false);
      fetchUserContent();
    } else if (username) {
      fetchUserProfile();
    }
  }, [username, currentUser, isOwnProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserProfile = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users/${username}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });

      if (response.data.user) {
        setUser(response.data.user);
        setFollowStatus({
          isFollowing: response.data.user.isFollowing || false,
          hasPendingRequest: response.data.user.hasPendingRequest || false
        });
        
        // Fetch user's content if profile is public or we're following
        if (!response.data.user.isPrivate || response.data.user.isFollowing) {
          fetchUserContent(response.data.user._id);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserContent = async (userId = null) => {
    setContentLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const endpoint = userId 
        ? `${API_URL}/content/user/${userId}`
        : `${API_URL}/content`;

      const response = await axios.get(endpoint, {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });

      setContent(response.data.content || []);
    } catch (error) {
      console.error('Error fetching user content:', error);
    } finally {
      setContentLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      alert('Please log in to follow users');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const endpoint = followStatus.isFollowing 
        ? `${API_URL}/users/${username}/unfollow`
        : `${API_URL}/users/${username}/follow`;

      const response = await axios.post(endpoint, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        setFollowStatus({
          isFollowing: !followStatus.isFollowing,
          hasPendingRequest: response.data.hasPendingRequest || false
        });

        // Update user's follower count
        setUser(prev => ({
          ...prev,
          followerCount: followStatus.isFollowing 
            ? Math.max(0, (prev.followerCount || 0) - 1)
            : (prev.followerCount || 0) + 1
        }));
      }
    } catch (error) {
      console.error('Follow toggle failed:', error);
      alert('Failed to update follow status');
    }
  };

  const handleContentClick = async (contentId) => {
    console.log('View content details:', contentId);
  };

  const handleDeleteContent = async (contentId) => {
    if (!isOwnProfile) return;

    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`${API_URL}/content/${contentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setContent(content.filter(item => item._id !== contentId));
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete content');
    }
  };

  const filteredContent = showWatchlistOnly ? content.filter(item => item.isWatchlist) : content;

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading profile...</p>
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

  if (!user) {
    return (
      <div className="page-container">
        <div className="card">
          <div className="empty-state">
            <User size={48} className="text-muted" />
            <h3>User not found</h3>
            <p className="text-secondary">The user you're looking for doesn't exist</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.username} />
          ) : (
            <User size={48} />
          )}
          {user.isPrivate && (
            <div className="privacy-badge">
              <Shield size={16} />
            </div>
          )}
        </div>
        
        <div className="profile-info">
          <div className="profile-name-section">
            <h1 className="heading-lg">{user.fullName || user.username}</h1>
            <p className="text-secondary">@{user.username}</p>
            {user.bio && <p className="profile-bio">{user.bio}</p>}
          </div>
          
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-value">{content.length}</span>
              <span className="stat-label">Content</span>
            </div>
            <div className="stat">
              <span className="stat-value">{user.followerCount || 0}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat">
              <span className="stat-value">{user.followingCount || 0}</span>
              <span className="stat-label">Following</span>
            </div>
          </div>

          <div className="profile-meta">
            {user.createdAt && (
              <div className="meta-item">
                <Calendar size={16} />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="profile-actions">
          {isOwnProfile ? (
            <button className="btn btn-secondary">
              <Settings size={16} />
              Edit Profile
            </button>
          ) : (
            <div className="follow-actions">
              <button
                onClick={handleFollowToggle}
                className={`btn ${
                  followStatus.isFollowing 
                    ? 'btn-secondary' 
                    : followStatus.hasPendingRequest
                    ? 'btn-ghost'
                    : 'btn-primary'
                }`}
                disabled={followStatus.hasPendingRequest}
              >
                {followStatus.isFollowing ? (
                  <>
                    <UserCheck size={16} />
                    Following
                  </>
                ) : followStatus.hasPendingRequest ? (
                  <>
                    <Clock size={16} />
                    Pending
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Follow
                  </>
                )}
              </button>
              
              <button className="btn btn-ghost">
                <MessageCircle size={16} />
                Message
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          <FileText size={16} />
          Content ({content.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'watchlist' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('watchlist');
            setShowWatchlistOnly(true);
          }}
        >
          <FileText size={16} />
          Watchlist ({content.filter(item => item.isWatchlist).length})
        </button>
        
        <button
          className={`tab-button ${activeTab === 'followers' ? 'active' : ''}`}
          onClick={() => setActiveTab('followers')}
        >
          <Users size={16} />
          Followers ({user.followerCount || 0})
        </button>
        
        <button
          className={`tab-button ${activeTab === 'following' ? 'active' : ''}`}
          onClick={() => setActiveTab('following')}
        >
          <Users size={16} />
          Following ({user.followingCount || 0})
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="profile-content">
        {activeTab === 'content' && (
          <div className="content-tab">
            {user.isPrivate && !isOwnProfile && !followStatus.isFollowing ? (
              <div className="card">
                <div className="private-profile">
                  <Shield size={48} className="text-muted" />
                  <h3>This profile is private</h3>
                  <p className="text-secondary">Follow @{user.username} to see their content</p>
                </div>
              </div>
            ) : contentLoading ? (
              <div className="card">
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading content...</p>
                </div>
              </div>
            ) : (
              <ContentAccordion 
                content={filteredContent}
                onDelete={isOwnProfile ? handleDeleteContent : () => {}}
                onContentClick={handleContentClick}
              />
            )}
          </div>
        )}

        {activeTab === 'watchlist' && (
          <div className="content-tab">
            <ContentAccordion 
              content={filteredContent}
              onDelete={isOwnProfile ? handleDeleteContent : () => {}}
              onContentClick={handleContentClick}
            />
          </div>
        )}

        {activeTab === 'followers' && (
          <div className="card">
            <div className="empty-state">
              <Users size={48} className="text-muted" />
              <h3>Followers</h3>
              <p className="text-secondary">Followers list coming soon</p>
            </div>
          </div>
        )}

        {activeTab === 'following' && (
          <div className="card">
            <div className="empty-state">
              <Users size={48} className="text-muted" />
              <h3>Following</h3>
              <p className="text-secondary">Following list coming soon</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .profile-header {
          display: flex;
          gap: 2rem;
          align-items: flex-start;
          margin-bottom: 2rem;
          padding: 2rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
        }

        .profile-avatar {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          overflow: hidden;
          flex-shrink: 0;
        }

        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .privacy-badge {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: var(--warning);
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .profile-name-section h1 {
          margin: 0 0 0.25rem 0;
        }

        .profile-name-section p {
          margin: 0;
        }

        .profile-bio {
          color: var(--text-primary);
          line-height: 1.5;
          margin: 0.5rem 0 0 0;
        }

        .profile-stats {
          display: flex;
          gap: 2rem;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .profile-meta {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .profile-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          align-items: stretch;
        }

        .follow-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .profile-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--border);
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .tab-button:hover {
          color: var(--text-primary);
          background: var(--surface-hover);
        }

        .tab-button.active {
          color: var(--accent);
          border-bottom-color: var(--accent);
        }

        .profile-content {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 1.5rem;
        }

        .private-profile {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
          text-align: center;
        }

        .private-profile h3 {
          margin: 0;
          color: var(--text-primary);
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
          .profile-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 1.5rem;
            padding: 1.5rem;
          }

          .profile-avatar {
            width: 100px;
            height: 100px;
          }

          .profile-stats {
            justify-content: center;
            gap: 1.5rem;
          }

          .profile-actions {
            width: 100%;
            max-width: 300px;
          }

          .follow-actions {
            flex-direction: row;
            gap: 0.75rem;
          }

          .profile-tabs {
            flex-direction: column;
            gap: 0;
          }

          .tab-button {
            justify-content: center;
            border-bottom: none;
            border-right: 2px solid transparent;
          }

          .tab-button.active {
            border-bottom: none;
            border-right-color: var(--accent);
            background: var(--surface-hover);
          }

          .profile-content {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UserProfilePage;
