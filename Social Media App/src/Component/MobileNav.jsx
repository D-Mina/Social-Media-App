import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  IconHome,
  IconCompass,
  IconPlus,
  IconBell,
  IconUser,
} from './Icons';

export default function MobileNav({
  activeTab,
  setActiveTab,
  onOpenCreatePost,
  onSelectUser,
}) {
  const { user, unreadCount } = useAuth();

  return (
    <nav className="mobile-nav-root">
      <button
        className={`mobile-nav-item ${activeTab === 'feed' ? 'active' : ''}`}
        onClick={() => setActiveTab('feed')}
        aria-label="Feed"
      >
        <IconHome size={22} />
        <span>Home</span>
      </button>

      <button
        className={`mobile-nav-item ${activeTab === 'explore' ? 'active' : ''}`}
        onClick={() => setActiveTab('explore')}
        aria-label="Explore"
      >
        <IconCompass size={22} />
        <span>Explore</span>
      </button>

      <button
        className="mobile-nav-item-fab"
        onClick={onOpenCreatePost}
        aria-label="Create Post"
      >
        <IconPlus size={24} />
      </button>

      <button
        className={`mobile-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
        onClick={() => setActiveTab('notifications')}
        aria-label="Notifications"
      >
        <div className="mobile-icon-wrapper">
          <IconBell size={22} />
          {unreadCount > 0 && (
            <span className="mobile-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </div>
        <span>Alerts</span>
      </button>

      <button
        className={`mobile-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => {
          if (onSelectUser) onSelectUser(user?._id || user?.id);
          setActiveTab('profile');
        }}
        aria-label="Profile"
      >
        <IconUser size={22} />
        <span>Profile</span>
      </button>
    </nav>
  );
}
