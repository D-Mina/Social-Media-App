const BASE_URL = 'https://route-posts.routemisr.com';

export const storage = {
  getToken: () => localStorage.getItem('route_social_token'),
  setToken: (token) => localStorage.setItem('route_social_token', token),
  removeToken: () => localStorage.removeItem('route_social_token'),
  getUser: () => {
    try {
      const u = localStorage.getItem('route_social_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => localStorage.setItem('route_social_user', JSON.stringify(user)),
  removeUser: () => localStorage.removeItem('route_social_user'),
  clear: () => {
    localStorage.removeItem('route_social_token');
    localStorage.removeItem('route_social_user');
  }
};

async function request(endpoint, options = {}) {
  const token = storage.getToken();
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If not FormData, default to application/json if body present and no contentType set
  if (!(options.body instanceof FormData) && options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    let json = null;
    try {
      json = await res.json();
    } catch {
      json = null;
    }

    if (!res.ok) {
      const errorMsg =
        json?.message ||
        json?.error ||
        json?.errors ||
        (Array.isArray(json?.errors) ? json.errors.map(e => e.msg || e.message).join(', ') : null) ||
        `Request failed with status ${res.status}`;
      const err = new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      err.status = res.status;
      err.data = json;
      throw err;
    }

    return json;
  } catch (error) {
    throw error;
  }
}

export const api = {
  baseUrl: BASE_URL,

  // Health
  checkHealth: () => request('/'),

  // Auth
  auth: {
    signup: (data) =>
      request('/users/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    signin: (credentials) =>
      request('/users/signin', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),

    changePassword: ({ password, newPassword }) =>
      request('/users/change-password', {
        method: 'PATCH',
        body: JSON.stringify({ password, newPassword }),
      }),

    uploadProfilePhoto: (file) => {
      const formData = new FormData();
      formData.append('photo', file);
      return request('/users/upload-photo', {
        method: 'PUT',
        body: formData,
      });
    },

    getProfileData: () => request('/users/profile-data'),

    getBookmarks: () => request('/users/bookmarks'),

    getSuggestions: (limit = 10) => request(`/users/suggestions?limit=${limit}`),

    getUserProfile: (userId) => request(`/users/${userId}/profile`),

    toggleFollow: (userId) =>
      request(`/users/${userId}/follow`, {
        method: 'PUT',
      }),

    getUserPosts: (userId) => request(`/users/${userId}/posts`),
  },

  // Posts
  posts: {
    getAllPosts: (page = 1, limit = 20) => request(`/posts?page=${page}&limit=${limit}`),

    getFeed: ({ only, hasImage, page = 1, limit = 15 } = {}) => {
      const params = new URLSearchParams();
      if (only) params.append('only', only);
      if (hasImage !== undefined && hasImage !== '') params.append('hasImage', hasImage);
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      const query = params.toString();
      return request(`/posts/feed${query ? `?${query}` : ''}`);
    },

    createPost: ({ body, image }) => {
      const formData = new FormData();
      if (body) formData.append('body', body);
      if (image) formData.append('image', image);
      return request('/posts', {
        method: 'POST',
        body: formData,
      });
    },

    getPost: (postId) => request(`/posts/${postId}`),

    getPostLikes: (postId, page = 1, limit = 20) =>
      request(`/posts/${postId}/likes?page=${page}&limit=${limit}`),

    updatePost: (postId, { body, image }) => {
      const formData = new FormData();
      if (body) formData.append('body', body);
      if (image) formData.append('image', image);
      return request(`/posts/${postId}`, {
        method: 'PUT',
        body: formData,
      });
    },

    deletePost: (postId) =>
      request(`/posts/${postId}`, {
        method: 'DELETE',
      }),

    toggleLike: (postId) =>
      request(`/posts/${postId}/like`, {
        method: 'PUT',
      }),

    toggleBookmark: (postId) =>
      request(`/posts/${postId}/bookmark`, {
        method: 'PUT',
      }),

    sharePost: (postId, { body }) =>
      request(`/posts/${postId}/share`, {
        method: 'POST',
        body: JSON.stringify({ body: body || '' }),
      }),
  },

  // Comments
  comments: {
    getComments: (postId, page = 1, limit = 20) =>
      request(`/posts/${postId}/comments?page=${page}&limit=${limit}`),

    createComment: (postId, { content, image }) => {
      const formData = new FormData();
      if (content) formData.append('content', content);
      if (image) formData.append('image', image);
      return request(`/posts/${postId}/comments`, {
        method: 'POST',
        body: formData,
      });
    },

    updateComment: (postId, commentId, { content, image }) => {
      const formData = new FormData();
      if (content) formData.append('content', content);
      if (image) formData.append('image', image);
      return request(`/posts/${postId}/comments/${commentId}`, {
        method: 'PUT',
        body: formData,
      });
    },

    deleteComment: (postId, commentId) =>
      request(`/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
      }),

    toggleLikeComment: (postId, commentId) =>
      request(`/posts/${postId}/comments/${commentId}/like`, {
        method: 'PUT',
      }),

    getReplies: (postId, commentId, page = 1, limit = 10) =>
      request(`/posts/${postId}/comments/${commentId}/replies?page=${page}&limit=${limit}`),

    createReply: (postId, commentId, { content, image }) => {
      const formData = new FormData();
      if (content) formData.append('content', content);
      if (image) formData.append('image', image);
      return request(`/posts/${postId}/comments/${commentId}/replies`, {
        method: 'POST',
        body: formData,
      });
    },
  },

  // Notifications
  notifications: {
    getNotifications: ({ unread = false, page = 1, limit = 20 } = {}) =>
      request(`/notifications?unread=${unread}&page=${page}&limit=${limit}`),

    getUnreadCount: () => request('/notifications/unread-count'),

    markAsRead: (notificationId) =>
      request(`/notifications/${notificationId}/read`, {
        method: 'PATCH',
      }),

    markAllAsRead: () =>
      request('/notifications/read-all', {
        method: 'PATCH',
      }),
  },
};
