export interface Option {
  id?: number;
  option_text: string;
  is_correct: boolean;
}

export interface Question {
  id?: number;
  question_text: string;
  options: Option[];
}

export interface Quiz {
  id?: number;
  title: string;
  description: string;
  questions: Question[];
}

export interface Flashcard {
  id?: number;
  question: string;
  answer: string;
  order?: number;
}

export interface Material {
  id?: number;
  content_type: 'video' | 'podcast' | 'form' | 'pdf' | 'assignment';
  embed_url: string;
  title: string;
  point_value?: number;
  duration_seconds?: number;
  quiz?: Quiz;
}

export interface DepartmentSchedule {
  id?: number;
  department: string;
  department_name?: string;
  release_date: string | null;
  deactivation_date: string | null;
}

export interface PreEvaluationOption {
  id?: number | string;
  option_text: string;
  is_correct?: boolean;
}

export interface PreEvaluationQuestion {
  id?: number | string;
  question_text: string;
  order?: number;
  target_week?: number;
  options: PreEvaluationOption[];
}

export interface PreEvaluationTest {
  id?: number | string;
  title: string;
  description?: string;
  questions: PreEvaluationQuestion[];
}

export interface WeeklyContent {
  id: number;
  week_number: number;
  title: string;
  description: string;
  intro_title?: string;
  intro_description?: string;
  intro_video_url?: string;
  release_date?: string;
  deactivation_date?: string;
  department_schedules?: DepartmentSchedule[];
  is_locked: boolean;
  lock_reason?: string;
  is_intro_watched: boolean;
  materials: Material[];
  flashcards: Flashcard[];
  progress?: number;
  is_completed?: boolean;
  current_attempt_round: number;
  is_pretest_active?: boolean;
  is_pretest_completed?: boolean;
  pre_test?: PreEvaluationTest;
  is_temporarily_unlocked?: boolean;
  temporary_unlock_expires_at?: string | null;
  temporary_unlock_hours_remaining?: number;
  remediation_data?: {
    is_active: boolean;
    completion_percentage: number;
    duration_seconds: number;
    is_completed: boolean;
    expires_at: string;
  } | null;
}

export interface ProgressData {
  weekly_content: number | string;
  completion_percentage: number;
  is_completed: boolean;
}

export interface QuizDetailAnalysis {
  question_text: string;
  selected_option: string;
  correct_option: string;
  is_correct: boolean;
}

export interface WeeklyProgress {
  week_number: number;
  progress: number;
  progress_1?: number;
  progress_2?: number;
  current_round?: number;
  has_quiz?: boolean;
  is_round_2_started?: boolean;
  duration: string | number;
  duration_seconds?: number;
  duration_2?: string | number;
  score_1?: number;
  predicted_1?: number;
  diff_1?: number;
  score_2?: number;
  predicted_2?: number;
  diff_2?: number;
  correct_1?: number;
  wrong_1?: number;
  correct_2?: number;
  wrong_2?: number;
  questions?: string[];
  quiz_results?: QuizDetailAnalysis[];
  has_remediation?: boolean;
  remediation_progress?: number;
  remediation_duration?: number;
  remediation_is_completed?: boolean;
  remediation_is_active?: boolean;
  remediation_expires_at?: string | null;
  remediation_completed_materials?: {
    title: string;
    content_type: string;
    completed_at: string;
  }[];
  material_details?: {
    title: string;
    content_type: string;
    duration_seconds?: number;
    duration_seconds_1?: number;
    duration_seconds_2?: number;
  }[];
}

export interface BulkStudentData {
  id: string | number;
  full_name: string;
  email: string;
  department: string;
  total_points: number;
  total_time_1?: number;
  total_time_2?: number;
  total_time: number;
  avg_predicted?: number;
  avg_actual?: number;
  avg_diff?: number;
  weekly_breakdown: {
    week: number;
    progress: number;
    progress_1?: number;
    progress_2?: number;
    current_round?: number;
    duration: string | number;
    duration_seconds: number;
    duration_seconds_2: number;
    correct: number;
    wrong: number;
    correct_2: number;
    wrong_2: number;
    score_1?: number;
    predicted_1?: number;
    diff_1?: number;
    score_2?: number;
    predicted_2?: number;
    diff_2?: number;
    has_quiz: boolean;
    is_round_2_started: boolean;
    quiz_results?: QuizDetailAnalysis[];
    questions?: string[];
    material_details?: {
      title: string;
      content_type: string;
      duration_seconds_1?: number;
      duration_seconds_2?: number;
      duration_seconds: number;
    }[];
  }[];
}

export interface StudentAnalytics {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  total_points: number;
  total_time_spent: string;
  overall_progress: number;
  avg_predicted?: number;
  avg_actual?: number;
  avg_diff?: number;
  total_quizzes_taken?: number;
  weekly_breakdown: WeeklyProgress[];
}

export interface QuizResultState {
  score: number;
  predicted_score?: number;
  score_difference?: number;
  correct: number;
  wrong: number;
}

export interface ChatbotQuestionItem {
  id: number;
  week_number: number;
  week_title: string;
  question_text: string;
  response_text: string;
  created_at: string;
  created_at_iso?: string;
}

export interface ChatbotStudentData {
  id: string;
  first_name: string;
  last_name: string;
  department: string;
  question_count: number;
  questions: ChatbotQuestionItem[];
}

export interface ChatbotAnalyticsResponse {
  total_questions: number;
  active_users_count: number;
  total_users_count: number;
  students: ChatbotStudentData[];
}

export interface DepartmentItem {
  key: string;
  name: string;
  student_count?: number;
}

export const DEPARTMENT_MAP: Record<string, string> = {
  'matematik': 'Matematik',
  'siyasetbilimivekamuyonetimi': 'Siyaset Bilimi ve Kamu Yönetimi',
  'turkdiliveedebiyati': 'Türk Dili Ve Edebiyatı'
};

export const getDeptName = (deptKey: string) => {
  return DEPARTMENT_MAP[deptKey] || (deptKey ? deptKey.replace(/_/g, ' ').toUpperCase() : 'Bölüm Belirtilmemiş');
};

export const formatDuration = (totalSeconds: number | string | undefined) => {
  if (totalSeconds === undefined || totalSeconds === null) return "0 dk";
  const numSecs = typeof totalSeconds === 'number' ? totalSeconds : parseInt(totalSeconds, 10);
  if (isNaN(numSecs) || numSecs === 0) return "0 dk";
  
  const hours = Math.floor(numSecs / 3600);
  const minutes = Math.floor((numSecs % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} sa ${minutes} dk`;
  }
  return `${minutes} dk`;
};

export interface PreTestWrongDetail {
  question_text: string;
  target_week: number;
  selected_option: string;
}

export interface PreTestStudentWeekResult {
  week_number: number;
  week_title: string;
  is_pretest_active: boolean;
  has_attempt: boolean;
  score: number | null;
  correct: number | null;
  wrong: number | null;
  completed_at: string | null;
  unlocked_weeks: number[];
  wrong_questions: PreTestWrongDetail[];
}

export interface RemediationMaterialDetail {
  id: string;
  title: string;
  content_type: string;
  duration_seconds: number;
  duration_minutes: number;
  is_completed: boolean;
  completed_at: string | null;
}

export interface PreTestActiveRemediation {
  id?: string;
  week_number: number;
  week_title?: string;
  unlocked_at?: string | null;
  expires_at: string;
  hours_remaining: number;
  is_active?: boolean;
  completion_percentage?: number;
  total_duration_seconds?: number;
  duration_minutes?: number;
  is_completed?: boolean;
  completed_count?: number;
  total_materials_count?: number;
  materials_breakdown?: RemediationMaterialDetail[];
  completed_materials?: string[];
}

export interface PreTestStudentData {
  id: string;
  full_name: string;
  email: string;
  department: string;
  department_name: string;
  active_remediations: PreTestActiveRemediation[];
  all_remediations?: PreTestActiveRemediation[];
  weekly_results: PreTestStudentWeekResult[];
}

export interface PreTestAnalyticsResponse {
  total_students: number;
  total_attempts: number;
  average_score: number;
  remediation_summary: Record<string, number>;
  total_remediations?: number;
  active_remediations_count?: number;
  completed_remediations_count?: number;
  avg_remediation_progress?: number;
  students: PreTestStudentData[];
}

