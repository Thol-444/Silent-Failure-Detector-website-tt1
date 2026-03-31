import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { RoleRedirect } from './routes/RoleRedirect'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { StudentHome } from './pages/student/StudentHome'
import { StudentCourses } from './pages/student/StudentCourses'
import { StudentAnalytics } from './pages/student/StudentAnalytics'
import { StudentCourseDetail } from './pages/student/StudentCourseDetail'
import { InstructorHome } from './pages/instructor/InstructorHome'
import { InstructorCourses } from './pages/instructor/InstructorCourses'
import { InstructorAssignments } from './pages/instructor/InstructorAssignments'
import { InstructorActivity } from './pages/instructor/InstructorActivity'
import { InstructorAlerts } from './pages/instructor/InstructorAlerts'
import { AdminHome } from './pages/admin/AdminHome'
import { AdminUsers } from './pages/admin/AdminUsers'
import { AdminSystem } from './pages/admin/AdminSystem'

function HomeEntry() {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return <RoleRedirect />
}

function AuthedLayout() {
  return (
    <ProtectedRoute>
      <NotificationProvider>
        <Outlet />
      </NotificationProvider>
    </ProtectedRoute>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<HomeEntry />} />

      <Route element={<AuthedLayout />}>
        <Route
          path="/student"
          element={
            <ProtectedRoute roles={['STUDENT']}>
              <DashboardLayout role="STUDENT" title="Student dashboard" />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentHome />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="courses/:id" element={<StudentCourseDetail />} />
          <Route path="analytics" element={<StudentAnalytics />} />
        </Route>

        <Route
          path="/instructor"
          element={
            <ProtectedRoute roles={['INSTRUCTOR']}>
              <DashboardLayout role="INSTRUCTOR" title="Instructor dashboard" />
            </ProtectedRoute>
          }
        >
          <Route index element={<InstructorHome />} />
          <Route path="courses" element={<InstructorCourses />} />
          <Route path="assignments" element={<InstructorAssignments />} />
          <Route path="activity" element={<InstructorActivity />} />
          <Route path="alerts" element={<InstructorAlerts />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <DashboardLayout role="ADMIN" title="Admin dashboard" />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="system" element={<AdminSystem />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
