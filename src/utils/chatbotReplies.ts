/**
 * Local LMS assistant when the backend chat API is unavailable.
 * Uses keyword matching (longer / more specific phrases first).
 */

function pick<T extends { k: string[]; a: string }>(
  q: string,
  rules: T[],
): string | null {
  const lower = q.toLowerCase().trim()
  for (const rule of rules) {
    for (const kw of rule.k) {
      if (lower.includes(kw)) return rule.a
    }
  }
  return null
}

export function localLmsReply(question: string): string {
  const q = question.trim()
  if (!q) {
    return 'Ask me about courses, assignments, grades, streaks, or instructor tools.'
  }

  const rules: { k: string[]; a: string }[] = [
    {
      k: ['how do i', 'where can i', 'how to enroll'],
      a: 'Go to Courses (student dashboard), find a course card, and click Enroll. You must be logged in as a student.',
    },
    {
      k: ['enroll', 'enrollment', 'register for course'],
      a: 'Open Student → Courses, choose a course, and use Enroll. If you do not see a course, your instructor may not have published it yet.',
    },
    {
      k: ['grade', 'grades', 'scored', 'score', 'grading', 'marked'],
      a: 'Grades usually appear after your instructor reviews the submission. Check Courses → Submission history for status and scores. Instructors grade from their assignment dashboards.',
    },
    {
      k: ['assignment', 'submit', 'submission', 'homework', 'due'],
      a: 'Use Submit assignment on the Courses page: enter the assignment ID from your instructor and optional answer text, then submit. Your history appears in Submission history.',
    },
    {
      k: ['streak', 'heatmap', 'analytics', 'activity streak'],
      a: 'Open Student → Analytics for a 30-day heatmap, current and longest streak, and submissions per day. Submit on consecutive days to grow your streak.',
    },
    {
      k: ['inactive', 'inactive student', 'alert'],
      a: 'Instructors use Student activity and Alerts to find inactive learners and send email/SMS reminders.',
    },
    {
      k: ['instructor', 'teach', 'create course'],
      a: 'As an instructor, use Courses to create or edit courses, Assignments to create tasks, and Alerts for inactive students.',
    },
    {
      k: ['admin', 'delete user', 'users'],
      a: 'Admins manage users and system monitoring from Admin → Users and System.',
    },
    {
      k: ['password', 'login', 'sign in', 'token', 'jwt'],
      a: 'Sign in with your email and password. The app stores a JWT in the browser for API calls. Use Log out in the header to clear it.',
    },
    {
      k: ['notification', 'notify', 'message'],
      a: 'Click the bell in the header to read notifications and use Send message at the bottom to add an in-app notification (and to your server if that endpoint exists).',
    },
    {
      k: ['silent failure', 'detector', 'safe', 'failure'],
      a: 'The Silent Failure Detector badge shows SAFE or FAILURE with a confidence score. Admins see more under System.',
    },
    {
      k: ['course', 'courses', 'module', 'class'],
      a: 'Courses list what you can enroll in (student) or manage (instructor). After enrolling, submit assignments tied to those courses.',
    },
    {
      k: ['thank', 'thanks', 'hello', 'hi', 'hey'],
      a: 'You are welcome! Ask about courses, grades, submissions, streaks, or instructor tools anytime.',
    },
  ]

  const hit = pick(q, rules)
  if (hit) return hit

  return (
    'I can help with courses, enrolling, assignments and submissions, grades, analytics and streaks, notifications, and instructor or admin tools. ' +
    'Try asking: “How do I submit an assignment?” or “Where are my grades?”'
  )
}
