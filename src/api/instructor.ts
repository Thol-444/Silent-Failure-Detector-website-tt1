import { api } from './client'
import { deleteFirst, getFirst, postFirstWithBodies } from './http'
import { normalizeCourse } from './normalize'
import type {
  Assignment,
  Course,
  CourseModule,
  CourseQuiz,
  InactiveStudent,
} from '../types'

const BASE_URL = 'http://localhost:8080'

const LIST_PATHS = [`${BASE_URL}/instructor/courses`]
const CREATE_PATHS = [`${BASE_URL}/instructor/courses`]
const INACTIVE_PATHS = [`${BASE_URL}/instructor/students/inactive`]

function courseCreateBodies(body: Partial<Course>) {
  return [
    {
      title: body.title,
      description: body.description,
      code: body.code,
    },
    {
      courseTitle: body.title,
      courseCode: body.code,
      description: body.description,
    },
    {
      name: body.title,
      code: body.code,
      description: body.description,
    },
  ]
}

function courseUpdateBodies(body: Partial<Course>) {
  return [
    {
      title: body.title,
      description: body.description,
      code: body.code,
    },
    {
      courseTitle: body.title,
      courseCode: body.code,
      description: body.description,
    },
  ]
}

export async function fetchInstructorCourses(): Promise<Course[]> {
  const raw = await getFirst<unknown>(LIST_PATHS)
  if (Array.isArray(raw)) {
    return raw.map(normalizeCourse).filter((c) => c.id || c.title)
  }
  if (raw && typeof raw === 'object') {
    const r = raw as Record<string, unknown>
    const inner = r.courses ?? r.data ?? r.items ?? r.content
    if (Array.isArray(inner)) {
      return inner.map(normalizeCourse).filter((c) => c.id || c.title)
    }
  }
  return []
}

export async function createCourse(body: Partial<Course>): Promise<Course> {
  const raw = await postFirstWithBodies<Record<string, unknown>>(
    CREATE_PATHS,
    courseCreateBodies(body)
  )
  return normalizeCourse(raw)
}

export async function updateCourse(
  id: string,
  body: Partial<Course>,
): Promise<Course> {
  const enc = encodeURIComponent(id)
  const paths = [`${BASE_URL}/instructor/courses/${enc}`]
  const payloads = courseUpdateBodies(body)
  let last: unknown
  for (const path of paths) {
    for (const payload of payloads) {
      try {
        const { data } = await api.put<unknown>(path, payload)
        return normalizeCourse(data)
      } catch (e) {
        last = e
      }
    }
  }
  throw last
}

export async function deleteCourse(id: string): Promise<void> {
  const enc = encodeURIComponent(id)
  await deleteFirst([`${BASE_URL}/instructor/courses/${enc}`])
}

export async function createAssignment(
  body: Partial<Assignment>,
): Promise<Assignment> {
  const bodies = [
    {
      courseId: body.courseId,
      title: body.title,
      description: body.description,
    },
    {
      course_id: body.courseId,
      title: body.title,
      description: body.description,
    },
    {
      courseId: body.courseId,
      assignmentTitle: body.title,
      description: body.description,
    },
  ]

  const raw = await postFirstWithBodies<Record<string, unknown>>(
    [`${BASE_URL}/instructor/assignment`],
    bodies
  )

  return {
    id: String(raw.id ?? raw.assignmentId ?? ''),
    courseId: String(body.courseId ?? raw.courseId ?? ''),
    title: String(body.title ?? raw.title ?? ''),
    description:
      body.description != null
        ? String(body.description)
        : raw.description != null
        ? String(raw.description)
        : undefined,
    dueDate: raw.dueDate != null ? String(raw.dueDate) : undefined,
  }
}

export async function createModule(
  body: Partial<CourseModule>,
): Promise<CourseModule> {
  const raw = await postFirstWithBodies<Record<string, unknown>>(
    [`${BASE_URL}/instructor/modules`, `${BASE_URL}/instructor/module`],
    [
      { courseId: body.courseId, title: body.title, description: body.description },
      { course_id: body.courseId, moduleTitle: body.title, description: body.description },
      { courseId: body.courseId, name: body.title, description: body.description },
    ],
  )
  return {
    id: String(raw.id ?? raw.moduleId ?? ''),
    courseId: String(body.courseId ?? raw.courseId ?? ''),
    title: String(body.title ?? raw.title ?? raw.moduleTitle ?? ''),
    description:
      body.description != null
        ? String(body.description)
        : raw.description != null
          ? String(raw.description)
          : undefined,
    started: typeof raw.started === 'boolean' ? raw.started : undefined,
  }
}

export async function createQuiz(
  body: Partial<CourseQuiz>,
): Promise<CourseQuiz> {
  const raw = await postFirstWithBodies<Record<string, unknown>>(
    [`${BASE_URL}/instructor/quizzes`, `${BASE_URL}/instructor/quiz`],
    [
      { courseId: body.courseId, title: body.title, description: body.description },
      { course_id: body.courseId, quizTitle: body.title, description: body.description },
      { courseId: body.courseId, name: body.title, description: body.description },
    ],
  )
  return {
    id: String(raw.id ?? raw.quizId ?? ''),
    courseId: String(body.courseId ?? raw.courseId ?? ''),
    title: String(body.title ?? raw.title ?? raw.quizTitle ?? ''),
    description:
      body.description != null
        ? String(body.description)
        : raw.description != null
          ? String(raw.description)
          : undefined,
  }
}

export async function fetchInactiveStudents(): Promise<InactiveStudent[]> {
  const raw = await getFirst<unknown>(INACTIVE_PATHS)
  if (Array.isArray(raw)) return raw as InactiveStudent[]
  if (raw && typeof raw === 'object' && 'students' in raw) {
    const s = (raw as { students: unknown }).students
    if (Array.isArray(s)) return s as InactiveStudent[]
  }
  return []
}

export interface SendAlertPayload {
  studentIds: string[]
  message: string
  channels?: ('email' | 'sms')[]
}

export async function sendAlert(payload: SendAlertPayload) {
  const { data } = await api.post(`${BASE_URL}/instructor/alerts/send`, payload)
  return data
}