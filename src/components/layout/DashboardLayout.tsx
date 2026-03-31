import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { ChatbotWidget } from '../chatbot/ChatbotWidget'
import type { Role } from '../../types'

export function DashboardLayout({
  role,
  title,
}: {
  role: Role
  title: string
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden md:block">
        <Sidebar role={role} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} />
        <MobileNav role={role} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <ChatbotWidget />
    </div>
  )
}
