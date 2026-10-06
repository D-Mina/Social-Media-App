import React, { useState } from 'react';
import { api } from '../api/api';
import { useToast } from '../context/ToastContext';
import { IconX, IconShare, IconLoader } from './Icons';
import { getUserAvatar } from '../utils/helpers';

export default function SharePostModal({ post, onClose, onShareSuccess }) {
  const { showToast } = useToast();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleShare = async (e) => {
    e.preventDefault();
    if (!post) return;

    try {
      setIsSubmitting(true);
      await api.posts.sharePost(post._id || post.id, { body: commentText });
      showToast('Post shared to your profile!', 'success');
      if (onShareSuccess) onShareSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to share post', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const author = post?.user || post?.creator || {};

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="modal-card modal-md animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-row">
            <IconShare size={18} className="text-primary" />
            <h3 className="modal-title">Share Post</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <IconX size={18} />
          </button>
        </div>

        <form onSubmit={handleShare} className="modal-body share-modal-body">
          <textarea
            className="share-textarea"
            placeholder="Add your thoughts or commentary... (Optional)"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
          />

          {/* Quoted post card preview */}
          <div className="quoted-post-preview">
            <div className="quoted-post-header">
              <img
                src={getUserAvatar(author, 50)}
                alt={author?.name || 'Author'}
                className="quoted-post-avatar"
              />
              <div className="quoted-post-author-info">
                <span className="quoted-author-name">{author?.name || 'Route User'}</span>
                <span className="quoted-author-handle">@{author?.username || 'user'}</span>
              </div>
            </div>
            <p className="quoted-post-body">{post?.body}</p>
            {post?.image && (
              <img
                src={post.image}
                alt="Post attachment"
                className="quoted-post-image"
              />
            )}
          </div>

          <div className="modal-footer-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <IconLoader size={16} className="spinner" />
                  <span>Sharing...</span>
                </>
              ) : (
                <>
                  <IconShare size={16} />
                  <span>Share Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
