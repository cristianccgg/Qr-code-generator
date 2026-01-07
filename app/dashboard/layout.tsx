import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FiHome, FiGrid, FiBarChart2, FiFolder, FiLogOut } from 'react-icons/fi'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#f5576c] to-[#f093fb] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">Q</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">QR Manager</h1>
              <p className="text-xs text-gray-500">Premium Dashboard</p>
            </div>
          </Link>
        </div>

        <nav className="px-4 space-y-1">
          <NavLink href="/dashboard" icon={FiHome}>
            Overview
          </NavLink>
          <NavLink href="/dashboard/qr-codes" icon={FiGrid}>
            QR Codes
          </NavLink>
          <NavLink href="/dashboard/campaigns" icon={FiFolder}>
            Campaigns
          </NavLink>
          <NavLink href="/dashboard/analytics" icon={FiBarChart2}>
            Analytics
          </NavLink>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#4facfe] to-[#00f2fe] rounded-full flex items-center justify-center text-white font-semibold">
              {session.user.name?.[0] || session.user.email?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session.user.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
            </div>
          </div>
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiLogOut className="text-lg" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  )
}

function NavLink({
  href,
  icon: Icon,
  children,
}: {
  href: string
  icon: any
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group"
    >
      <Icon className="text-xl text-gray-500 group-hover:text-[#f5576c] transition-colors" />
      <span className="font-medium">{children}</span>
    </Link>
  )
}
