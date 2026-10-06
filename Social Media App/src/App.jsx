import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './Component/Navbar';
import Sidebar from './Component/Sidebar';
import SuggestionsSidebar from './Component/SuggestionsSidebar';
import MobileNav from './Component/MobileNav';
import CreatePostModal from './Component/CreatePostModal';

// Pages
import AuthPage from './Pages/AuthPage';
import FeedPage from './Pages/FeedPage';
import ProfilePage from './Pages/ProfilePage';
import BookmarksPage from './Pages/BookmarksPage';
import NotificationsPage from './Pages/NotificationsPage';
import SettingsPage from './Pages/SettingsPage';

import { IconLoader, IconSparkles } from './Component/Icons';
import './App.css';

function MainAppShell() {
  const { isAuthenticated, loading, user } = useAuth();

  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'explore' | 'profile' | 'bookmarks' | 'notifications' | 'settings'
  const [targetUserId, setTargetUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Navigate to a specific user's profile
  const handleSelectUser = (userId) => {
    setTargetUserId(userId);
    setActiveTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch tabs helper
  const handleTabChange = (tab) => {
    if (tab === 'profile') {
      setTargetUserId(user?._id || user?.id);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="app-global-loader">
        <div className="loader-box">
          <div className="brand-logo-icon lg">
            <IconSparkles size={28} />
          </div>
          <IconLoader size={36} className="spinner mt-3" />
          <p className="loader-text">Loading Route Social...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="app-layout-root">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenCreatePost={() => setShowCreateModal(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectUser={handleSelectUser}
      />

      {/* Main 3-Column Desktop Grid / Flexible Container */}
      <div className="main-layout-container">
        {/* Left Column: Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          onOpenCreatePost={() => setShowCreateModal(true)}
          onSelectUser={handleSelectUser}
        />

        {/* Center Column: Dynamic Page Stream */}
        <main className="main-content-column">
          {activeTab === 'feed' && (
            <FeedPage
              onSelectUser={handleSelectUser}
              searchQuery={searchQuery}
              initialMode="all"
            />
          )}

          {activeTab === 'explore' && (
            <FeedPage
              onSelectUser={handleSelectUser}
              searchQuery={searchQuery}
              initialMode="all"
            />
          )}

          {activeTab === 'profile' && (
            <ProfilePage
              targetUserId={targetUserId}
              onSelectUser={handleSelectUser}
            />
          )}

          {activeTab === 'bookmarks' && (
            <BookmarksPage onSelectUser={handleSelectUser} />
          )}

          {activeTab === 'notifications' && (
            <NotificationsPage onSelectUser={handleSelectUser} />
          )}

          {activeTab === 'settings' && <SettingsPage />}
        </main>

        {/* Right Column: User Suggestions & Community Info */}
        <SuggestionsSidebar onSelectUser={handleSelectUser} />
      </div>

      {/* Mobile Floating Bottom Bar */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenCreatePost={() => setShowCreateModal(true)}
        onSelectUser={handleSelectUser}
      />

      {/* Quick Create Post Global Modal */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onPostCreated={() => {
            // If on feed, trigger feed refresh or switch to feed
            setActiveTab('feed');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainAppShell />
      </AuthProvider>
    </ToastProvider>
  );
}
