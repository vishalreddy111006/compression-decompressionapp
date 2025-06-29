import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart3, 
  Plus, 
  Sparkles, 
  Globe,
  TrendingUp,
  Users,
  FileText 
} from 'lucide-react';
import axios from 'axios';
import ContentAccordion from '../components/ContentAccordion';

const DashboardPage = () => {
  const { user } = useAuth();
  const [content, setContent] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [stats, setStats] = useState({
    totalContent: 0,
    totalSummaries: 0,
    followerCount: 0,
    followingCount: 0
  });
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ title: '', url: '', content: '' });
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

  useEffect(() => {
    const loadDashboardData = async () => {
      if (user) {
        await Promise.all([
          fetchUserContent(),
          fetchUserStats()
        ]);
      }
    };
    
    loadDashboardData();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserContent = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${API_URL}/content`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setContent(response.data.content || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      // Use user stats if available, otherwise fetch from API
      if (user) {
        setStats({
          totalContent: user.stats?.totalContent || content.length || 0,
          totalSummaries: user.stats?.totalSummaries || content.length || 0,
          followerCount: user.followerCount || 0,
          followingCount: user.followingCount || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
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

  const deleteContent = async (contentId) => {
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
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalContent: Math.max(0, prev.totalContent - 1),
        totalSummaries: Math.max(0, prev.totalSummaries - 1)
      }));
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete content. Please try again.');
    }
  };

  const openAddModal = () => setShowAddModal(true);
  const closeAddModal = () => {
    setShowAddModal(false);
    setAddForm({ title: '', url: '', content: '' });
    setAddError('');
  };

  const handleAddChange = (e) => {
    setAddForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddContent = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError('');
    try {
      const token = sessionStorage.getItem('token');
      let siteName = 'manual';
      try {
        siteName = (new URL(addForm.url)).hostname || 'manual';
      } catch (err) {}
      const payload = {
        ...addForm,
        summary: {
          text: addForm.content.substring(0, 5000),
          model: 'manual',
          note: 'Added manually from dashboard'
        },
        siteName
      };
      const response = await axios.post(`${API_URL}/content`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setContent([response.data.content, ...content]);
      setStats(prev => ({ ...prev, totalContent: prev.totalContent + 1, totalSummaries: prev.totalSummaries + 1 }));
      closeAddModal();
    } catch (error) {
      setAddError(
        error.response?.data?.message ||
        (error.response?.data?.errors ? error.response.data.errors.join(', ') : 'Failed to add content')
      );
    } finally {
      setAddLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
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
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="heading-lg">Hi,Welcome back, {user?.fullName || user?.username}!</h1>
          <p className="text-secondary">Here's your content summarization overview</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} />
          Add Content
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalContent}</h3>
            <p className="stat-label">Total Content</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Sparkles size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalSummaries}</h3>
            <p className="stat-label">AI Summaries</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.followerCount}</h3>
            <p className="stat-label">Followers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.followingCount}</h3>
            <p className="stat-label">Following</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-section">
          <div className="section-header">
            <h2 className="heading-md">Your Content</h2>
            <p className="text-secondary">
              {content.length > 0 
                ? `${content.length} items saved`
                : 'No content saved yet'
              }
            </p>
          </div>
          
          <ContentAccordion 
            content={content}
            onDelete={deleteContent}
            onContentClick={handleContentClick}
          />
        </div>
      </div>

      {/* Content Modal */}
      {selectedContent && (
        <div className="content-modal">
          <div className="modal-overlay" onClick={closeContentModal}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedContent.title}</h2>
              <div className="modal-header-actions">
                <button 
                  className="modal-delete-btn"
                  onClick={() => deleteContent(selectedContent._id)}
                  title="Delete content"
                >
                  <BarChart3 size={18} />
                </button>
                <span className="close-modal" onClick={closeContentModal}>&times;</span>
              </div>
            </div>
            <div className="modal-body">
              <p className="content-source">{selectedContent.siteName}</p>
              <div className="content-details">
                {selectedContent.imageUrl && (
                  <img 
                    src={selectedContent.imageUrl} 
                    alt={selectedContent.title} 
                    className="content-image" 
                  />
                )}
                <div className="content-text">
                  <p className="content-date">
                    {new Date(selectedContent.createdAt).toLocaleDateString()}
                  </p>
                  <div className="content-summary">
                    <div className="summary-header">
                      <h4>AI Summary:</h4>
                    </div>
                    {(() => {
                      if (selectedContent.summary) {
                        if (typeof selectedContent.summary === 'string') {
                          return <div className="summary-text">{selectedContent.summary}</div>;
                        } else if (selectedContent.summary.text) {
                          return (
                            <div className="summary-text">
                              {selectedContent.summary.text}
                              <div className="summary-meta">
                                <small>
                                  Generated {selectedContent.summary.generatedAt ? 
                                    new Date(selectedContent.summary.generatedAt).toLocaleDateString() : 
                                    'recently'
                                  }
                                </small>
                              </div>
                            </div>
                          );
                        }
                      }
                      return <div className="summary-text">No summary available</div>;
                    })()}
                  </div>
                  {selectedContent.content && (
                    <div className="original-content">
                      <h4>Original Content:</h4>
                      <div className="content-body">
                        {selectedContent.content}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <a 
                  href={selectedContent.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <Globe size={16} />
                  View Original
                </a>
                <button className="btn btn-secondary" onClick={closeContentModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Content Modal */}
      {showAddModal && (
        <div className="content-modal">
          <div className="modal-overlay" onClick={closeAddModal}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Content</h2>
              <span className="close-modal" onClick={closeAddModal}>&times;</span>
            </div>
            <div className="modal-body">
              <form className="add-content-form" onSubmit={handleAddContent}>
                {addError && <div className="error-message">{addError}</div>}
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" name="title" value={addForm.title} onChange={handleAddChange} required />
                </div>
                <div className="form-group">
                  <label>URL</label>
                  <input type="url" name="url" value={addForm.url} onChange={handleAddChange} required />
                </div>
                <div className="form-group">
                  <label>Content</label>
                  <textarea name="content" value={addForm.content} onChange={handleAddChange} rows={5} required />
                </div>
                <div className="modal-footer">
                  <button className="btn btn-primary" type="submit" disabled={addLoading}>
                    {addLoading ? 'Adding...' : 'Add Content'}
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={closeAddModal}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dashboard {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          background: var(--surface-hover);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .stat-icon {
          background: var(--accent);
          color: white;
          width: 48px;
          height: 48px;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 0.25rem 0;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .dashboard-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .content-section {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 1.5rem;
        }

        .section-header {
          margin-bottom: 1.5rem;
        }

        .section-header h2 {
          margin: 0 0 0.5rem 0;
        }

        .section-header p {
          margin: 0;
        }

        /* Content Modal Styles */
        .content-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }

        .modal-content {
          position: relative;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 1rem;
          max-width: 800px;
          max-height: 90vh;
          width: 90%;
          margin: 2rem;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .modal-header h2 {
          margin: 0;
          color: var(--text-primary);
          font-size: 1.25rem;
          flex: 1;
        }

        .modal-header-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .modal-delete-btn {
          padding: 0.5rem;
          background: var(--danger);
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modal-delete-btn:hover {
          background: var(--danger-hover);
        }

        .close-modal {
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text-secondary);
          padding: 0.25rem;
          transition: color 0.2s ease;
        }

        .close-modal:hover {
          color: var(--text-primary);
        }

        .modal-body {
          padding: 1.5rem;
          max-height: 60vh;
          overflow-y: auto;
        }

        .content-source {
          color: var(--accent);
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .content-details {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .content-image {
          width: 100%;
          max-height: 200px;
          object-fit: cover;
          border-radius: 0.5rem;
        }

        .content-text {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .content-date {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin: 0;
        }

        .content-summary {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          padding: 1rem;
        }

        .summary-header h4 {
          margin: 0 0 0.75rem 0;
          color: var(--text-primary);
          font-size: 1rem;
        }

        .summary-text {
          color: var(--text-primary);
          line-height: 1.6;
          margin-bottom: 0.5rem;
        }

        .summary-meta {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .original-content h4 {
          margin: 0 0 0.75rem 0;
          color: var(--text-primary);
          font-size: 1rem;
        }

        .content-body {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          padding: 1rem;
          color: var(--text-secondary);
          line-height: 1.6;
          max-height: 300px;
          overflow-y: auto;
        }

        .modal-footer {
          padding: 1.5rem;
          border-top: 1px solid var(--border);
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
        }

        /* Add Content Modal Styles */
        .add-content-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .add-content-modal .modal-content {
          max-width: 600px;
          width: 90%;
          margin: 1.5rem;
        }

        .add-content-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
          color: var(--text-primary);
        }

        .form-input,
        .form-textarea {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 0.375rem;
          padding: 0.75rem;
          font-size: 1rem;
          color: var(--text-primary);
          transition: border-color 0.2s ease;
        }

        .form-input:focus,
        .form-textarea:focus {
          border-color: var(--accent);
          outline: none;
        }

        .form-textarea {
          resize: vertical;
        }

        .error-message {
          color: var(--danger);
          font-size: 0.875rem;
          margin-top: -0.5rem;
        }

        @media (max-width: 768px) {
          .dashboard {
            padding: 1rem;
          }

          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .dashboard-stats {
            grid-template-columns: 1fr;
          }

          .modal-content {
            width: 95%;
            margin: 1rem;
          }

          .modal-header,
          .modal-body,
          .modal-footer {
            padding: 1rem;
          }

          .modal-footer {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
