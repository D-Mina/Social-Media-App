import React, { useState } from 'react';
import { api, storage } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  IconSettings,
  IconLock,
  IconUser,
  IconEye,
  IconEyeOff,
  IconCheck,
  IconLoader,
  IconCamera,
} from '../Component/Icons';
import { getUserAvatar } from '../utils/helpers';

export default function SettingsPage() {
  const { user, refreshProfile, updateUserLocal } = useAuth();
  const { showToast } = useToast();

  const [passwordForm, setPasswordForm] = useState({
    password: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match!', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }

    try {
      setSubmittingPassword(true);
      const res = await api.auth.changePassword({
        password: passwordForm.password,
        newPassword: passwordForm.newPassword,
      });

      // Update token if new token was returned
      const newToken = res?.token || res?.data?.token;
      if (newToken) {
        storage.setToken(newToken);
      }

      showToast('Password changed successfully!', 'success');
      setPasswordForm({ password: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err.message || 'Failed to change password. Check old password.', 'error');
    } finally {
      setSubmittingPassword(false);
    }
  };

  // Upload Photo
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const res = await api.auth.uploadProfilePhoto(file);
      showToast('Profile photo updated!', 'success');
      const updatedUser = res?.data?.user || res?.data || res?.user;
      if (updatedUser) {
        updateUserLocal(updatedUser);
      } else {
        refreshProfile();
      }
    } catch (err) {
      showToast(err.message || 'Failed to upload photo', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="settings-page-root">
      {/* Header bar */}
      <div className="page-header-card">
        <div className="page-header-left">
          <div className="page-header-icon-box">
            <IconSettings size={22} />
          </div>
          <div>
            <h2 className="page-header-title">Account Settings</h2>
            <p className="page-header-sub">Manage your security and profile preferences</p>
          </div>
        </div>
      </div>

      <div className="settings-content-grid">
        {/* Profile Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3 className="settings-card-title">Profile Picture</h3>
            <p className="settings-card-desc">Personalize your avatar across the Route community</p>
          </div>

          <div className="settings-avatar-row">
            <div className="settings-avatar-preview-box">
              <img
                src={getUserAvatar(user, 120)}
                alt={user?.name || 'User'}
                className="settings-avatar-img"
              />
            </div>
            <div className="settings-avatar-upload-info">
              <label className="btn-primary btn-upload-label">
                {uploadingPhoto ? (
                  <>
                    <IconLoader size={16} className="spinner" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <IconCamera size={16} />
                    <span>Upload New Photo</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                  disabled={uploadingPhoto}
                />
              </label>
              <p className="upload-help-text">JPG, PNG or GIF. Max 5MB file size.</p>
            </div>
          </div>
        </div>

        {/* Account Info Details */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3 className="settings-card-title">Account Information</h3>
            <p className="settings-card-desc">Your verified account credentials</p>
          </div>

          <div className="account-details-list">
            <div className="account-detail-item">
              <span className="detail-label">Full Name</span>
              <span className="detail-value">{user?.name || 'Route User'}</span>
            </div>
            <div className="account-detail-item">
              <span className="detail-label">Username</span>
              <span className="detail-value">@{user?.username || 'user'}</span>
            </div>
            <div className="account-detail-item">
              <span className="detail-label">Email Address</span>
              <span className="detail-value">{user?.email || 'N/A'}</span>
            </div>
            <div className="account-detail-item">
              <span className="detail-label">Gender</span>
              <span className="detail-value capitalize">{user?.gender || 'N/A'}</span>
            </div>
            {user?.dateOfBirth && (
              <div className="account-detail-item">
                <span className="detail-label">Date of Birth</span>
                <span className="detail-value">{user.dateOfBirth.slice(0, 10)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Change Password Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3 className="settings-card-title">Security & Password</h3>
            <p className="settings-card-desc">Change your password to keep your account safe</p>
          </div>

          <form onSubmit={handleChangePassword} className="settings-form">
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <div className="form-input-wrapper">
                <IconLock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter current password"
                  value={passwordForm.password}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="form-input-wrapper">
                  <IconLock size={18} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="New password (min. 6 chars)"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div className="form-input-wrapper">
                  <IconLock size={18} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Re-type new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary mt-2"
              disabled={submittingPassword}
            >
              {submittingPassword ? (
                <>
                  <IconLoader size={16} className="spinner" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
