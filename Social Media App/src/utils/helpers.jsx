import React from 'react';

export function formatRelativeTime(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 30) return 'Just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function getUserAvatar(user, size = 100) {
  if (user?.photo && typeof user.photo === 'string' && user.photo.startsWith('http')) {
    return user.photo;
  }
  const seed = encodeURIComponent(user?.username || user?.name || 'User');
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&size=${size}`;
}

export function formatMentionsAndTags(text, onMentionClick) {
  if (!text) return null;

  // Split by whitespace while preserving words
  const words = text.split(/(\s+)/);

  return words.map((part, index) => {
    if (part.startsWith('@') && part.length > 1) {
      const username = part.slice(1).replace(/[^a-zA-Z0-9_]/g, '');
      return (
        <span
          key={index}
          className="mention-tag"
          onClick={(e) => {
            e.stopPropagation();
            if (onMentionClick) onMentionClick(username);
          }}
        >
          {part}
        </span>
      );
    }
    if (part.startsWith('#') && part.length > 1) {
      return (
        <span key={index} className="hashtag-tag">
          {part}
        </span>
      );
    }
    return part;
  });
}
