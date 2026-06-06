import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('refresh_token')
        if (!refresh) throw new Error('No refresh token')
        const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh })
        localStorage.setItem('access_token', data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// Typed API helpers
export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login/', { email, password }),
  register: (data: object) => api.post('/auth/register/', data),
  logout: (refresh: string) => api.post('/auth/logout/', { refresh }),
  me: () => api.get('/auth/me/'),
  setPassword: (data: object) => api.post('/auth/set-password/', data),
  changePassword: (data: object) => api.post('/auth/change-password/', data),
  autoAccount: (data: object) => api.post('/auth/auto-account/', data),
  submitWithAccount: (data: object) => api.post('/auth/submit-with-account/', data),
  updateClientProfile: (data: object) => api.patch('/auth/profile/client/', data),
  updateExpertProfile: (data: object) => api.patch('/auth/profile/expert/', data),
  adminUsers: (params?: object) => api.get('/auth/admin/users/', { params }),
  adminBanUser: (id: number) => api.post(`/auth/admin/users/${id}/ban/`),
  systemSummary: () => api.get('/auth/admin/summary/'),
}

export const projectApi = {
  list: (params?: object) => api.get('/projects/', { params }),
  create: (data: object) => api.post('/projects/', data),
  detail: (id: number) => api.get(`/projects/${id}/`),
  update: (id: number, data: object) => api.patch(`/projects/${id}/`, data),
  jobBoard: (params?: object) => api.get('/projects/job-board/', { params }),
  claim: (id: number) => api.post(`/projects/${id}/claim/`),
  addProgress: (id: number, data: object) => api.post(`/projects/${id}/progress/`, data),
  submit: (id: number) => api.post(`/projects/${id}/submit/`),
  approve: (id: number, data: object) => api.post(`/projects/${id}/approve/`, data),
  setPrice: (id: number, data: object) => api.post(`/projects/${id}/set-price/`, data),
  uploadFile: (id: number, formData: FormData) => api.post(`/projects/${id}/upload/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  download: (token: string) => api.get(`/projects/download/${token}/`),
  submitReview: (id: number, data: object) => api.post(`/projects/${id}/review/`, data),
}

export const paymentApi = {
  wallet: () => api.get('/payments/wallet/'),
  pay: (id: number, data: object) => api.post(`/payments/pay/${id}/`, data),
  validateCoupon: (code: string) => api.post('/payments/coupon/validate/', { code }),
  financialDashboard: () => api.get('/payments/admin/dashboard/'),
  coupons: () => api.get('/payments/admin/coupons/'),
  createCoupon: (data: object) => api.post('/payments/admin/coupons/', data),
  commissions: () => api.get('/payments/admin/commissions/'),
}

export const chatApi = {
  rooms: () => api.get('/chat/rooms/'),
  messages: (roomId: number) => api.get(`/chat/rooms/${roomId}/messages/`),
  createRoom: (data: object) => api.post('/chat/rooms/create/', data),
}

export const notifApi = {
  list: () => api.get('/notifications/'),
  markRead: () => api.post('/notifications/mark-read/'),
  unread: () => api.get('/notifications/unread/'),
}

export const recruitApi = {
  apply: (data: object) => api.post('/recruitment/apply/', data),
  startTest: (id: number) => api.post(`/recruitment/${id}/start-test/`),
  submitTest: (id: number, formData: FormData) => api.post(`/recruitment/${id}/submit-test/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  adminList: (params?: object) => api.get('/recruitment/admin/applications/', { params }),
  adminReview: (id: number, data: object) => api.post(`/recruitment/admin/applications/${id}/review/`, data),
}