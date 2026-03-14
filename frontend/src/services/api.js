import axios from 'axios';

// ─── Axios instance ───────────────────────────────────────────────────────────
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Request interceptor — attach JWT to every request ───────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor — handle 401 globally ──────────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid → force logout
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth endpoints ───────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login:    (data) => API.post('/auth/login',    data),
};

// ─── Complaint endpoints (USER) ───────────────────────────────────────────────
export const complaintAPI = {
  raise:          (data) => API.post('/complaints',           data),
  getMyComplaints: ()    => API.get('/complaints/my'),
  getHistory:     (id)   => API.get(`/complaints/${id}/history`),
};

// ─── Admin endpoints ──────────────────────────────────────────────────────────
export const adminAPI = {
  // Complaints
  getAllComplaints: ()           => API.get('/admin/complaints'),
  assign:          (id, data)   => API.post(`/admin/complaints/${id}/assign`, data),
  updateStatus:    (id, data)   => API.put(`/admin/complaints/${id}/status`,  data),

  // Teams
  getTeams:    ()       => API.get('/admin/teams'),
  createTeam:  (data)   => API.post('/admin/teams',    data),
  updateTeam:  (id, d)  => API.put(`/admin/teams/${id}`, d),
  deleteTeam:  (id)     => API.delete(`/admin/teams/${id}`),
};

// ─── Notification endpoints ───────────────────────────────────────────────────
export const notificationAPI = {
  getAll:      ()   => API.get('/notifications'),
  getUnread:   ()   => API.get('/notifications/unread-count'),
  markRead:    (id) => API.put(`/notifications/${id}/read`),
  markAllRead: ()   => API.put('/notifications/read-all'),
};

export default API;
