import React from 'react';
import { UserPlus } from 'lucide-react';

const FollowRequestsPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <UserPlus size={32} className="text-accent" />
        <h1 className="heading-lg">Follow Requests</h1>
        <p className="text-secondary">Manage your follow requests</p>
      </div>
      
      <div className="card">
        <div className="empty-state">
          <UserPlus size={48} className="text-muted" />
          <h3>No requests</h3>
          <p className="text-secondary">No pending follow requests</p>
        </div>
      </div>
    </div>
  );
};

export default FollowRequestsPage;
