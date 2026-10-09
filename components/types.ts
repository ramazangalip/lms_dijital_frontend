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
  'siyasetbilimivekamuyonetimi': 'Siyaset Bilimi Ve Kamu Yönetimi',
  'turkdiliveedebiyati': 'Türk Dili Ve Edebiyatı',
  'matematik': 'Matematik'
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
