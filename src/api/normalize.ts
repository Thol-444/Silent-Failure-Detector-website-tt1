import type {
  Assignment,
  Course,
  CourseContent,
  CourseModule,
  CourseQuiz,
  LearningAnalyticsData,
  Submission,
  SystemStatus,
} from '../types'

export function normalizeCourse(raw: unknown): Course {
  if (!raw || typeof raw !== 'object') {
    return { id: '', title: '' }
  }
  const o = raw as Record<string, unknown>
  const idRaw = o.id ?? o.courseId ?? o.course_id
  const titleRaw = o.title ?? o.courseTitle ?? o.name ?? o.courseName
  const codeRaw = o.code ?? o.courseCode ?? o.course_code
  const enrolled =
    typeof o.enrolled === 'boolean'
      ? o.enrolled
      : typeof o.isEnrolled === 'boolean'
        ? o.isEnrolled
        : undefined
  return {
    id: idRaw != null ? String(idRaw) : '',
    title: titleRaw != null ? String(titleRaw) : 'Untitled',
    description:
      o.description != null ? String(o.description) : undefined,
    code: codeRaw != null ? String(codeRaw) : undefined,
    instructorId:
      o.instructorId != null ? String(o.instructorId) : undefined,
    enrolled,
  }
}

export function normalizeCourseList(raw: unknown): Course[] {
  if (Array.isArray(raw)) {
    return raw.map(normalizeCourse).filter((c) => c.id || c.title)
  }
  if (raw && typeof raw === 'object') {
    const r = raw as Record<string, unknown>
    const inner = r.courses ?? r.data ?? r.content ?? r.items
    if (Array.isArray(inner)) {
      return inner.map(normalizeCourse).filter((c) => c.id || c.title)
    }
  }
  return []
}

export function normalizeSubmission(raw: unknown): Submission {
  if (!raw || typeof raw !== 'object') {
    return { id: '' }
  }
  const o = raw as Record<string, unknown>
  const idRaw = o.id ?? o.submissionId
  return {
    id: idRaw != null ? String(idRaw) : '',
    assignmentId:
      o.assignmentId != null ? String(o.assignmentId) : undefined,
    courseId: o.courseId != null ? String(o.courseId) : undefined,
    title:
      o.title != null
        ? String(o.title)
        : o.assignmentTitle != null
          ? String(o.assignmentTitle)
          : undefined,
    status: o.status != null ? String(o.status) : undefined,
    submittedAt:
      o.submittedAt != null
        ? String(o.submittedAt)
        : o.submitted_at != null
          ? String(o.submitted_at)
          : undefined,
    createdAt:
      o.createdAt != null
        ? String(o.createdAt)
        : o.created_at != null
          ? String(o.created_at)
          : undefined,
    score: typeof o.score === 'number' ? o.score : undefined,
    content: o.content != null ? String(o.content) : undefined,
  }
}

export function normalizeSubmissionList(raw: unknown): Submission[] {
  if (Array.isArray(raw)) {
    return raw.map(normalizeSubmission).filter((s) => s.id)
  }
  if (raw && typeof raw === 'object') {
    const r = raw as Record<string, unknown>
    const inner = r.submissions ?? r.data ?? r.items ?? r.content
    if (Array.isArray(inner)) {
      return inner.map(normalizeSubmission).filter((s) => s.id)
    }
  }
  return []
}

function normalizeModule(raw: unknown, courseId?: string): CourseModule {
  if (!raw || typeof raw !== 'object') {
    return { id: '', courseId: courseId ?? '', title: '' }
  }
  const o = raw as Record<string, unknown>
  return {
    id: String(o.id ?? o.moduleId ?? o.module_id ?? ''),
    courseId: String(o.courseId ?? o.course_id ?? courseId ?? ''),
    title: String(o.title ?? o.moduleTitle ?? o.name ?? 'Untitled module'),
    description: o.description != null ? String(o.description) : undefined,
    started:
      typeof o.started === 'boolean'
        ? o.started
        : typeof o.isStarted === 'boolean'
          ? o.isStarted
          : undefined,
  }
}

function normalizeQuiz(raw: unknown, courseId?: string): CourseQuiz {
  if (!raw || typeof raw !== 'object') {
    return { id: '', courseId: courseId ?? '', title: '' }
  }
  const o = raw as Record<string, unknown>
  return {
    id: String(o.id ?? o.quizId ?? o.quiz_id ?? ''),
    courseId: String(o.courseId ?? o.course_id ?? courseId ?? ''),
    title: String(o.title ?? o.quizTitle ?? o.name ?? 'Untitled quiz'),
    description: o.description != null ? String(o.description) : undefined,
  }
}

function normalizeAssignment(raw: unknown, courseId?: string): Assignment {
  if (!raw || typeof raw !== 'object') {
    return { id: '', courseId: courseId ?? '', title: '' }
  }
  const o = raw as Record<string, unknown>
  return {
    id: String(o.id ?? o.assignmentId ?? o.assignment_id ?? ''),
    courseId: String(o.courseId ?? o.course_id ?? courseId ?? ''),
    title: String(o.title ?? o.assignmentTitle ?? o.name ?? 'Untitled assignment'),
    description: o.description != null ? String(o.description) : undefined,
    dueDate: o.dueDate != null ? String(o.dueDate) : undefined,
  }
}

function pickArray(raw: Record<string, unknown>, keys: string[]): unknown[] {
  for (const key of keys) {
    const value = raw[key]
    if (Array.isArray(value)) return value
  }
  return []
}

export function normalizeCourseContent(raw: unknown, courseId?: string): CourseContent {
  if (!raw || typeof raw !== 'object') {
    return { modules: [], quizzes: [], assignments: [] }
  }
  const o = raw as Record<string, unknown>
  const modulesRaw = pickArray(o, ['modules', 'courseModules', 'data'])
  const quizzesRaw = pickArray(o, ['quizzes', 'courseQuizzes'])
  const assignmentsRaw = pickArray(o, ['assignments', 'courseAssignments', 'tasks'])
  return {
    modules: modulesRaw.map((m) => normalizeModule(m, courseId)).filter((m) => m.id || m.title),
    quizzes: quizzesRaw.map((q) => normalizeQuiz(q, courseId)).filter((q) => q.id || q.title),
    assignments: assignmentsRaw
      .map((a) => normalizeAssignment(a, courseId))
      .filter((a) => a.id || a.title),
  }
}

export function normalizeLearningAnalytics(raw: unknown): LearningAnalyticsData {
  if (!raw || typeof raw !== 'object') {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalSubmissions: 0,
      activeDays: 0,
      activity: Array(30).fill(0),
    }
  }
  const o = raw as Record<string, unknown>
  const activityRaw = Array.isArray(o.activity)
    ? o.activity
    : Array.isArray(o.activityData)
      ? o.activityData
      : []
  const activity = activityRaw
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v))
    .slice(-30)
  while (activity.length < 30) activity.unshift(0)
  return {
    currentStreak: Number(o.currentStreak ?? o.current_streak ?? 0) || 0,
    longestStreak: Number(o.longestStreak ?? o.longest_streak ?? 0) || 0,
    totalSubmissions: Number(o.totalSubmissions ?? o.total_submissions ?? 0) || 0,
    activeDays: Number(o.activeDays ?? o.active_days ?? 0) || 0,
    activity,
  }
}

export function normalizeSystemStatus(raw: unknown): SystemStatus {
  if (!raw || typeof raw !== 'object') {
    return { status: 'SAFE', confidence: 0, message: 'No data' }
  }
  const o = raw as Record<string, unknown>
  const statusRaw = String(o.status ?? o.state ?? '').toUpperCase()
  const status: 'SAFE' | 'FAILURE' =
    statusRaw === 'FAILURE' ||
    statusRaw === 'FAILED' ||
    statusRaw === 'DANGER' ||
    statusRaw === 'ERROR'
      ? 'FAILURE'
      : 'SAFE'

  let conf = Number(o.confidence ?? o.confidenceScore ?? o.score ?? 0)
  if (conf > 0 && conf <= 1) conf = conf * 100

  return {
    status,
    confidence: Number.isFinite(conf) ? conf : 0,
    message:
      o.message != null
        ? String(o.message)
        : o.detail != null
          ? String(o.detail)
          : undefined,
    lastChecked:
      o.lastChecked != null
        ? String(o.lastChecked)
        : o.last_checked != null
          ? String(o.last_checked)
          : o.timestamp != null
            ? String(o.timestamp)
            : undefined,
  }
}
