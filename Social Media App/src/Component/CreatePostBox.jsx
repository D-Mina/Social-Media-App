import React, { useState } from 'react';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { IconImage, IconSend, IconX, IconLoader } from './Icons';
import { getUserAvatar } from '../utils/helpers';

export default function CreatePostBox({ onPostCreated }) {
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
      showToast('Write a post or add an image', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.posts.createPost({
        body: bodyText,
        image: imageFile,
      });
      showToast('Post published successfully!', 'success');
      setBodyText('');
      setImageFile(null);
      setImagePreview(null);
      const newPost = res?.data?.post || res?.data || res?.post;
      if (onPostCreated) onPostCreated(newPost);
    } catch (err) {
      showToast(err.message || 'Failed to create post', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-post-box-card">
      <form onSubmit={handleSubmit}>
        <div className="create-box-top">
          <img
            src={getUserAvatar(user, 72)}
            alt={user?.name || 'User'}
            className="create-box-avatar"
          />
          <div className="create-box-input-wrapper">
            <textarea
              className="create-box-textarea"
              placeholder={`What's on your mind, ${user?.name ? user.name.split(' ')[0] : 'friend'}?`}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {imagePreview && (
          <div className="create-box-preview-container">
            <img src={imagePreview} alt="Selected attachment" className="preview-img" />
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

        <div className="create-box-bottom">
          <label className="create-box-tool-btn" title="Add photo">
            <IconImage size={20} className="tool-icon-photo" />
            <span>Photo / Media</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </label>

          <button
            type="submit"
            className="btn-post-submit"
            disabled={isSubmitting || (!bodyText.trim() && !imageFile)}
          >
            {isSubmitting ? (
              <>
                <IconLoader size={16} className="spinner" />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <IconSend size={16} />
                <span>Publish</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
