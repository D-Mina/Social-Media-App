import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PostCard from '../Component/PostCard';
import {
  IconCamera,
  IconCheck,
  IconPlus,
  IconLoader,
  IconCalendar,
  IconUser,
  IconSparkles,
} from '../Component/Icons';
import { getUserAvatar } from '../utils/helpers';

export default function ProfilePage({ targetUserId, onSelectUser }) {
  const { user: currentUser, refreshProfile, updateUserLocal } = useAuth();
  const { showToast } = useToast();

  const currentId = currentUser?._id || currentUser?.id;
  const isOwnProfile = !targetUserId || String(targetUserId) === String(currentId);
  const activeUserId = isOwnProfile ? currentId : targetUserId;

  const [profileData, setProfileData] = useState(isOwnProfile ? currentUser : null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'media'

  // Fetch Profile Info
  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        setLoading(true);
        if (isOwnProfile) {
          const res = await api.auth.getProfileData();
          const p = res?.data?.user || res?.data || res?.user || currentUser;
          if (isMounted) setProfileData(p);
        } else if (targetUserId) {
          const res = await api.auth.getUserProfile(targetUserId);
          const p = res?.data?.user || res?.data || res?.user;
          if (isMounted) {
            setProfileData(p);
            setIsFollowing(Boolean(p?.isFollowing));
          }
        }
      } catch (err) {
        if (isMounted && isOwnProfile) setProfileData(currentUser);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [targetUserId, isOwnProfile, currentUser]);

  // Fetch User Posts
  useEffect(() => {
    let isMounted = true;
    async function loadUserPosts() {
      if (!activeUserId) return;
      try {
        setLoadingPosts(true);
        const res = await api.auth.getUserPosts(activeUserId);
        const list = res?.data?.posts || res?.data || res?.posts || [];
        if (isMounted) {
          setUserPosts(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        if (isMounted) setUserPosts([]);
      } finally {
        if (isMounted) setLoadingPosts(false);
      }
    }

    loadUserPosts();
    return () => {
      isMounted = false;
    };
  }, [activeUserId]);

  // Handle Photo Upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const res = await api.auth.uploadProfilePhoto(file);
      showToast('Profile photo updated successfully!', 'success');
      const updatedUser = res?.data?.user || res?.data || res?.user;
      if (updatedUser) {
        updateUserLocal(updatedUser);
        setProfileData(updatedUser);
      } else {
        refreshProfile();
      }
    } catch (err) {
      showToast(err.message || 'Failed to upload photo', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle Follow / Unfollow
  const handleToggleFollow = async () => {
    if (!targetUserId || followLoading) return;
    try {
      setFollowLoading(true);
      await api.auth.toggleFollow(targetUserId);
      setIsFollowing((prev) => !prev);
      showToast(
        !isFollowing ? 'Followed successfully!' : 'Unfollowed user',
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Follow action failed', 'error');
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostDeleted = (deletedId) => {
    setUserPosts((prev) => prev.filter((p) => (p._id || p.id) !== deletedId));
  };

  const handlePostUpdated = (updated) => {
    setUserPosts((prev) =>
      prev.map((p) => ((p._id || p.id) === (updated._id || updated.id) ? updated : p))
    );
  };

  const displayedPosts =
    activeTab === 'media' ? userPosts.filter((p) => Boolean(p.image)) : userPosts;

  const followersCount =
    profileData?.followers?.length ?? profileData?.followersCount ?? 0;
  const followingCount =
    profileData?.following?.length ?? profileData?.followingCount ?? 0;

  return (
    <div className="profile-page-root">
      {/* Profile Banner & Header Card */}
      <div className="profile-header-card">
        {/* Cover Art Gradient */}
        <div className="profile-cover-gradient">
          <div className="cover-badge">
            <IconSparkles size={16} />
            <span>Route Academy Developer</span>
          </div>
        </div>

        {/* Profile Details Bar */}
        <div className="profile-details-bar">
          <div className="profile-avatar-stack">
            <div className="profile-avatar-wrapper">
              <img
                src={getUserAvatar(profileData, 140)}
                alt={profileData?.name || 'User'}
                className="profile-avatar-large"
              />
              {isOwnProfile && (
                <label className="profile-photo-upload-badge" title="Update Profile Photo">
                  {uploadingPhoto ? (
                    <IconLoader size={16} className="spinner" />
                  ) : (
                    <IconCamera size={16} />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                    disabled={uploadingPhoto}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="profile-actions-wrapper">
            {!isOwnProfile && (
              <button
                className={`btn-profile-follow ${isFollowing ? 'following' : ''}`}
                onClick={handleToggleFollow}
                disabled={followLoading}
              >
                {followLoading ? (
                  <IconLoader size={16} className="spinner" />
                ) : isFollowing ? (
                  <>
                    <IconCheck size={16} />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <IconPlus size={16} />
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Identity & Bio */}
        <div className="profile-identity-section">
          <h2 className="profile-full-name">{profileData?.name || 'Route User'}</h2>
          <span className="profile-handle">@{profileData?.username || 'user'}</span>

          {profileData?.email && (
            <p className="profile-bio-text">{profileData.email}</p>
          )}

          <div className="profile-metadata-chips">
            {profileData?.gender && (
              <span className="meta-chip">
                <IconUser size={14} />
                <span>{profileData.gender}</span>
              </span>
            )}
            {profileData?.dateOfBirth && (
              <span className="meta-chip">
                <IconCalendar size={14} />
                <span>Born {profileData.dateOfBirth.slice(0, 10)}</span>
              </span>
            )}
          </div>

          {/* Followers / Following Stats */}
          <div className="profile-stats-row">
            <div className="profile-stat-box">
              <span className="stat-number">{userPosts.length}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="profile-stat-box">
              <span className="stat-number">{followersCount}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="profile-stat-box">
              <span className="stat-number">{followingCount}</span>
              <span className="stat-label">Following</span>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="profile-nav-tabs">
          <button
            className={`profile-tab-item ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts ({userPosts.length})
          </button>
          <button
            className={`profile-tab-item ${activeTab === 'media' ? 'active' : ''}`}
            onClick={() => setActiveTab('media')}
          >
            Media ({userPosts.filter((p) => Boolean(p.image)).length})
          </button>
        </div>
      </div>

      {/* Profile Posts Feed */}
      <div className="profile-posts-stream">
        {loadingPosts ? (
          <div className="feed-skeleton-list">
            {[1, 2].map((n) => (
              <div key={n} className="post-skeleton-card">
                <div className="skeleton-line w-40" />
                <div className="skeleton-line w-100" />
              </div>
            ))}
          </div>
        ) : displayedPosts.length === 0 ? (
          <div className="feed-empty-card">
            <div className="empty-icon-circle">
              <IconSparkles size={28} />
            </div>
            <h3 className="empty-title">
              {activeTab === 'media' ? 'No media uploads yet' : 'No posts published yet'}
            </h3>
            <p className="empty-desc">
              {isOwnProfile
                ? 'Create your first post from the home feed!'
                : 'This user has not published anything yet.'}
            </p>
          </div>
        ) : (
          displayedPosts.map((post) => (
            <PostCard
              key={post._id || post.id}
              post={post}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={handlePostUpdated}
              onSelectUser={onSelectUser}
            />
          ))
        )}
      </div>
    </div>
  );
}
