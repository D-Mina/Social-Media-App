import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import PostCard from '../Component/PostCard';
import { IconBookmark, IconLoader } from '../Component/Icons';

export default function BookmarksPage({ onSelectUser }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadBookmarks() {
      try {
        setLoading(true);
        const res = await api.auth.getBookmarks();
        const list =
          res?.data?.bookmarks ||
          res?.data?.posts ||
          res?.data ||
          res?.bookmarks ||
          [];
        if (isMounted) {
          setBookmarks(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        if (isMounted) setBookmarks([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBookmarks();
    return () => {
      isMounted = false;
    };
  }, []);

  const handlePostDeleted = (id) => {
    setBookmarks((prev) => prev.filter((p) => (p._id || p.id) !== id));
  };

  const handlePostUpdated = (updated) => {
    setBookmarks((prev) =>
      prev.map((p) => ((p._id || p.id) === (updated._id || updated.id) ? updated : p))
    );
  };

  return (
    <div className="bookmarks-page-root">
      <div className="page-header-card">
        <div className="page-header-left">
          <div className="page-header-icon-box">
            <IconBookmark size={22} className="filled" />
          </div>
          <div>
            <h2 className="page-header-title">Saved Bookmarks</h2>
            <p className="page-header-sub">Posts you saved for reading or reference later</p>
          </div>
        </div>
      </div>

      <div className="bookmarks-feed-stream">
        {loading ? (
          <div className="feed-skeleton-list">
            {[1, 2].map((n) => (
              <div key={n} className="post-skeleton-card">
                <div className="skeleton-line w-40" />
                <div className="skeleton-line w-100" />
              </div>
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="feed-empty-card">
            <div className="empty-icon-circle">
              <IconBookmark size={30} />
            </div>
            <h3 className="empty-title">You have no saved posts yet</h3>
            <p className="empty-desc">
              When you find an inspiring discussion or valuable code tip on your feed, click the bookmark icon to save it here.
            </p>
          </div>
        ) : (
          bookmarks.map((item) => {
            // item could be the post directly or { post: {...} }
            const postObj = item?.post || item;
            return (
              <PostCard
                key={postObj._id || postObj.id}
                post={postObj}
                onPostDeleted={handlePostDeleted}
                onPostUpdated={handlePostUpdated}
                onSelectUser={onSelectUser}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
