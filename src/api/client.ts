import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.simunexus.com/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (config.data instanceof FormData) {
    // Browser lazima aweke boundary mwenyewe
    const h: any = config.headers
    if (typeof h.delete === 'function') h.delete('Content-Type')
    else delete h['Content-Type']
  }
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

export const authApi = {
  login:               (email: string, password: string) => api.post('/auth/login/', { email, password }),
  register:            (data: object) => api.post('/auth/register/', data),
  logout:              (refresh: string) => api.post('/auth/logout/', { refresh }),
  me:                  () => api.get('/auth/me/'),
  updateMe: (data: object | FormData) => api.patch('/auth/me/', data),
  setPassword:         (data: object) => api.post('/auth/set-password/', data),
  changePassword:      (data: object) => api.post('/auth/change-password/', data),
  submitWithAccount:   (data: FormData | object, onProgress?: (percent: number) => void) =>
    api.post('/auth/submit-with-account/', data, {
      timeout: 0, maxBodyLength: Infinity, maxContentLength: Infinity,
      onUploadProgress: (e) => { if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100)) },
    }),
  updateClientProfile: (data: object) => api.patch('/auth/profile/client/', data),
  updateExpertProfile: (data: object) => api.patch('/auth/profile/expert/', data),
  adminUsers:          (params?: object) => api.get('/auth/admin/users/', { params }),
  adminBanUser:        (id: number) => api.post(`/auth/admin/users/${id}/ban/`),
  adminCreateExpert:   (data: object) => api.post('/auth/admin/create-expert/', data),
  systemSummary:       () => api.get('/auth/admin/summary/'),
  registerExpert: (data: object) => api.post('/auth/register-expert/', data),

  // User management (admin only)
  adminUpdateUser:     (id: number, data: Record<string, any>) => api.patch(`/auth/admin/users/${id}/`, data),
  adminDeleteUser:     (id: number) => api.delete(`/auth/admin/users/${id}/delete/`),
  adminSetPassword:    (id: number, data: { new_password: string; confirm_password: string }) =>
    api.post(`/auth/admin/users/${id}/set-password/`, data),

  // Commission management (admin only)
  adminExpertCommissions:     () => api.get('/auth/admin/experts/commissions/'),
  adminSetExpertCommission:   (id: number, commission_rate: number) =>
    api.patch(`/auth/admin/experts/${id}/commission/`, { commission_rate }),
  adminDeveloperCommission:    () => api.get('/auth/admin/developer/commission/'),
  adminSetDeveloperCommission: (commission_rate: number) =>
    api.patch('/auth/admin/developer/commission/', { commission_rate }),

  // Dev system tools (admin only)
  systemHealth:        () => api.get('/auth/dev/system-health/'),
  testEmail:           (data: { email: string }) => api.post('/auth/admin/test-email/', data),
  resendPasswordLink:  (data: { email: string }) => api.post('/auth/admin/resend-password-link/', data),
}

export const projectApi = {
  list:         (params?: object) => api.get('/projects/', { params }),
  create:       (data: object) => api.post('/projects/', data),
  detail:       (id: number) => api.get(`/projects/${id}/`),
  update:       (id: number, data: object) => api.patch(`/projects/${id}/`, data),
  jobBoard:     (params?: object) => api.get('/projects/job-board/', { params }),
  claim:        (id: number) => api.post(`/projects/${id}/claim/`),
  addProgress:  (id: number, data: object) => api.post(`/projects/${id}/progress/`, data),
  submit:       (id: number) => api.post(`/projects/${id}/submit/`),
  approve:      (id: number, data: object) => api.post(`/projects/${id}/approve/`, data),
  setPrice:     (id: number, data: object) => api.post(`/projects/${id}/set-price/`, data),
  /** Pakia faili moja au nyingi (extension yoyote, ukubwa wowote) na progress. */
  uploadFiles:  (id: number, formData: FormData, onProgress?: (percent: number, loaded: number, total: number) => void, signal?: AbortSignal) =>
    api.post(`/projects/${id}/upload/`, formData, {
      timeout: 0, signal, maxBodyLength: Infinity, maxContentLength: Infinity,
      onUploadProgress: (e) => { if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100), e.loaded, e.total) },
    }),
  deleteFile:   (fileId: number) => api.delete(`/projects/files/${fileId}/`),
  download:     (token: string) => api.get(`/projects/download/${token}/`),
  submitReview: (id: number, data: object) => api.post(`/projects/${id}/review/`, data),
}

export const paymentApi = {
  wallet:             () => api.get('/payments/wallet/'),
  pay:                (id: number, data: object) => api.post(`/payments/pay/${id}/`, data),
  validateCoupon:     (code: string) => api.post('/payments/coupon/validate/', { code }),
  financialDashboard: () => api.get('/payments/admin/dashboard/'),
  coupons:            () => api.get('/payments/admin/coupons/'),
  createCoupon:       (data: object) => api.post('/payments/admin/coupons/', data),
  commissions:        () => api.get('/payments/admin/commissions/'),
  // PesaPal wallet top-up — customer picks their provider (M-Pesa, Tigo
  // Pesa, Airtel, HaloPesa, card) on PesaPal's own hosted page, so we
  // no longer send `provider` upfront like we did with AzamPay.
  // Returns { redirect_url, reference, payment_id, status }.
  initiateTopUp:      (amount: number, phoneNumber?: string) =>
    api.post('/payments/wallet/topup/', { amount, phone_number: phoneNumber }),
  topUpStatus:        (reference: string) => api.get(`/payments/wallet/topup/${reference}/status/`),
}

export const chatApi = {
  rooms:       () => api.get('/chat/rooms/'),
  messages:    (roomId: number) => api.get(`/chat/rooms/${roomId}/messages/`),
  createRoom:  (data: object) => api.post('/chat/rooms/create/', data),
  sendMessage: (roomId: number, content: string) =>
    api.post(`/chat/rooms/${roomId}/messages/`, { content }),
}

export const notifApi = {
  list:     () => api.get('/notifications/'),
  markRead: () => api.post('/notifications/mark-read/'),
  unread:   () => api.get('/notifications/unread/'),
}

export const recruitApi = {
  // Mwombaji
  tools:          () => api.get('/recruitment/tools/'),
  apply:          (data: object) => api.post('/recruitment/apply/', data),
  myApplication:  () => api.get('/recruitment/my-application/'),
  getApplication: (id: number) => api.get(`/recruitment/applications/${id}/`),
  startTest:      (id: number) => api.post(`/recruitment/applications/${id}/start-test/`),
  submitTest:     (id: number, data: FormData, onProgress?: (percent: number) => void) =>
    api.post(`/recruitment/applications/${id}/submit-test/`, data, {
      timeout: 0, maxBodyLength: Infinity, maxContentLength: Infinity,
      onUploadProgress: (e) => { if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100)) },
    }),
  // Admin: maombi
  adminList:   (params?: object) => api.get('/recruitment/admin/applications/', { params }),
  adminReview: (id: number, data: object) => api.post(`/recruitment/admin/applications/${id}/review/`, data),
  // Admin: benki la maswali
  adminTools:        () => api.get('/recruitment/admin/tools/'),
  adminCreateTool:   (data: object) => api.post('/recruitment/admin/tools/', data),
  adminUpdateTool:   (id: number, data: object) => api.patch(`/recruitment/admin/tools/${id}/`, data),
  adminDeleteTool:   (id: number) => api.delete(`/recruitment/admin/tools/${id}/`),
  adminQuestions:    (params?: object) => api.get('/recruitment/admin/questions/', { params }),
  adminCreateQuestion: (data: object) => api.post('/recruitment/admin/questions/', data),
  adminUpdateQuestion: (id: number, data: object) => api.patch(`/recruitment/admin/questions/${id}/`, data),
  adminDeleteQuestion: (id: number) => api.delete(`/recruitment/admin/questions/${id}/`),
  adminUploadBank:   (data: FormData, onProgress?: (percent: number) => void) =>
    api.post('/recruitment/admin/question-bank/upload/', data, {
      timeout: 0,
      onUploadProgress: (e) => { if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100)) },
    }),
  adminUploads:      () => api.get('/recruitment/admin/question-bank/uploads/'),
  adminDeleteUpload: (id: number) => api.delete(`/recruitment/admin/question-bank/uploads/${id}/`),
}

// Admin: video na picha za landing page
export const contentApi = {
  list:   (kind?: 'video' | 'image') => api.get('/content/admin/showcase/', { params: kind ? { kind } : {} }),
  create: (data: FormData, onProgress?: (percent: number) => void) =>
    api.post('/content/admin/showcase/', data, {
      timeout: 0, maxBodyLength: Infinity, maxContentLength: Infinity,
      onUploadProgress: (e) => { if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100)) },
    }),
  update: (id: number, data: FormData | object) => api.patch(`/content/admin/showcase/${id}/`, data),
  remove: (id: number) => api.delete(`/content/admin/showcase/${id}/`),
}

// Maudhui ya umma ya landing page (video + picha za simulation) — yanatoka backend
export const publicApi = {
  showcase: () => api.get('/public/showcase/'),
}
