export type Role = 'developer' | 'admin' | 'expert' | 'client'

export interface User {
  id: number
  email: string
  username?: string
  profile_completion?: number
  missing_profile_fields?: string[]
  first_name: string
  last_name: string
  role: Role
  phone: string
  whatsapp: string
  country: string
  avatar: string | null
  is_profile_complete: boolean
  is_online: boolean
  is_active: boolean
  last_active: string | null
  referral_code: string
  login_count: number
  created_at: string
  client_profile?: ClientProfile
  expert_profile?: ExpertProfile
  developer_profile?: DeveloperProfile
}

export interface ClientProfile {
  id: number
  type: 'student' | 'professional' | ''
  university: string
  program: string
  academic_year: string
  bio: string
  total_projects: number
}

export interface ExpertProfile {
  id: number
  level: 'beginner' | 'verified' | 'top' | 'elite'
  bio: string
  skills: string[]
  rating: number
  total_reviews: number
  completed_projects: number
  success_rate: number
  commission_rate: number
  is_available: boolean
  total_earned: number
}

export interface DeveloperProfile {
  id: number
  commission_rate: number
  total_earned: number
  bio: string
}

export type ProjectStatus = 'received' | 'assigned' | 'in_progress' | 'qc' | 'completed' | 'revision' | 'cancelled'
export type DeliveryType = 'standard' | 'urgent' | 'express'
export type SoftwareType = 'matlab' | 'proteus' | 'ansys' | 'labview' | 'multisim' | 'pscad' | 'etap' | 'hfss' | 'cst' | 'other'

export interface ProjectProgress {
  id: number
  percentage: number
  time_remaining: string
  note: string
  created_at: string
}

export type FileType = 'client_upload' | 'expert_partial' | 'expert_final' | 'admin_delivery' | 'explanation'
export type PreviewKind = 'image' | 'video' | 'audio' | 'pdf' | 'text' | 'other'

export interface ProjectFile {
  id: number
  file_type: FileType | string
  original_name: string
  file_size: number
  mime_type?: string
  created_at: string
  uploaded_by_name?: string | null
  /** Kiungo kilichosainiwa (kina muda). null = imefungwa. */
  url: string | null
  preview: PreviewKind
  locked: boolean
  lock_reason: 'PROFILE_INCOMPLETE' | 'NOT_COMPLETED' | 'HIDDEN' | null
}

export interface JobBoardProject {
  id: number
  title: string
  description: string
  software: SoftwareType
  software_version: string
  delivery_type: DeliveryType
  deadline: string
  client_price: string | null
  expert_earning: string | null
  matches_skills: boolean
  payment_status: 'unpaid' | 'advance' | 'paid'
  is_nda: boolean
  include_explanation: boolean
  files_count: number
  created_at: string
}

export interface TestTool { id: number; name: string; description?: string; is_active?: boolean; question_count?: number; active_question_count?: number }

export interface TestQuestion {
  id: number; tool: number; tool_name: string; number: number | null; text: string
  is_active: boolean; source: number | null; source_name: string | null; created_at: string
}

export interface QuestionUpload {
  id: number; tool: number | null; tool_name: string | null; original_name: string
  questions_created: number; questions_skipped: number; status: string; message: string
  uploaded_by_name: string | null; created_at: string; url: string
}

export interface TestSubmission {
  id: number; notes: string; submitted_at: string; is_late: boolean
  file_name: string; file_size: number; url: string; preview: PreviewKind
}

export interface ExpertApplication {
  id: number
  applicant: number
  applicant_name: string
  applicant_email: string | null
  skills: string[]
  bio: string
  experience_years: number
  portfolio_url: string
  status: 'pending' | 'testing' | 'submitted' | 'passed' | 'failed' | 'retry'
  test_started_at: string | null
  test_submitted_at: string | null
  admin_notes: string
  retry_count: number
  created_at: string
  test_questions: { id: number; tool_name: string; question_text: string }[]
  test_submission: TestSubmission | null
  test_deadline: string | null
  test_duration_minutes: number
  no_questions?: boolean
}

export interface ShowcaseItem {
  id: number
  kind: 'video' | 'image'
  title: string
  description: string
  software: string
  external_url: string
  duration: string
  order: number
  is_published: boolean
  file_url: string | null
  thumbnail_url: string | null
  file_size: number
  created_at: string
}

export interface SystemHealth {
  status: 'ok' | 'degraded'
  checks: Record<'database' | 'cache' | 'websocket', { ok: boolean; latency_ms: number; detail?: string; error?: string }>
  server: { environment: string; debug: boolean; python: string; django: string; platform: string; commit: string | null; time: string; timezone: string; uptime_seconds: number }
  storage: { backend: string; path: string; disk_total: number; disk_used: number; disk_free: number; media_bytes: number; media_files: number; media_truncated: boolean; x_accel_redirect: boolean }
  email: { backend: string; host: string; port: number; tls: boolean; ssl: boolean; from: string; user_configured: boolean; password_configured: boolean; is_console: boolean; tls_verify_disabled: boolean }
  payments: { pesapal: { configured: boolean; sandbox: boolean; ipn_url_set: boolean; ipn_id_set: boolean; callback_url_set: boolean }; azampay: { configured: boolean; sandbox: boolean } }
  config: { frontend_url: string; cors_origins: string[]; allowed_hosts: string[]; commission_defaults: { expert: number; developer: number; platform: number }; jwt_access_minutes: number; jwt_refresh_days: number; expert_test_minutes: number; expert_test_questions: number }
  counts: { users: Record<string, number>; users_online: number; projects: Record<string, number>; applications_to_review: number; test_questions: number; showcase_items: number; unsettled_commissions: number; wallet_total: string }
}

export interface ProjectReview {
  id: number
  rating: number
  comment: string
  created_at: string
}

export interface Project {
  id: number
  title: string
  description: string
  software: SoftwareType
  software_version: string
  deadline: string
  delivery_type: DeliveryType
  status: ProjectStatus
  client_price: string | null
  expert_cost_estimate: string | null
  advance_paid: string
  is_fully_paid: boolean
  payment_type: string
  is_nda: boolean
  include_explanation: boolean
  admin_notes: string
  rejection_reason: string
  client: User
  expert: User | null
  files: ProjectFile[]
  progress_updates: ProjectProgress[]
  review: ProjectReview | null
  claimed_at: string | null
  completed_at: string | null
  created_at: string
  // from list serializer
  client_name?: string
  expert_name?: string
  latest_progress?: { percentage: number; time_remaining: string } | null
}

export interface Notification {
  id: number
  type: string
  title: string
  body: string
  is_read: boolean
  project: number | null
  created_at: string
}

export interface ChatRoom {
  id: number
  room_type: string
  project: number | null
  other_user: { id: number; name: string; role: Role }
  unread_count: number
  created_at: string
}

export interface ChatMessage {
  id: number
  content: string
  file: string | null
  sender: number
  sender_name: string
  is_read: boolean
  created_at: string
}

export interface Wallet {
  balance: string
  currency: string
  updated_at: string
}

export interface WalletTransaction {
  id: number
  type: 'credit' | 'debit'
  amount: string
  description: string
  created_at: string
}

export interface CommissionSplit {
  total_amount: string
  expert_amount: string
  developer_amount: string
  platform_amount: string
  expert_rate: string
  developer_rate: string
  platform_rate: string
  is_settled: boolean
}

export interface AuthTokens {
  access: string
  refresh: string
  user: User
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
