import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  IconSparkles,
  IconLock,
  IconUser,
  IconEye,
  IconEyeOff,
  IconCheck,
  IconLoader,
} from '../Component/Icons';

export default function AuthPage() {
  const { signin, signup } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Signin form state
  const [signinForm, setSigninForm] = useState({
    loginIdentifier: '',
    password: '',
  });

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    name: '',
    username: '',
    email: '',
    dateOfBirth: '2000-01-01',
    gender: 'male',
    password: '',
    rePassword: '',
  });

  const handleSigninSubmit = async (e) => {
    e.preventDefault();
    if (!signinForm.loginIdentifier || !signinForm.password) {
      showToast('Please enter both identifier and password', 'error');
      return;
    }

    try {
      setLoading(true);
      await signin({
        loginIdentifier: signinForm.loginIdentifier,
        password: signinForm.password,
      });
      showToast('Welcome back to Route Posts!', 'success');
    } catch (err) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    if (signupForm.password !== signupForm.rePassword) {
      showToast('Passwords do not match!', 'error');
      return;
    }

    if (signupForm.password.length < 6) {
      showToast('Password should be at least 6 characters', 'error');
      return;
    }

    try {
      setLoading(true);
      await signup(signupForm);
      showToast('Account created successfully! Welcome to Route Social.', 'success');
    } catch (err) {
      showToast(err.message || 'Signup failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-root">
      <div className="auth-layout-container">
        {/* Left Side: Brand & Hero Showcase */}
        <div className="auth-hero-panel">
          <div className="auth-hero-brand">
            <div className="brand-logo-icon lg">
              <IconSparkles size={32} />
            </div>
            <div>
              <h1 className="hero-brand-name">Route Social</h1>
              <span className="hero-brand-sub">Route Academy Community Hub</span>
            </div>
          </div>

          <div className="auth-hero-pitch">
            <h2 className="hero-pitch-title">
              Connect with fellow developers, mentors, and alumni.
            </h2>
            <p className="hero-pitch-text">
              Share updates, explore code solutions, collaborate on tech tracks, and build your professional developer network.
            </p>
          </div>

          <div className="hero-features-list">
            <div className="hero-feature-item">
              <span className="feature-check"><IconCheck size={16} /></span>
              <span>Engage with real-time feeds, discussions & replies</span>
            </div>
            <div className="hero-feature-item">
              <span className="feature-check"><IconCheck size={16} /></span>
              <span>Share project snippets, screenshots & tech milestones</span>
            </div>
            <div className="hero-feature-item">
              <span className="feature-check"><IconCheck size={16} /></span>
              <span>Follow fellow engineers & receive instant notifications</span>
            </div>
          </div>

          <div className="hero-footer-note">
            <span>Powered by Route Posts API &bull; Route Academy Egypt</span>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="auth-form-panel">
          <div className="auth-card-wrapper animate-fade-in">
            {/* Mode Switch Tabs */}
            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab-btn ${mode === 'signin' ? 'active' : ''}`}
                onClick={() => setMode('signin')}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => setMode('signup')}
              >
                Create Account
              </button>
            </div>

            {mode === 'signin' ? (
              /* Sign In Form */
              <form onSubmit={handleSigninSubmit} className="auth-form">
                <div className="auth-form-header">
                  <h3 className="auth-form-title">Welcome Back</h3>
                  <p className="auth-form-desc">Log into your Route account to view the feed</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Email or Username</label>
                  <div className="form-input-wrapper">
                    <IconUser size={18} className="input-icon" />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. ahmedbahnasy@gmail.com"
                      value={signinForm.loginIdentifier}
                      onChange={(e) =>
                        setSigninForm({ ...signinForm, loginIdentifier: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="form-input-wrapper">
                    <IconLock size={18} className="input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="••••••••"
                      value={signinForm.password}
                      onChange={(e) =>
                        setSigninForm({ ...signinForm, password: e.target.value })
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

                <button
                  type="submit"
                  className="btn-auth-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <IconLoader size={18} className="spinner" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </form>
            ) : (
              /* Sign Up Form */
              <form onSubmit={handleSignupSubmit} className="auth-form">
                <div className="auth-form-header">
                  <h3 className="auth-form-title">Join Route Community</h3>
                  <p className="auth-form-desc">Create your developer profile in seconds</p>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ahmed Bahnasy"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Bahnasy2026"
                      value={signupForm.username}
                      onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="user@example.com"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-input"
                      value={signupForm.dateOfBirth}
                      onChange={(e) =>
                        setSignupForm({ ...signupForm, dateOfBirth: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                      className="form-input form-select"
                      value={signupForm.gender}
                      onChange={(e) => setSignupForm({ ...signupForm, gender: e.target.value })}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Aa@123456"
                      value={signupForm.password}
                      onChange={(e) =>
                        setSignupForm({ ...signupForm, password: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Aa@123456"
                      value={signupForm.rePassword}
                      onChange={(e) =>
                        setSignupForm({ ...signupForm, rePassword: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-auth-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <IconLoader size={18} className="spinner" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Create Free Account</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
