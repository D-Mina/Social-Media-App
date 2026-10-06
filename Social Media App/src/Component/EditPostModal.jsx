import React, { useState } from 'react';
import { api } from '../api/api';
import { useToast } from '../context/ToastContext';
import { IconX, IconEdit, IconImage, IconLoader } from './Icons';

export default function EditPostModal({ post, onClose, onPostUpdated }) {
  const { showToast } = useToast();
  const [bodyText, setBodyText] = useState(post?.body || '');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(post?.image || null);
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
    if (!bodyText.trim() && !imagePreview && !imageFile) {
      showToast('Post cannot be empty', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.posts.updatePost(post._id || post.id, {
        body: bodyText,
        image: imageFile,
      });
      showToast('Post updated successfully!', 'success');
      const updatedPost = res?.data?.post || res?.data || res?.post;
      if (onPostUpdated) onPostUpdated(updatedPost);
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to update post', 'error');
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
            <IconEdit size={18} className="text-primary" />
            <h3 className="modal-title">Edit Post</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <IconX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <textarea
            className="create-post-textarea"
            placeholder="Edit your post content..."
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
            <label className="btn-tool-upload" title="Change photo">
              <IconImage size={18} />
              <span>Change Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </label>
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
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
