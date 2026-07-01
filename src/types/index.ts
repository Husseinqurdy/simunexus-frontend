export type Role = 'developer' | 'admin' | 'expert' | 'client'

export interface User {
  id: number
  email: string
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

export interface ProjectFile {
  id: number
  file: string
  file_type: string
  original_name: string
  file_size: number
  created_at: string
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
