import React, { useState } from 'react';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { IconX, IconPlus, IconImage, IconLoader } from './Icons';
import { getUserAvatar } from '../utils/helpers';

export default function CreatePostModal({ onClose, onPostCreated }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [bodyText, setBodyText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bodyText.trim() && !imageFile) {
      showToast('Please type a message or select an image', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.posts.createPost({
        body: bodyText,
        image: imageFile,
      });
      showToast('Post published successfully!', 'success');
      const newPost = res?.data?.post || res?.data || res?.post;
      if (onPostCreated) onPostCreated(newPost);
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to publish post', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="modal-card modal-md animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-row">
            <IconPlus size={18} className="text-primary" />
            <h3 className="modal-title">Create New Post</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <IconX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="create-modal-author">
            <img
              src={getUserAvatar(user, 64)}
              alt={user?.name || 'User'}
              className="create-author-avatar"
            />
            <div>
              <div className="create-author-name">{user?.name || 'Route User'}</div>
              <div className="create-author-privacy">Public &bull; Route Community</div>
            </div>
          </div>

          <textarea
            className="create-post-textarea"
            placeholder="What's happening in your tech journey? Share code, ideas, or questions... Use @username or #tag"
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            rows={4}
            autoFocus
          />

          {imagePreview && (
            <div className="image-preview-box">
              <img src={imagePreview} alt="Preview" className="preview-img" />
              <button
                type="button"
                className="btn-remove-preview"
                onClick={handleRemoveImage}
                title="Remove image"
              >
                <IconX size={16} />
              </button>
            </div>
          )}

          <div className="create-post-tools">
            <label className="btn-tool-upload" title="Attach image">
              <IconImage size={18} />
              <span>{imageFile ? 'Change Photo' : 'Add Photo'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </label>
            <span className="create-char-counter">
              {bodyText.length > 0 && `${bodyText.length} chars`}
            </span>
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
              disabled={isSubmitting || (!bodyText.trim() && !imageFile)}
            >
              {isSubmitting ? (
                <>
                  <IconLoader size={16} className="spinner" />
                  <span>Publishing...</span>
                </>
              ) : (
                <span>Publish Post</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
