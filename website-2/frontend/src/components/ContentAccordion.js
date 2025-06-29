import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Calendar, 
  Trash2, 
  Globe,
  FileText,
  Sparkles 
} from 'lucide-react';

const ContentAccordion = ({ content, onDelete, onContentClick }) => {
  const [expandedItems, setExpandedItems] = useState(new Set());

  const toggleExpanded = (contentId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(contentId)) {
      newExpanded.delete(contentId);
    } else {
      newExpanded.add(contentId);
    }
    setExpandedItems(newExpanded);
  };

  const getSummaryText = (summary) => {
    if (!summary) return 'No summary available';
    if (typeof summary === 'string') return summary;
    if (summary.text) return summary.text;
    return 'No summary available';
  };

  const getPreviewText = (item) => {
    const summary = getSummaryText(item.summary);
    if (summary !== 'No summary available') {
      return summary.substring(0, 150) + (summary.length > 150 ? '...' : '');
    }
    if (item.content && typeof item.content === 'string') {
      return item.content.substring(0, 150) + (item.content.length > 150 ? '...' : '');
    }
    return 'No preview available';
  };

  if (!content || content.length === 0) {
    return (
      <div className="content-accordion">
        <div className="empty-state">
          <FileText size={48} className="text-muted" />
          <h3>No content yet</h3>
          <p className="text-secondary">
            Install our Chrome extension and start extracting content from your favorite websites!
          </p>
          <button className="btn btn-primary">
            <Globe size={16} />
            Get Chrome Extension
          </button>
        </div>

        <style jsx>{`
          .content-accordion {
            width: 100%;
          }

          .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem 2rem;
            text-align: center;
            gap: 1rem;
          }

          .empty-state h3 {
            color: var(--text-primary);
            margin: 0;
            font-size: 1.25rem;
          }

          .empty-state p {
            color: var(--text-secondary);
            margin: 0;
            max-width: 400px;
            line-height: 1.5;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="content-accordion">
      {content.map((item) => {
        const isExpanded = expandedItems.has(item._id);
        const summaryText = getSummaryText(item.summary);
        
        return (
          <div key={item._id} className="accordion-item">
            <div 
              className="accordion-header"
              onClick={() => toggleExpanded(item._id)}
            >
              <div className="header-content">
                <div className="title-section">
                  <h3 className="content-title">{item.title}</h3>
                  <div className="content-meta">
                    <span className="content-source">{item.siteName}</span>
                    <span className="content-date">
                      <Calendar size={14} />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="header-actions">
                  <button
                    className="expand-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(item._id);
                    }}
                  >
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>
              
              {!isExpanded && (
                <div className="content-preview">
                  <p>{getPreviewText(item)}</p>
                </div>
              )}
            </div>

            {isExpanded && (
              <div className="accordion-content">
                {item.imageUrl && (
                  <div className="content-image-container">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="content-image"
                    />
                  </div>
                )}

                <div className="content-details">
                  <div className="summary-section">
                    <div className="summary-header">
                      <Sparkles size={18} />
                      <h4>AI Summary</h4>
                      <span className="summary-badge">Generated</span>
                    </div>
                    <div className="summary-text">
                      {summaryText}
                    </div>
                    {item.summary && item.summary.generatedAt && (
                      <div className="summary-meta">
                        <small>
                          Generated on {new Date(item.summary.generatedAt).toLocaleDateString()}
                        </small>
                      </div>
                    )}
                  </div>

                  {item.content && (
                    <div className="original-content-section">
                      <h4>Original Content</h4>
                      <div className="original-content">
                        {item.content.substring(0, 500)}
                        {item.content.length > 500 && '...'}
                      </div>
                    </div>
                  )}

                  <div className="content-actions">
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={14} />
                      View Original
                    </a>
                    
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onContentClick) {
                          onContentClick(item._id);
                        }
                      }}
                    >
                      <FileText size={14} />
                      Full Details
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this content?')) {
                          onDelete(item._id);
                        }
                      }}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <style jsx>{`
        .content-accordion {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .accordion-item {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .accordion-item:hover {
          border-color: var(--accent);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .accordion-header {
          padding: 1.25rem;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .accordion-header:hover {
          background: var(--surface-hover);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .title-section {
          flex: 1;
        }

        .content-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
          line-height: 1.3;
        }

        .content-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .content-source {
          color: var(--accent);
          font-weight: 500;
          font-size: 0.875rem;
        }

        .content-date {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .expand-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: var(--surface-hover);
          border: 1px solid var(--border);
          border-radius: 0.375rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .expand-button:hover {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .content-preview {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border);
        }

        .content-preview p {
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
        }

        .accordion-content {
          border-top: 1px solid var(--border);
          padding: 1.5rem;
          background: var(--background);
        }

        .content-image-container {
          margin-bottom: 1.5rem;
        }

        .content-image {
          width: 100%;
          max-height: 200px;
          object-fit: cover;
          border-radius: 0.5rem;
        }

        .content-details {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .summary-section {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          padding: 1rem;
        }

        .summary-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .summary-header h4 {
          margin: 0;
          color: var(--text-primary);
          font-size: 1rem;
        }

        .summary-badge {
          background: var(--accent);
          color: white;
          font-size: 0.75rem;
          padding: 0.125rem 0.5rem;
          border-radius: 1rem;
          font-weight: 500;
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

        .original-content-section h4 {
          margin: 0 0 0.75rem 0;
          color: var(--text-primary);
          font-size: 1rem;
        }

        .original-content {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          padding: 1rem;
          color: var(--text-secondary);
          line-height: 1.6;
          font-size: 0.9rem;
        }

        .content-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 0.75rem;
          }

          .content-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .content-actions {
            flex-direction: column;
          }

          .accordion-header,
          .accordion-content {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ContentAccordion;
