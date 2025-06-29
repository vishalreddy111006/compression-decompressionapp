import React from 'react';
import { Bell } from 'lucide-react';

const NotificationsPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <Bell size={32} className="text-accent" />
        <h1 className="heading-lg">Notifications</h1>
        <p className="text-secondary">Stay updated with your activity</p>
      </div>
      
      <div className="card">
        <div className="empty-state">
          <Bell size={48} className="text-muted" />
          <h3>No notifications</h3>
          <p className="text-secondary">You're all caught up!</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
