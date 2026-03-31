export type Role = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'

export interface User {
  id: string
  name: string
  email: string
  phoneNumber?: string
  role: Role
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Course {
  id: string
  title: string
  description?: string
  code?: string
  instructorId?: string
  enrolled?: boolean
}

export interface CourseModule {
  id: string
  courseId: string
  title: string
  description?: string
  started?: boolean
}

export interface CourseQuiz {
  id: string
  courseId: string
  title: string
  description?: string
}

export interface Assignment {
  id: string
  courseId: string
  title: string
  description?: string
  dueDate?: string
}

export interface CourseContent {
  modules: CourseModule[]
  quizzes: CourseQuiz[]
  assignments: Assignment[]
}

export interface LearningAnalyticsData {
  currentStreak: number
  longestStreak: number
  totalSubmissions: number
  activeDays: number
  activity: number[]
}

export interface Submission {
  id: string
  assignmentId?: string
  courseId?: string
  title?: string
  status?: string
  submittedAt?: string
  createdAt?: string
  score?: number
  content?: string
}

export interface InactiveStudent {
  id: string
  name: string
  email: string
  lastActiveAt?: string
  daysInactive?: number
}

export interface SystemStatus {
  status: 'SAFE' | 'FAILURE'
  confidence: number
  message?: string
  lastChecked?: string
}

export interface AppNotification {
  id: string
  title: string
  body: string
  read: boolean
  createdAt: string
}
