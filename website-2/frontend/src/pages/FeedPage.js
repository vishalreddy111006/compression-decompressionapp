import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, TrendingUp, Clock, User } from 'lucide-react';
import ContentAccordion from '../components/ContentAccordion';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const FeedPage = () => {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedContent, setSelectedContent] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0,
        limit: 20
    });

    useEffect(() => {
        fetchFeed();
    }, []);

    const fetchFeed = async (page = 1) => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('token');

            if (!token) {
                setError('Please log in to view your feed');
                return;
            }

            const response = await axios.get(`${API_URL}/content/feed?page=${page}&limit=20`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setContent(response.data.content);
                setPagination(response.data.pagination);
                setError(null);
            }
        } catch (error) {
            console.error('Error fetching feed:', error);
            if (error.response?.status === 401) {
                setError('Please log in to view your feed');
            } else {
                setError('Failed to load feed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleContentClick = async (contentId) => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`${API_URL}/content/${contentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setSelectedContent(response.data.content);
        } catch (error) {
            console.error('Error fetching content details:', error);
        }
    };

    const closeContentModal = () => {
        setSelectedContent(null);
    };

    const handleDelete = async (contentId) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.delete(`${API_URL}/content/${contentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Remove from local state
            setContent(content.filter(item => item._id !== contentId));

            // Close modal if this content was selected
            if (selectedContent && selectedContent._id === contentId) {
                setSelectedContent(null);
            }
        } catch (error) {
            console.error('Error deleting content:', error);
            alert('Failed to delete content');
        }
    };

    const loadMoreContent = () => {
        if (pagination.page < pagination.pages) {
            fetchFeed(pagination.page + 1);
        }
    };

    if (loading && content.length === 0) {
        return (
            <div className="feed-page">
                <div className="page-header">
                    <h1 className="page-title">
                        <Users className="icon" />
                        Your Feed
                    </h1>
                    <p className="page-description">Content from users you follow</p>
                </div>
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading your feed...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="feed-page">
                <div className="page-header">
                    <h1 className="page-title">
                        <Users className="icon" />
                        Your Feed
                    </h1>
                    <p className="page-description">Content from users you follow</p>
                </div>
                <div className="card">
                    <div className="error-state">
                        <User size={48} className="text-muted" />
                        <h3>Unable to load feed</h3>
                        <p className="text-secondary">{error}</p>
                        <button className="btn btn-primary" onClick={() => fetchFeed()}>
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="feed-page">
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">
                    <Users className="icon" />
                    Your Feed
                </h1>
                <p className="page-description">Content from users you follow and your own content</p>
            </div>

            {/* Feed Stats */}
            <div className="feed-stats">
                <div className="stat-item">
                    <TrendingUp size={20} />
                    <span>{content.length} recent items</span>
                </div>
                <div className="stat-item">
                    <Users size={20} />
                    <span>{new Set(content.map(item => item.user?._id || item.user)).size} contributors</span>
                </div>
                <div className="stat-item">
                    <Clock size={20} />
                    <span>Updated moments ago</span>
                </div>
            </div>

            {/* Content Display */}
            <div className="feed-content">
                {content.length > 0 ? (
                    <>
                        <ContentAccordion
                            content={content}
                            onDelete={handleDelete}
                            onContentClick={handleContentClick}
                        />

                        {/* Load More Button */}
                        {pagination.page < pagination.pages && (
                            <div className="load-more-section">
                                <button
                                    className="btn btn-outline"
                                    onClick={loadMoreContent}
                                    disabled={loading}
                                >
                                    {loading ? 'Loading...' : 'Load More Content'}
                                </button>
                                <p className="pagination-info">
                                    Showing {content.length} of {pagination.total} items
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="card">
                        <div className="empty-state">
                            <Users size={48} className="text-muted" />
                            <h3>Your feed is empty</h3>
                            <p className="text-secondary">
                                Follow users to see their content here, or start adding your own content!
                            </p>
                            <div className="empty-state-actions">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => window.location.href = '/search'}
                                >
                                    Find Users to Follow
                                </button>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => window.location.href = '/explore'}
                                >
                                    Explore Public Content
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Modal */}
            {selectedContent && (
                <div className="modal-overlay" onClick={closeContentModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedContent.title}</h3>
                            <button className="modal-close" onClick={closeContentModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="content-meta">
                                <span className="content-source">{selectedContent.siteName}</span>
                                <span className="content-author">
                                    by {selectedContent.user?.fullName || selectedContent.user?.username}
                                </span>
                                <span className="content-date">
                                    {new Date(selectedContent.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            {selectedContent.summary && (
                                <div className="content-summary">
                                    <h4>Summary</h4>
                                    <p>{selectedContent.summary.text}</p>
                                </div>
                            )}

                            {selectedContent.tags && selectedContent.tags.length > 0 && (
                                <div className="content-tags">
                                    <h4>Tags</h4>
                                    <div className="tag-list">
                                        {selectedContent.tags.map((tag, index) => (
                                            <span key={index} className="tag">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="content-actions">
                                <a
                                    href={selectedContent.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                >
                                    View Original
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        .feed-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .page-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .page-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 10px 0;
        }

        .page-description {
          color: var(--text-secondary);
          font-size: 1.1rem;
          margin: 0;
        }

        .feed-stats {
          display: flex;
          justify-content: space-around;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 30px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .feed-content {
          margin-bottom: 30px;
        }

        .load-more-section {
          text-align: center;
          margin-top: 30px;
          padding: 20px;
        }

        .pagination-info {
          margin-top: 10px;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .loading-state,
        .error-state,
        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border-color);
          border-top: 4px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-state-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 20px;
        }

        .card {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-block;
          text-align: center;
        }

        .btn-primary {
          background: var(--primary-color);
          color: white;
        }

        .btn-primary:hover {
          background: var(--primary-dark);
        }

        .btn-outline {
          background: transparent;
          color: var(--primary-color);
          border: 1px solid var(--primary-color);
        }

        .btn-outline:hover {
          background: var(--primary-color);
          color: white;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: var(--card-bg);
          border-radius: 12px;
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .modal-header h3 {
          margin: 0;
          color: var(--text-primary);
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--text-secondary);
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-body {
          padding: 20px;
        }

        .content-meta {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .content-summary {
          margin-bottom: 20px;
        }

        .content-summary h4 {
          color: var(--text-primary);
          margin: 0 0 10px 0;
        }

        .content-summary p {
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .content-tags {
          margin-bottom: 20px;
        }

        .content-tags h4 {
          color: var(--text-primary);
          margin: 0 0 10px 0;
        }

        .tag-list {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .tag {
          background: var(--primary-light);
          color: var(--primary-color);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .content-actions {
          text-align: center;
        }

        .text-muted {
          color: var(--text-secondary);
        }

        .text-secondary {
          color: var(--text-secondary);
        }

        .icon {
          width: 24px;
          height: 24px;
        }

        @media (max-width: 768px) {
          .feed-page {
            padding: 15px;
          }

          .page-title {
            font-size: 2rem;
          }

          .feed-stats {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .empty-state-actions {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
        </div>
    );
};

export default FeedPage;
