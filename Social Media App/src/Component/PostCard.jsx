import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  IconHeart,
  IconMessage,
  IconShare,
  IconBookmark,
  IconMore,
  IconEdit,
  IconTrash,
  IconImage,
  IconSend,
  IconLoader,
  IconX,
} from './Icons';
import { formatRelativeTime, getUserAvatar, formatMentionsAndTags } from '../utils/helpers';
import PostLikesModal from './PostLikesModal';
import SharePostModal from './SharePostModal';
import EditPostModal from './EditPostModal';
import ImageLightboxModal from './ImageLightboxModal';

export default function PostCard({
  post,
  onPostDeleted,
  onSelectUser,
  onPostUpdated,
}) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const currentUserId = user?._id || user?.id;
  const author = post?.user || post?.creator || {};
  const authorId = author?._id || author?.id;
  const isAuthor = currentUserId && authorId && String(currentUserId) === String(authorId);

  // States
  const [likesCount, setLikesCount] = useState(
    Array.isArray(post?.likes) ? post.likes.length : Number(post?.likesCount || 0)
  );
  const [isLiked, setIsLiked] = useState(() => {
    if (Array.isArray(post?.likes) && currentUserId) {
      return post.likes.some((l) => (l?._id || l?.id || l) === currentUserId);
    }
    return Boolean(post?.isLiked);
  });
  const [isBookmarked, setIsBookmarked] = useState(Boolean(post?.isBookmarked || post?.bookmarked));

  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(
    Array.isArray(post?.comments) ? post.comments.length : Number(post?.commentsCount || 0)
  );
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [commentImage, setCommentImage] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Comment Replies state: { [commentId]: { open: bool, replies: [], loading: bool, input: '' } }
  const [repliesState, setRepliesState] = useState({});

  // Sync likes and bookmark if post prop updates
  useEffect(() => {
    if (Array.isArray(post?.likes)) {
      setLikesCount(post.likes.length);
      if (currentUserId) {
        setIsLiked(post.likes.some((l) => (l?._id || l?.id || l) === currentUserId));
      }
    } else if (post?.likesCount !== undefined) {
      setLikesCount(Number(post.likesCount) || 0);
    }
    if (post?.isBookmarked !== undefined) {
      setIsBookmarked(Boolean(post.isBookmarked));
    }
  }, [post, currentUserId]);

  // Handle Like
  const handleToggleLike = async () => {
    const prevLiked = isLiked;
    const prevCount = likesCount;

    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      await api.posts.toggleLike(post._id || post.id);
    } catch (err) {
      // rollback
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      showToast(err.message || 'Failed to like post', 'error');
    }
  };

  // Handle Bookmark
  const handleToggleBookmark = async () => {
    const prev = isBookmarked;
    setIsBookmarked(!prev);

    try {
      await api.posts.toggleBookmark(post._id || post.id);
      showToast(!prev ? 'Saved to bookmarks' : 'Removed from bookmarks', 'info');
    } catch (err) {
      setIsBookmarked(prev);
      showToast(err.message || 'Bookmark action failed', 'error');
    }
  };

  // Handle Delete Post
  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.posts.deletePost(post._id || post.id);
      showToast('Post deleted', 'success');
      if (onPostDeleted) onPostDeleted(post._id || post.id);
    } catch (err) {
      showToast(err.message || 'Failed to delete post', 'error');
    }
  };

  // Fetch comments
  const handleToggleCommentsSection = async () => {
    const nextState = !showComments;
    setShowComments(nextState);

    if (nextState && comments.length === 0) {
      setLoadingComments(true);
      try {
        const res = await api.comments.getComments(post._id || post.id);
        const list = res?.data?.comments || res?.data || res?.comments || [];
        setComments(Array.isArray(list) ? list : []);
      } catch (err) {
        showToast('Could not load comments', 'error');
      } finally {
        setLoadingComments(false);
      }
    }
  };

  // Create Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim() && !commentImage) return;

    try {
      setSubmittingComment(true);
      const res = await api.comments.createComment(post._id || post.id, {
        content: commentInput,
        image: commentImage,
      });
      const newComment = res?.data?.comment || res?.data || res?.comment;

      // Add to list optimistically or from response
      const commentObj = newComment || {
        _id: Date.now().toString(),
        content: commentInput,
        commentCreator: user,
        user: user,
        createdAt: new Date().toISOString(),
      };

      setComments((prev) => [commentObj, ...prev]);
      setCommentsCount((prev) => prev + 1);
      setCommentInput('');
      setCommentImage(null);
      showToast('Comment posted', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to add comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      await api.comments.deleteComment(post._id || post.id, commentId);
      setComments((prev) => prev.filter((c) => (c._id || c.id) !== commentId));
      setCommentsCount((prev) => Math.max(0, prev - 1));
      showToast('Comment deleted', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to delete comment', 'error');
    }
  };

  // Like comment
  const handleLikeComment = async (commentId) => {
    try {
      await api.comments.toggleLikeComment(post._id || post.id, commentId);
      setComments((prev) =>
        prev.map((c) => {
          if ((c._id || c.id) === commentId) {
            const isLikedComment = !c.isLiked;
            return {
              ...c,
              isLiked: isLikedComment,
              likesCount: (c.likesCount || 0) + (isLikedComment ? 1 : -1),
            };
          }
          return c;
        })
      );
    } catch {
      // silent
    }
  };

  // Toggle comment replies
  const handleToggleReplies = async (commentId) => {
    const current = repliesState[commentId] || { open: false, replies: [], loading: false, input: '' };
    const nextOpen = !current.open;

    setRepliesState((prev) => ({
      ...prev,
      [commentId]: { ...current, open: nextOpen },
    }));

    if (nextOpen && (!current.replies || current.replies.length === 0)) {
      setRepliesState((prev) => ({
        ...prev,
        [commentId]: { ...current, open: true, loading: true },
      }));

      try {
        const res = await api.comments.getReplies(post._id || post.id, commentId);
        const replyList = res?.data?.replies || res?.data || res?.replies || [];
        setRepliesState((prev) => ({
          ...prev,
          [commentId]: {
            ...prev[commentId],
            loading: false,
            replies: Array.isArray(replyList) ? replyList : [],
          },
        }));
      } catch {
        setRepliesState((prev) => ({
          ...prev,
          [commentId]: { ...prev[commentId], loading: false },
        }));
      }
    }
  };

  // Submit Reply
  const handleSubmitReply = async (commentId, e) => {
    e.preventDefault();
    const commentState = repliesState[commentId] || {};
    const text = (commentState.input || '').trim();
    if (!text) return;

    try {
      const res = await api.comments.createReply(post._id || post.id, commentId, {
        content: text,
      });
      const newReply = res?.data?.reply || res?.data || res?.reply || {
        _id: Date.now().toString(),
        content: text,
        user: user,
        createdAt: new Date().toISOString(),
      };

      setRepliesState((prev) => ({
        ...prev,
        [commentId]: {
          ...prev[commentId],
          input: '',
          replies: [...(prev[commentId]?.replies || []), newReply],
        },
      }));
      showToast('Reply added', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to add reply', 'error');
    }
  };

  return (
    <article className="post-card-root">
      {/* Header */}
      <div className="post-card-header">
        <div
          className="post-author-wrapper"
          onClick={() => authorId && onSelectUser && onSelectUser(authorId)}
          role="button"
          tabIndex={0}
        >
          <img
            src={getUserAvatar(author, 96)}
            alt={author?.name || 'Author'}
            className="post-author-avatar"
          />
          <div className="post-author-meta">
            <div className="post-author-name-row">
              <span className="post-author-name">{author?.name || 'Route User'}</span>
              <span className="post-author-handle">@{author?.username || 'user'}</span>
            </div>
            <span className="post-timestamp">
              {formatRelativeTime(post?.createdAt || post?.date)}
            </span>
          </div>
        </div>

        {/* Action dropdown */}
        <div className="post-more-wrapper">
          <button
            className="post-btn-more"
            onClick={() => setShowMenu((prev) => !prev)}
            aria-label="More options"
          >
            <IconMore size={18} />
          </button>

          {showMenu && (
            <div className="post-menu-dropdown animate-fade-in">
              {isAuthor && (
                <>
                  <button
                    className="post-menu-item"
                    onClick={() => {
                      setShowMenu(false);
                      setShowEditModal(true);
                    }}
                  >
                    <IconEdit size={16} />
                    <span>Edit Post</span>
                  </button>
                  <button
                    className="post-menu-item item-danger"
                    onClick={() => {
                      setShowMenu(false);
                      handleDeletePost();
                    }}
                  >
                    <IconTrash size={16} />
                    <span>Delete Post</span>
                  </button>
                  <div className="dropdown-divider" />
                </>
              )}
              <button
                className="post-menu-item"
                onClick={() => {
                  setShowMenu(false);
                  handleToggleBookmark();
                }}
              >
                <IconBookmark size={16} filled={isBookmarked} />
                <span>{isBookmarked ? 'Remove Bookmark' : 'Bookmark Post'}</span>
              </button>
              <button
                className="post-menu-item"
                onClick={() => {
                  setShowMenu(false);
                  setShowLikesModal(true);
                }}
              >
                <IconHeart size={16} />
                <span>View Likes</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="post-body-content">
        <p className="post-text-content">
          {formatMentionsAndTags(post?.body, (username) => {
            // Mention click
            showToast(`Searching posts mentioning @${username}`, 'info');
          })}
        </p>

        {/* Attached Image */}
        {post?.image && (
          <div
            className="post-image-container"
            onClick={() => setLightboxImage(post.image)}
            title="Click to expand"
          >
            <img src={post.image} alt="Post visual" className="post-image-media" />
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="post-action-bar">
        {/* Like Button */}
        <div className="action-group">
          <button
            className={`action-btn action-btn-like ${isLiked ? 'liked' : ''}`}
            onClick={handleToggleLike}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <IconHeart size={20} filled={isLiked} />
          </button>
          <span
            className="action-count action-count-clickable"
            onClick={() => setShowLikesModal(true)}
            title="View who liked this"
          >
            {likesCount}
          </span>
        </div>

        {/* Comment Button */}
        <div className="action-group">
          <button
            className={`action-btn action-btn-comment ${showComments ? 'active' : ''}`}
            onClick={handleToggleCommentsSection}
            title="Comments"
          >
            <IconMessage size={20} />
          </button>
          <span className="action-count">{commentsCount}</span>
        </div>

        {/* Share Button */}
        <div className="action-group">
          <button
            className="action-btn action-btn-share"
            onClick={() => setShowShareModal(true)}
            title="Share post"
          >
            <IconShare size={20} />
          </button>
        </div>

        {/* Bookmark Button */}
        <div className="action-group bookmark-group">
          <button
            className={`action-btn action-btn-bookmark ${isBookmarked ? 'bookmarked' : ''}`}
            onClick={handleToggleBookmark}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <IconBookmark size={20} filled={isBookmarked} />
          </button>
        </div>
      </div>

      {/* Expandable Comments Section */}
      {showComments && (
        <section className="comments-section animate-fade-in">
          {/* Add comment form */}
          <form onSubmit={handleAddComment} className="comment-create-form">
            <img
              src={getUserAvatar(user, 50)}
              alt={user?.name || 'User'}
              className="comment-user-avatar"
            />
            <div className="comment-input-area">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="comment-text-input"
              />
              <div className="comment-tools-row">
                <label className="btn-comment-tool" title="Attach picture">
                  <IconImage size={17} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCommentImage(e.target.files?.[0] || null)}
                    style={{ display: 'none' }}
                  />
                </label>
                {commentImage && (
                  <span className="comment-attached-badge">
                    Photo attached
                    <button
                      type="button"
                      onClick={() => setCommentImage(null)}
                      className="btn-remove-attach"
                    >
                      &times;
                    </button>
                  </span>
                )}
                <button
                  type="submit"
                  className="btn-comment-submit"
                  disabled={submittingComment || (!commentInput.trim() && !commentImage)}
                >
                  {submittingComment ? <IconLoader size={14} /> : <IconSend size={14} />}
                </button>
              </div>
            </div>
          </form>

          {/* Comments list */}
          <div className="comments-list">
            {loadingComments ? (
              <div className="comments-loading">
                <IconLoader size={18} className="spinner" />
                <span>Loading discussion...</span>
              </div>
            ) : comments.length === 0 ? (
              <div className="comments-empty">
                <span>No comments yet. Start the conversation!</span>
              </div>
            ) : (
              comments.map((comment) => {
                const commentId = comment._id || comment.id;
                const cAuthor = comment.commentCreator || comment.user || {};
                const cAuthorId = cAuthor._id || cAuthor.id;
                const isCommentAuthor =
                  currentUserId && cAuthorId && String(currentUserId) === String(cAuthorId);
                const replyState = repliesState[commentId] || {};

                return (
                  <div key={commentId} className="comment-thread-item">
                    <div className="comment-item-header">
                      <img
                        src={getUserAvatar(cAuthor, 56)}
                        alt={cAuthor?.name || 'User'}
                        className="comment-avatar"
                        onClick={() => cAuthorId && onSelectUser && onSelectUser(cAuthorId)}
                      />
                      <div className="comment-content-box">
                        <div className="comment-author-bar">
                          <span
                            className="comment-author-name"
                            onClick={() => cAuthorId && onSelectUser && onSelectUser(cAuthorId)}
                          >
                            {cAuthor?.name || 'Route User'}
                          </span>
                          <span className="comment-timestamp">
                            {formatRelativeTime(comment.createdAt)}
                          </span>
                          {isCommentAuthor && (
                            <button
                              className="btn-delete-comment"
                              onClick={() => handleDeleteComment(commentId)}
                              title="Delete comment"
                            >
                              <IconTrash size={12} />
                            </button>
                          )}
                        </div>
                        <p className="comment-text">{comment.content}</p>
                        {comment.image && (
                          <img
                            src={comment.image}
                            alt="Comment media"
                            className="comment-inline-image"
                            onClick={() => setLightboxImage(comment.image)}
                          />
                        )}
                        <div className="comment-subactions">
                          <button
                            className={`btn-comment-subaction ${comment.isLiked ? 'liked' : ''}`}
                            onClick={() => handleLikeComment(commentId)}
                          >
                            <IconHeart size={13} filled={comment.isLiked} />
                            <span>{comment.likesCount || 0}</span>
                          </button>
                          <button
                            className="btn-comment-subaction"
                            onClick={() => handleToggleReplies(commentId)}
                          >
                            <span>Reply</span>
                            {replyState.replies?.length > 0 && (
                              <span>({replyState.replies.length})</span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Replies Section */}
                    {replyState.open && (
                      <div className="comment-replies-thread animate-fade-in">
                        {replyState.replies && replyState.replies.length > 0 && (
                          <div className="replies-list">
                            {replyState.replies.map((reply) => {
                              const rAuthor = reply.user || reply.creator || {};
                              return (
                                <div key={reply._id || reply.id} className="reply-item">
                                  <img
                                    src={getUserAvatar(rAuthor, 40)}
                                    alt={rAuthor?.name || 'Reply author'}
                                    className="reply-avatar"
                                  />
                                  <div className="reply-body">
                                    <div className="reply-author-bar">
                                      <span className="reply-author-name">
                                        {rAuthor?.name || 'Route Peer'}
                                      </span>
                                      <span className="reply-timestamp">
                                        {formatRelativeTime(reply.createdAt)}
                                      </span>
                                    </div>
                                    <p className="reply-text">{reply.content}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Add reply input */}
                        <form
                          onSubmit={(e) => handleSubmitReply(commentId, e)}
                          className="reply-create-form"
                        >
                          <input
                            type="text"
                            placeholder="Write a reply..."
                            value={replyState.input || ''}
                            onChange={(e) =>
                              setRepliesState((prev) => ({
                                ...prev,
                                [commentId]: {
                                  ...prev[commentId],
                                  input: e.target.value,
                                },
                              }))
                            }
                            className="reply-text-input"
                          />
                          <button type="submit" className="btn-reply-send">
                            <IconSend size={13} />
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* Modals */}
      {showLikesModal && (
        <PostLikesModal
          postId={post._id || post.id}
          onClose={() => setShowLikesModal(false)}
          onSelectUser={onSelectUser}
        />
      )}

      {showShareModal && (
        <SharePostModal
          post={post}
          onClose={() => setShowShareModal(false)}
          onShareSuccess={() => {
            if (onPostUpdated) onPostUpdated(post);
          }}
        />
      )}

      {showEditModal && (
        <EditPostModal
          post={post}
          onClose={() => setShowEditModal(false)}
          onPostUpdated={(updated) => {
            if (onPostUpdated) onPostUpdated(updated);
          }}
        />
      )}

      {lightboxImage && (
        <ImageLightboxModal
          imageUrl={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </article>
  );
}
