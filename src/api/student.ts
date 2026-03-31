import { api } from './client'
import { getFirst } from './http'
import {
  normalizeCourseContent,
  normalizeCourseList,
  normalizeLearningAnalytics,
  normalizeSubmissionList,
} from './normalize'
import type { Course, CourseContent, LearningAnalyticsData, Submission } from '../types'

// Backend URLs
const BASE_URL = 'http://localhost:8080'
const COURSE_PATH = `${BASE_URL}/student/courses`
const ENROLL_PATH = `${BASE_URL}/student/enroll`
const SUBMIT_PATH = `${BASE_URL}/student/submit`

// Build submission paths for a student
const submissionPathsForUser = (userId: string, email?: string) => {
  const enc = encodeURIComponent(userId)
  const paths = [`http://localhost:8080/student/submissions/${enc}`]
  if (email && email !== userId) {
    paths.push(`http://localhost:8080/student/submissions/email/${encodeURIComponent(email)}`)
  }
  return paths
}

// Fetch all courses available to the student
export async function fetchStudentCourses(): Promise<Course[]> {
  const raw = await getFirst<unknown>([COURSE_PATH])
  return normalizeCourseList(raw)
}

// Enroll a student in a course
export async function enrollInCourse(courseId: string, studentEmail?: string) {
  const bodies = [
    { courseId, studentEmail },
    { course_id: courseId, studentEmail },
    { id: courseId, studentEmail },
  ]
  let last: unknown
  for (const body of bodies) {
    try {
      const { data } = await api.post(ENROLL_PATH, body)
      return data
    } catch (e) {
      last = e
    }
  }
  throw last
}

// Payload interface for submitting assignments
export interface SubmitPayload {
  assignmentId: string
  content?: string
  fileUrl?: string
}

// Submit an assignment
export async function submitAssignment(payload: SubmitPayload) {
  const bodies = [
    payload,
    {
      assignmentId: payload.assignmentId,
      content: payload.content,
      fileUrl: payload.fileUrl,
    },
    {
      assignment_id: payload.assignmentId,
      content: payload.content,
    },
  ]
  let last: unknown
  for (const body of bodies) {
    try {
      const { data } = await api.post(SUBMIT_PATH, body)
      return data
    } catch (e) {
      last = e
    }
  }
  throw last
}

// Fetch submissions for a student
export async function fetchSubmissions(userId: string, email?: string): Promise<Submission[]> {
  const raw = await getFirst<unknown>(submissionPathsForUser(userId, email))
  return normalizeSubmissionList(raw)
}

export async function fetchCourseContent(courseId: string): Promise<CourseContent> {
  const enc = encodeURIComponent(courseId)
  const raw = await getFirst<unknown>([
    `${BASE_URL}/student/courses/${enc}/content`,
    `${BASE_URL}/courses/${enc}/content`,
  ])
  return normalizeCourseContent(raw, courseId)
}

export async function startModule(moduleId: string, courseId: string) {
  const bodies = [
    { moduleId, courseId },
    { module_id: moduleId, course_id: courseId },
    { id: moduleId, courseId },
  ]
  let last: unknown
  for (const body of bodies) {
    try {
      const { data } = await api.post(`${BASE_URL}/student/modules/start`, body)
      return data
    } catch (e) {
      last = e
    }
  }
  throw last
}

export async function fetchLearningAnalytics(studentId: string): Promise<LearningAnalyticsData> {
  const enc = encodeURIComponent(studentId)
  const raw = await getFirst<unknown>([
    `${BASE_URL}/analytics/learning?studentId=${enc}`,
    `${BASE_URL}/student/analytics?studentId=${enc}`,
  ])
  return normalizeLearningAnalytics(raw)
}