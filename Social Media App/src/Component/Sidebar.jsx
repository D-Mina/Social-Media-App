import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  IconHome,
  IconCompass,
  IconBookmark,
  IconBell,
  IconUser,
  IconSettings,
  IconPlus,
  IconLogOut,
} from './Icons';
import { getUserAvatar } from '../utils/helpers';

export default function Sidebar({
  activeTab,
  setActiveTab,
  onOpenCreatePost,
  onSelectUser,
}) {
  const { user, logout, unreadCount } = useAuth();

  const navItems = [
    { id: 'feed', label: 'Home Feed', icon: IconHome },
    { id: 'explore', label: 'Explore Posts', icon: IconCompass },
    { id: 'notifications', label: 'Notifications', icon: IconBell, badge: unreadCount },
    { id: 'bookmarks', label: 'Bookmarks', icon: IconBookmark },
    {
      id: 'profile',
      label: 'My Profile',
      icon: IconUser,
      onClick: () => {
        if (onSelectUser) onSelectUser(user?._id || user?.id);
        setActiveTab('profile');
      },
    },
    { id: 'settings', label: 'Settings', icon: IconSettings },
  ];

  return (
    <aside className="sidebar-root">
      <div className="sidebar-sticky-wrapper">
        {/* Navigation list */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={item.onClick || (() => setActiveTab(item.id))}
              >
                <div className="sidebar-nav-icon-wrapper">
                  <Icon size={22} />
                  {item.badge > 0 && (
                    <span className="sidebar-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                  )}
                </div>
                <span className="sidebar-nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Primary Create Post Button */}
        <div className="sidebar-action-container">
          <button
            className="sidebar-btn-create-post"
            onClick={onOpenCreatePost}
          >
            <IconPlus size={20} />
            <span>Create Post</span>
          </button>
        </div>

        {/* Current user card at bottom */}
        <div className="sidebar-user-card">
          <div
            className="sidebar-user-info-area"
            onClick={() => {
              if (onSelectUser) onSelectUser(user?._id || user?.id);
              setActiveTab('profile');
            }}
          >
            <img
              src={getUserAvatar(user, 80)}
              alt={user?.name || 'User'}
              className="sidebar-user-avatar"
            />
            <div className="sidebar-user-details">
              <span className="sidebar-user-name">{user?.name || 'Route User'}</span>
              <span className="sidebar-user-handle">@{user?.username || 'user'}</span>
            </div>
          </div>
          <button
            className="sidebar-btn-logout"
            onClick={logout}
            title="Log Out"
          >
            <IconLogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
