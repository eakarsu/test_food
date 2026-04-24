import api from './api';
import { AuthResponse, PaginatedResponse, Post, User, FileRecord, QueryParams } from '../types';

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }).then((r) => r.data),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }).then((r) => r.data),
  verifyEmail: (token: string) =>
    api.get(`/auth/verify-email?token=${token}`).then((r) => r.data),
  resendVerification: () =>
    api.post('/auth/resend-verification').then((r) => r.data),
};

// Users
export const usersApi = {
  getMe: () => api.get<User>('/users/me').then((r) => r.data),
  updateMe: (data: Partial<User>) => api.put<User>('/users/me', data).then((r) => r.data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/users/change-password', { currentPassword, newPassword }).then((r) => r.data),
  getAll: (params?: QueryParams) =>
    api.get<PaginatedResponse<User>>('/users', { params }).then((r) => r.data),
  getById: (id: string) => api.get<User>(`/users/${id}`).then((r) => r.data),
  update: (id: string, data: Partial<User>) =>
    api.put<User>(`/users/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/users/${id}`).then((r) => r.data),
  bulkDelete: (ids: string[]) => api.delete('/users/bulk', { data: { ids } }).then((r) => r.data),
  bulkUpdate: (ids: string[], data: Record<string, unknown>) =>
    api.patch('/users/bulk', { ids, ...data }).then((r) => r.data),
};

// Posts
export const postsApi = {
  getAll: (params?: QueryParams) =>
    api.get<PaginatedResponse<Post>>('/posts', { params }).then((r) => r.data),
  getById: (id: string) => api.get<Post>(`/posts/by-id/${id}`).then((r) => r.data),
  getBySlug: (slug: string) => api.get<Post>(`/posts/${slug}`).then((r) => r.data),
  create: (data: Partial<Post>) => api.post<Post>('/posts', data).then((r) => r.data),
  update: (id: string, data: Partial<Post>) =>
    api.put<Post>(`/posts/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/posts/${id}`).then((r) => r.data),
  bulkDelete: (ids: string[]) => api.delete('/posts/bulk', { data: { ids } }).then((r) => r.data),
  bulkUpdate: (ids: string[], data: Record<string, unknown>) =>
    api.patch('/posts/bulk', { ids, ...data }).then((r) => r.data),
};

// Files
export const filesApi = {
  getAll: (params?: QueryParams) =>
    api.get<PaginatedResponse<FileRecord>>('/files', { params }).then((r) => r.data),
  getById: (id: string) => api.get<FileRecord>(`/files/${id}`).then((r) => r.data),
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/files/upload', formData).then((r) => r.data);
  },
  delete: (id: string) => api.delete(`/files/${id}`).then((r) => r.data),
  bulkDelete: (ids: string[]) => api.delete('/files/bulk', { data: { ids } }).then((r) => r.data),
};

// Exports
export const exportsApi = {
  csv: (entity: string, params?: QueryParams) =>
    api.get(`/exports/${entity}/csv`, { params, responseType: 'blob' }).then((r) => {
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${entity}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }),
  pdf: (entity: string, params?: QueryParams) =>
    api.get(`/exports/${entity}/pdf`, { params, responseType: 'blob' }).then((r) => {
      const url = window.URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${entity}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    }),
};
