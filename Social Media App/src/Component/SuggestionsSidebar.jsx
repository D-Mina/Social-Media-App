import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import { useToast } from '../context/ToastContext';
import { IconUsers, IconSparkles, IconCheck, IconPlus, IconLoader } from './Icons';
import { getUserAvatar } from '../utils/helpers';

export default function SuggestionsSidebar({ onSelectUser }) {
  const { showToast } = useToast();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState({});
  const [loadingMap, setLoadingMap] = useState({});

  useEffect(() => {
    let isMounted = true;
    async function loadSuggestions() {
      try {
        setLoading(true);
        const res = await api.auth.getSuggestions(6);
        // data might be { data: { users: [...] } } or { data: [...] } or { users: [...] }
        const list = res?.data?.users || res?.data?.suggestions || res?.data || res?.users || [];
        if (isMounted) {
          setSuggestions(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        // silent fallback if suggestions fail
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSuggestions();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleFollow = async (userId, e) => {
    e.stopPropagation();
    if (loadingMap[userId]) return;

    setLoadingMap((prev) => ({ ...prev, [userId]: true }));
    const wasFollowing = !!followingMap[userId];

    try {
      await api.auth.toggleFollow(userId);
      setFollowingMap((prev) => ({ ...prev, [userId]: !wasFollowing }));
      showToast(
        wasFollowing ? 'Unfollowed user' : 'You are now following this user!',
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setLoadingMap((prev) => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <aside className="suggestions-sidebar-root">
      {/* Suggestions Card */}
      <div className="card-widget">
        <div className="widget-header">
          <div className="widget-title-row">
            <IconUsers size={18} className="widget-icon" />
            <h3 className="widget-title">Who to Follow</h3>
          </div>
          <span className="widget-subtitle">Route Academy peers</span>
        </div>

        {loading ? (
          <div className="widget-loading-state">
            <IconLoader size={20} className="spinner" />
            <span>Finding peers...</span>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="widget-empty-state">
            <span>No suggested users at the moment</span>
          </div>
        ) : (
          <div className="suggestions-list">
            {suggestions.map((u) => {
              const uId = u._id || u.id;
              const isFollowing = !!followingMap[uId] || u.isFollowing;
              const isLoading = !!loadingMap[uId];

              return (
                <div
                  key={uId}
                  className="suggestion-item"
                  onClick={() => onSelectUser && onSelectUser(uId)}
                  role="button"
                  tabIndex={0}
                >
                  <img
                    src={getUserAvatar(u, 72)}
                    alt={u.name || 'User'}
                    className="suggestion-avatar"
                  />
                  <div className="suggestion-info">
                    <span className="suggestion-name">{u.name || 'Peer'}</span>
                    <span className="suggestion-handle">@{u.username || 'user'}</span>
                  </div>
                  <button
                    className={`btn-follow-action ${isFollowing ? 'following' : ''}`}
                    onClick={(e) => handleToggleFollow(uId, e)}
                    disabled={isLoading}
                    title={isFollowing ? 'Unfollow' : 'Follow'}
                  >
                    {isLoading ? (
                      <IconLoader size={14} />
                    ) : isFollowing ? (
                      <>
                        <IconCheck size={13} />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <IconPlus size={13} />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Route Academy Community Widget */}
      <div className="card-widget route-academy-promo-card">
        <div className="promo-badge">
          <IconSparkles size={14} />
          <span>Route Academy</span>
        </div>
        <h4 className="promo-title">Egypt's Leading IT Training Center</h4>
        <p className="promo-desc">
          Established in 2012. Master Frontend, MERN, Flutter & Cloud engineering with top mentors.
        </p>
        <div className="promo-tags">
          <span className="promo-tag">#RoutePosts</span>
          <span className="promo-tag">#FullStack</span>
          <span className="promo-tag">#React19</span>
          <span className="promo-tag">#TechEgypt</span>
        </div>
      </div>

      {/* Footer Links */}
      <div className="sidebar-footer-links">
        <span>&copy; {new Date().getFullYear()} Route Posts Platform</span>
        <span>Privacy &bull; Terms &bull; API Docs</span>
      </div>
    </aside>
  );
}
