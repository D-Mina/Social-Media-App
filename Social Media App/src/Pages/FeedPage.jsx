import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/api';
import CreatePostBox from '../Component/CreatePostBox';
import PostCard from '../Component/PostCard';
import { IconRefresh, IconLoader, IconSparkles, IconImage, IconCompass } from '../Component/Icons';

export default function FeedPage({ onSelectUser, searchQuery, initialMode = 'all' }) {
  const [feedMode, setFeedMode] = useState(initialMode); // 'all', 'following', 'media'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Sync mode if initialMode changes from outside (e.g. from sidebar Explore click)
  useEffect(() => {
    if (initialMode) {
      setFeedMode(initialMode);
    }
  }, [initialMode]);

  const fetchPosts = useCallback(
    async (pageNumber = 1, isRefresh = false) => {
      try {
        if (pageNumber === 1) {
          if (isRefresh) setRefreshing(true);
          else setLoading(true);
        } else {
          setLoadingMore(true);
        }

        let res;
        if (feedMode === 'following') {
          res = await api.posts.getFeed({ only: 'following', limit: 10, page: pageNumber });
        } else if (feedMode === 'media') {
          res = await api.posts.getFeed({ hasImage: 'true', limit: 10, page: pageNumber });
        } else {
          // 'all' posts
          res = await api.posts.getAllPosts(pageNumber, 10);
        }

        // Post array parsing
        const list =
          res?.data?.posts ||
          res?.data?.feed ||
          res?.data ||
          res?.posts ||
          [];

        const validList = Array.isArray(list) ? list : [];

        if (pageNumber === 1) {
          setPosts(validList);
        } else {
          setPosts((prev) => [...prev, ...validList]);
        }

        // Check if more posts exist
        if (validList.length < 10) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } catch (err) {
        // if following feed is empty or errors, fallback to empty or keep prev
        if (pageNumber === 1) setPosts([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [feedMode]
  );

  useEffect(() => {
    setPage(1);
    fetchPosts(1);
  }, [fetchPosts]);

  const handlePostCreated = (newPost) => {
    if (newPost) {
      setPosts((prev) => [newPost, ...prev]);
    } else {
      fetchPosts(1);
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => (p._id || p.id) !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    if (!updatedPost) return;
    setPosts((prev) =>
      prev.map((p) =>
        (p._id || p.id) === (updatedPost._id || updatedPost.id) ? { ...p, ...updatedPost } : p
      )
    );
  };

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  // Filter posts if search query is typed in navbar
  const filteredPosts = posts.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const bodyMatch = p.body?.toLowerCase().includes(q);
    const authorName = (p.user?.name || '').toLowerCase().includes(q);
    const authorHandle = (p.user?.username || '').toLowerCase().includes(q);
    return bodyMatch || authorName || authorHandle;
  });

  return (
    <div className="feed-page-root">
      {/* Create Post Header Box */}
      <CreatePostBox onPostCreated={handlePostCreated} />

      {/* Feed Filter Tabs */}
      <div className="feed-tabs-bar">
        <div className="feed-tabs-buttons">
          <button
            className={`feed-tab-btn ${feedMode === 'all' ? 'active' : ''}`}
            onClick={() => setFeedMode('all')}
          >
            <IconSparkles size={16} />
            <span>All Posts</span>
          </button>
          <button
            className={`feed-tab-btn ${feedMode === 'following' ? 'active' : ''}`}
            onClick={() => setFeedMode('following')}
          >
            <IconCompass size={16} />
            <span>Following</span>
          </button>
          <button
            className={`feed-tab-btn ${feedMode === 'media' ? 'active' : ''}`}
            onClick={() => setFeedMode('media')}
          >
            <IconImage size={16} />
            <span>Media</span>
          </button>
        </div>

        <button
          className="btn-refresh-feed"
          onClick={() => fetchPosts(1, true)}
          disabled={refreshing || loading}
          title="Refresh feed"
        >
          <IconRefresh size={16} className={refreshing ? 'spinner' : ''} />
        </button>
      </div>

      {searchQuery && (
        <div className="search-active-banner">
          <span>Filtering posts matching: <strong>"{searchQuery}"</strong></span>
        </div>
      )}

      {/* Posts List */}
      <div className="feed-posts-stream">
        {loading ? (
          <div className="feed-skeleton-list">
            {[1, 2, 3].map((n) => (
              <div key={n} className="post-skeleton-card">
                <div className="skeleton-header">
                  <div className="skeleton-avatar" />
                  <div className="skeleton-lines">
                    <div className="skeleton-line w-40" />
                    <div className="skeleton-line w-20" />
                  </div>
                </div>
                <div className="skeleton-line w-100" />
                <div className="skeleton-line w-80" />
                <div className="skeleton-image-box" />
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="feed-empty-card">
            <div className="empty-icon-circle">
              <IconSparkles size={32} />
            </div>
            <h3 className="empty-title">
              {searchQuery
                ? 'No matching posts found'
                : feedMode === 'following'
                ? 'Your following feed is quiet'
                : 'No posts yet'}
            </h3>
            <p className="empty-desc">
              {searchQuery
                ? 'Try a different search keyword or mention.'
                : feedMode === 'following'
                ? 'Follow more students and instructors from the suggestions sidebar to populate your feed!'
                : 'Be the pioneer! Share a code snippet, question, or project update with the Route community.'}
            </p>
            {feedMode === 'following' && (
              <button
                className="btn-primary mt-3"
                onClick={() => setFeedMode('all')}
              >
                Explore All Posts
              </button>
            )}
          </div>
        ) : (
          <>
            {filteredPosts.map((post) => (
              <PostCard
                key={post._id || post.id}
                post={post}
                onPostDeleted={handlePostDeleted}
                onPostUpdated={handlePostUpdated}
                onSelectUser={onSelectUser}
              />
            ))}

            {/* Load More Button */}
            {hasMore && !searchQuery && (
              <div className="load-more-container">
                <button
                  className="btn-load-more"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <IconLoader size={18} className="spinner" />
                      <span>Loading more posts...</span>
                    </>
                  ) : (
                    <span>Load More</span>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
