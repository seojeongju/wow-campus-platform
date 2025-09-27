// WOW-CAMPUS Work Platform Database Types

export interface User {
  id: number;
  email: string;
  password_hash: string;
  user_type: 'company' | 'jobseeker' | 'agent' | 'admin';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  name: string;
  phone?: string;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  approved_by?: number;
  approved_at?: string;
}

export interface Company {
  id: number;
  user_id: number;
  company_name: string;
  business_number?: string;
  industry?: string;
  company_size?: 'startup' | 'small' | 'medium' | 'large';
  address?: string;
  website?: string;
  description?: string;
  founded_year?: number;
  employee_count?: number;
  created_at: string;
  updated_at: string;
}

export interface JobSeeker {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  nationality?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  visa_status?: string;
  korean_level?: 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'native';
  english_level?: 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'native';
  education_level?: string;
  major?: string;
  experience_years?: number;
  resume_url?: string;
  portfolio_url?: string;
  current_location?: string;
  preferred_location?: string;
  salary_expectation?: number;
  available_start_date?: string;
  bio?: string;
  skills?: string; // JSON array
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: number;
  user_id: number;
  agency_name: string;
  license_number?: string;
  specialization?: string; // JSON array
  commission_rate?: number;
  countries_covered?: string; // JSON array
  languages?: string; // JSON array
  experience_years?: number;
  total_placements?: number;
  success_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface JobPosting {
  id: number;
  company_id: number;
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  job_type: 'full_time' | 'part_time' | 'contract' | 'internship';
  job_category: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  visa_sponsorship?: boolean;
  korean_required?: boolean;
  experience_level?: 'entry' | 'junior' | 'mid' | 'senior' | 'executive';
  education_required?: string;
  skills_required?: string; // JSON array
  benefits?: string;
  application_deadline?: string;
  positions_available?: number;
  status: 'draft' | 'active' | 'paused' | 'closed' | 'expired';
  featured?: boolean;
  views_count?: number;
  applications_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: number;
  job_posting_id: number;
  jobseeker_id: number;
  agent_id?: number;
  status: 'submitted' | 'reviewed' | 'interview_scheduled' | 'interview_completed' | 'offered' | 'accepted' | 'rejected' | 'withdrawn';
  cover_letter?: string;
  resume_url?: string;
  additional_documents?: string; // JSON array
  interview_date?: string;
  interview_notes?: string;
  feedback?: string;
  rejection_reason?: string;
  applied_at: string;
  updated_at: string;
  reviewed_by?: number;
}

export interface Match {
  id: number;
  job_posting_id: number;
  jobseeker_id: number;
  agent_id?: number;
  match_score?: number;
  match_reasons?: string; // JSON array
  status: 'suggested' | 'viewed' | 'interested' | 'applied' | 'dismissed';
  created_at: string;
  updated_at: string;
}

export interface StudyProgram {
  id: number;
  program_type: 'language_course' | 'undergraduate' | 'graduate' | 'phd';
  institution_name: string;
  program_name: string;
  description?: string;
  duration_months?: number;
  tuition_fee?: number;
  currency?: string;
  location?: string;
  language_requirement?: string;
  academic_requirement?: string;
  application_deadline?: string;
  start_date?: string;
  capacity?: number;
  current_applications?: number;
  status: 'active' | 'inactive' | 'full';
  created_at: string;
  updated_at: string;
}

export interface StudyApplication {
  id: number;
  program_id: number;
  jobseeker_id: number;
  agent_id?: number;
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'waitlisted';
  documents_submitted?: string; // JSON array
  application_fee_paid?: boolean;
  notes?: string;
  applied_at: string;
  updated_at: string;
}

export interface Commission {
  id: number;
  agent_id: number;
  application_id?: number;
  study_application_id?: number;
  commission_type: 'job_placement' | 'study_placement';
  amount: number;
  currency?: string;
  percentage?: number;
  status: 'pending' | 'approved' | 'paid' | 'disputed';
  due_date?: string;
  paid_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SystemStats {
  id: number;
  stat_date: string;
  total_users?: number;
  total_companies?: number;
  total_jobseekers?: number;
  total_agents?: number;
  active_job_postings?: number;
  total_applications?: number;
  successful_placements?: number;
  total_revenue?: number;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read?: boolean;
  related_id?: number;
  related_type?: string;
  created_at: string;
}

// API 요청/응답 타입
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  user_type: 'company' | 'jobseeker' | 'agent';
  phone?: string;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
}

export interface JobSearchParams {
  keyword?: string;
  location?: string;
  job_category?: string;
  job_type?: string;
  salary_min?: number;
  salary_max?: number;
  experience_level?: string;
  visa_sponsorship?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}