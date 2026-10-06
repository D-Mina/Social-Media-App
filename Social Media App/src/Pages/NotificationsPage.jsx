import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  IconBell,
  IconCheck,
  IconLoader,
  IconHeart,
  IconMessage,
  IconUser,
  IconSparkles,
} from '../Component/Icons';
import { formatRelativeTime, getUserAvatar } from '../utils/helpers';

export default function NotificationsPage({ onSelectUser }) {
  const { fetchUnreadCount } = useAuth();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [filterUnread, setFilterUnread] = useState(false);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.notifications.getNotifications({
        unread: filterUnread ? 'true' : 'false',
        page: 1,
        limit: 25,
      });
      const list =
        res?.data?.notifications ||
        res?.data ||
        res?.notifications ||
        [];
      setNotifications(Array.isArray(list) ? list : []);
    } catch (err) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [filterUnread]);

  const handleMarkAsRead = async (notifId, isAlreadyRead) => {
    if (isAlreadyRead) return;
    try {
      await api.notifications.markAsRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => ((n._id || n.id) === notifId ? { ...n, isRead: true, read: true } : n))
      );
      fetchUnreadCount();
    } catch {
      // silent
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await api.notifications.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, read: true }))
      );
      fetchUnreadCount();
      showToast('All notifications marked as read', 'success');
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setMarkingAll(false);
    }
  };

  const getNotificationIcon = (type) => {
    if (type?.includes('like')) return <IconHeart size={16} className="text-rose filled" />;
    if (type?.includes('comment') || type?.includes('reply'))
      return <IconMessage size={16} className="text-blue" />;
    if (type?.includes('follow')) return <IconUser size={16} className="text-indigo" />;
    return <IconBell size={16} className="text-primary" />;
  };

  return (
    <div className="notifications-page-root">
      {/* Header bar */}
      <div className="page-header-card">
        <div className="page-header-left">
          <div className="page-header-icon-box">
            <IconBell size={22} />
          </div>
          <div>
            <h2 className="page-header-title">Notifications</h2>
            <p className="page-header-sub">Keep track of interactions and followers</p>
          </div>
        </div>

        <div className="notifications-header-actions">
          <button
            className={`btn-filter-pill ${!filterUnread ? 'active' : ''}`}
            onClick={() => setFilterUnread(false)}
          >
            All
          </button>
          <button
            className={`btn-filter-pill ${filterUnread ? 'active' : ''}`}
            onClick={() => setFilterUnread(true)}
          >
            Unread
          </button>
          <button
            className="btn-mark-all"
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            title="Mark all as read"
          >
            {markingAll ? <IconLoader size={15} className="spinner" /> : <IconCheck size={15} />}
            <span>Mark all read</span>
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="notifications-stream">
        {loading ? (
          <div className="feed-skeleton-list">
            {[1, 2, 3].map((n) => (
              <div key={n} className="notif-skeleton-item">
                <div className="skeleton-avatar sm" />
                <div className="skeleton-line w-60" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="feed-empty-card">
            <div className="empty-icon-circle">
              <IconBell size={30} />
            </div>
            <h3 className="empty-title">All caught up!</h3>
            <p className="empty-desc">
              {filterUnread
                ? 'No unread notifications right now.'
                : 'No notifications yet. When members interact with your posts or follow you, updates will appear here.'}
            </p>
          </div>
        ) : (
          notifications.map((item) => {
            const notifId = item._id || item.id;
            const isRead = item.isRead || item.read;
            const sender = item.sender || item.fromUser || item.user || {};
            const senderId = sender._id || sender.id;

            return (
              <div
                key={notifId}
                className={`notification-item ${!isRead ? 'unread' : ''}`}
                onClick={() => handleMarkAsRead(notifId, isRead)}
              >
                <div className="notif-icon-badge">
                  {getNotificationIcon(item.type || item.action)}
                </div>

                <img
                  src={getUserAvatar(sender, 60)}
                  alt={sender.name || 'User'}
                  className="notif-sender-avatar"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (senderId && onSelectUser) onSelectUser(senderId);
                  }}
                />

                <div className="notif-content-area">
                  <div className="notif-text-row">
                    <span
                      className="notif-sender-name"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (senderId && onSelectUser) onSelectUser(senderId);
                      }}
                    >
                      {sender.name || 'A Route User'}
                    </span>{' '}
                    <span className="notif-text">
                      {item.message ||
                        item.text ||
                        item.body ||
                        'interacted with your content on Route Social'}
                    </span>
                  </div>
                  <span className="notif-time">
                    {formatRelativeTime(item.createdAt || item.date)}
                  </span>
                </div>

                {!isRead && <span className="notif-unread-dot" title="Unread" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
