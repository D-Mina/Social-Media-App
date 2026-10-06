import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import { IconX, IconHeart, IconLoader } from './Icons';
import { getUserAvatar } from '../utils/helpers';

export default function PostLikesModal({ postId, onClose, onSelectUser }) {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchLikes() {
      try {
        setLoading(true);
        const res = await api.posts.getPostLikes(postId);
        // data shape could be res.data.likes or res.data or res.likes
        const list = res?.data?.likes || res?.data?.users || res?.data || res?.likes || [];
        if (isMounted) {
          setLikes(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load likes');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (postId) fetchLikes();
    return () => {
      isMounted = false;
    };
  }, [postId]);

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="modal-card modal-sm animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-row">
            <IconHeart size={18} className="text-rose filled" />
            <h3 className="modal-title">Liked by</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <IconX size={18} />
          </button>
        </div>

        <div className="modal-body modal-likes-list">
          {loading ? (
            <div className="state-empty">
              <IconLoader size={24} className="spinner" />
              <span>Loading people...</span>
            </div>
          ) : error ? (
            <div className="state-empty text-danger">
              <span>{error}</span>
            </div>
          ) : likes.length === 0 ? (
            <div className="state-empty">
              <span>No likes yet on this post.</span>
            </div>
          ) : (
            likes.map((item, idx) => {
              // item could be user object directly or { user: {...} }
              const userObj = item?.user || item;
              const uId = userObj?._id || userObj?.id || idx;

              return (
                <div
                  key={uId}
                  className="like-user-row"
                  onClick={() => {
                    if (onSelectUser && (userObj?._id || userObj?.id)) {
                      onSelectUser(userObj?._id || userObj?.id);
                      onClose();
                    }
                  }}
                >
                  <img
                    src={getUserAvatar(userObj, 64)}
                    alt={userObj?.name || 'User'}
                    className="like-user-avatar"
                  />
                  <div className="like-user-info">
                    <span className="like-user-name">{userObj?.name || 'Route User'}</span>
                    <span className="like-user-handle">@{userObj?.username || 'user'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
