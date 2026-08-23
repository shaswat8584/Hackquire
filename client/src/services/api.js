import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skillbridge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or unauthorized
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
        localStorage.removeItem('skillbridge_token');
        localStorage.removeItem('skillbridge_user');
      }
    }
    return Promise.reject(error);
  }
);

// API Service Functions
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
};

export const matchingAPI = {
  getRecommendedStudents: (params) => api.get('/matching/students', { params }),
  getRecommendedOpportunities: (params) => api.get('/matching/opportunities', { params }),
  getCandidatesForRole: (data) => api.post('/matching/candidates', data),
};

export const opportunityAPI = {
  getAll: (params) => api.get('/opportunities', { params }),
  getById: (id) => api.get(`/opportunities/${id}`),
  create: (data) => api.post('/opportunities', data),
  apply: (id, data) => api.post(`/opportunities/${id}/apply`, data),
  getMyApplications: () => api.get('/opportunities/my/applications'),
};

export const teamAPI = {
  getAll: (params) => api.get('/teams', { params }),
  getById: (id) => api.get(`/teams/${id}`),
  create: (data) => api.post('/teams', data),
  invite: (teamId, data) => api.post(`/teams/${teamId}/invite`, data),
  updateMember: (teamId, data) => api.put(`/teams/${teamId}/members`, data),
  leave: (teamId) => api.post(`/teams/${teamId}/leave`),
};

export const connectionAPI = {
  getMyConnections: () => api.get('/connections'),
  getConnectionStatuses: () => api.get('/connections/statuses'),
  sendRequest: (recipientId) => api.post(`/connections/request/${recipientId}`),
  acceptRequest: (connectionId) => api.put(`/connections/${connectionId}/accept`),
  rejectRequest: (connectionId) => api.put(`/connections/${connectionId}/reject`),
  cancelRequest: (connectionId) => api.delete(`/connections/${connectionId}/cancel`),
  removeConnection: (connectionId) => api.delete(`/connections/${connectionId}`),
};

export const conversationAPI = {
  getConversations: () => api.get('/conversations'),
  getTotalUnread: () => api.get('/conversations/unread-total'),
  getOrCreateDirect: (recipientId) => api.post(`/conversations/direct/${recipientId}`),
  getOrCreateTeam: (teamId) => api.get(`/conversations/team/${teamId}`),
  getMessages: (conversationId) => api.get(`/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, data) => api.post(`/conversations/${conversationId}/messages`, data),
  markAsRead: (conversationId) => api.put(`/conversations/${conversationId}/read`),
};

export default api;

