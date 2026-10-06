import React, { useEffect } from 'react';
import { IconX } from './Icons';

export default function ImageLightboxModal({ imageUrl, onClose }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!imageUrl) return null;

  return (
    <div className="lightbox-backdrop animate-fade-in" onClick={onClose}>
      <button className="lightbox-close-btn" onClick={onClose} aria-label="Close image">
        <IconX size={24} />
      </button>
      <div className="lightbox-content animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="Enlarged view" className="lightbox-img" />
      </div>
    </div>
  );
}
