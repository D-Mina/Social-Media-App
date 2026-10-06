import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  IconBell,
  IconPlus,
  IconSearch,
  IconUser,
  IconBookmark,
  IconSettings,
  IconLogOut,
  IconSparkles,
} from './Icons';
import { getUserAvatar } from '../utils/helpers';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenCreatePost,
  searchQuery,
  setSearchQuery,
  onSelectUser,
}) {
  const { user, logout, unreadCount } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="navbar-root">
      <div className="navbar-container">
        {/* Brand Logo */}
        <div
          className="navbar-brand"
          onClick={() => setActiveTab('feed')}
          role="button"
          tabIndex={0}
        >
          <div className="brand-logo-icon">
            <IconSparkles size={22} className="brand-icon-svg" />
          </div>
          <div className="brand-text">
            <span className="brand-title">Route</span>
            <span className="brand-subtitle">Posts</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="navbar-search">
          <IconSearch size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search posts, @mentions, #tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              &times;
            </button>
          )}
        </div>

        {/* Right Actions */}
        <div className="navbar-actions">
          <button
            className="btn-create-post-nav"
            onClick={onOpenCreatePost}
            title="Create a new post"
          >
            <IconPlus size={18} />
            <span className="nav-btn-text">Post</span>
          </button>

          {/* Notifications Button */}
          <button
            className={`nav-icon-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
            title="Notifications"
          >
            <IconBell size={22} />
            {unreadCount > 0 && (
              <span className="badge-notification">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Dropdown */}
          <div className="nav-profile-menu" ref={dropdownRef}>
            <button
              className="nav-avatar-btn"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-label="User menu"
            >
              <img
                src={getUserAvatar(user, 72)}
                alt={user?.name || 'User avatar'}
                className="nav-avatar-img"
              />
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu-card animate-fade-in">
                <div className="dropdown-header">
                  <img
                    src={getUserAvatar(user, 96)}
                    alt={user?.name || 'User'}
                    className="dropdown-user-avatar"
                  />
                  <div className="dropdown-user-info">
                    <div className="dropdown-user-name">{user?.name || 'Route Student'}</div>
                    <div className="dropdown-user-handle">@{user?.username || 'user'}</div>
                  </div>
                </div>

                <div className="dropdown-divider" />

                <button
                  className="dropdown-item"
                  onClick={() => {
                    setDropdownOpen(false);
                    if (onSelectUser) onSelectUser(user?._id || user?.id);
                    setActiveTab('profile');
                  }}
                >
                  <IconUser size={18} />
                  <span>My Profile</span>
                </button>

                <button
                  className="dropdown-item"
                  onClick={() => {
                    setDropdownOpen(false);
                    setActiveTab('bookmarks');
                  }}
                >
                  <IconBookmark size={18} />
                  <span>Bookmarks</span>
                </button>

                <button
                  className="dropdown-item"
                  onClick={() => {
                    setDropdownOpen(false);
                    setActiveTab('settings');
                  }}
                >
                  <IconSettings size={18} />
                  <span>Settings & Security</span>
                </button>

                <div className="dropdown-divider" />

                <button
                  className="dropdown-item dropdown-item-danger"
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                >
                  <IconLogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
