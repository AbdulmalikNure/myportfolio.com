import axios from 'axios';

const BASE = '/api';

export const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && err.response?.data?.code === 'TOKEN_EXPIRED' && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(`${BASE}/auth/refresh`, {}, { withCredentials: true });
        const newToken = data.data.accessToken;
        localStorage.setItem('access_token', newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// Helpers
export const auth = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  changePassword: (data: object) => api.put('/auth/change-password', data),
};

export const dashboard = {
  get: () => api.get('/admin/dashboard'),
};

export const settings = {
  get: () => api.get('/admin/settings'),
  update: (data: FormData | object) => api.put('/admin/settings', data),
};

export const skills = {
  getAll: () => api.get('/admin/skills'),
  create: (data: object) => api.post('/admin/skills', data),
  update: (id: string, data: object) => api.put(`/admin/skills/${id}`, data),
  delete: (id: string) => api.delete(`/admin/skills/${id}`),
};

export const services = {
  getAll: () => api.get('/admin/services'),
  create: (data: object) => api.post('/admin/services', data),
  update: (id: string, data: object) => api.put(`/admin/services/${id}`, data),
  delete: (id: string) => api.delete(`/admin/services/${id}`),
};

export const projects = {
  getAll: (params?: object) => api.get('/admin/projects', { params }),
  create: (data: FormData) => api.post('/admin/projects', data),
  update: (id: string, data: FormData | object) => api.put(`/admin/projects/${id}`, data),
  delete: (id: string) => api.delete(`/admin/projects/${id}`),
};

export const education = {
  getAll: () => api.get('/admin/education'),
  create: (data: object) => api.post('/admin/education', data),
  update: (id: string, data: object) => api.put(`/admin/education/${id}`, data),
  delete: (id: string) => api.delete(`/admin/education/${id}`),
};

export const experience = {
  getAll: () => api.get('/admin/experience'),
  create: (data: object) => api.post('/admin/experience', data),
  update: (id: string, data: object) => api.put(`/admin/experience/${id}`, data),
  delete: (id: string) => api.delete(`/admin/experience/${id}`),
};

export const certificates = {
  getAll: () => api.get('/admin/certificates'),
  create: (data: FormData) => api.post('/admin/certificates', data),
  update: (id: string, data: FormData | object) => api.put(`/admin/certificates/${id}`, data),
  delete: (id: string) => api.delete(`/admin/certificates/${id}`),
};

export const gallery = {
  getAll: () => api.get('/admin/gallery'),
  create: (data: FormData) => api.post('/admin/gallery', data),
  update: (id: string, data: object) => api.put(`/admin/gallery/${id}`, data),
  delete: (id: string) => api.delete(`/admin/gallery/${id}`),
};

export const blog = {
  getAll: (params?: object) => api.get('/admin/blog', { params }),
  create: (data: FormData) => api.post('/admin/blog', data),
  update: (id: string, data: FormData | object) => api.put(`/admin/blog/${id}`, data),
  delete: (id: string) => api.delete(`/admin/blog/${id}`),
};

export const testimonials = {
  getAll: () => api.get('/admin/testimonials'),
  create: (data: FormData) => api.post('/admin/testimonials', data),
  update: (id: string, data: FormData | object) => api.put(`/admin/testimonials/${id}`, data),
  delete: (id: string) => api.delete(`/admin/testimonials/${id}`),
};

export const messages = {
  getAll: (params?: object) => api.get('/admin/messages', { params }),
  getOne: (id: string) => api.get(`/admin/messages/${id}`),
  markRead: (id: string) => api.patch(`/admin/messages/${id}/read`),
  reply: (id: string, replyText: string) => api.post(`/admin/messages/${id}/reply`, { replyText }),
  delete: (id: string) => api.delete(`/admin/messages/${id}`),
};

export const socialLinks = {
  getAll: () => api.get('/admin/social-links'),
  upsert: (data: object) => api.post('/admin/social-links', data),
  delete: (id: string) => api.delete(`/admin/social-links/${id}`),
};

export const resume = {
  list: () => api.get('/admin/resumes'),
  upload: (data: FormData) => api.post('/admin/resume', data),
};

export const analytics = {
  get: (days = 30) => api.get('/admin/analytics', { params: { days } }),
};
