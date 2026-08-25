import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { APP_NAME } from '../lib/config'

interface NavItem {
  to: string
  label: string
  enabled: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', enabled: true },
  { to: '/admissions', label: 'Admissions', enabled: true },
  { to: '/students', label: 'Students', enabled: true },
  { to: '/academic', label: 'Academic', enabled: true },
  { to: '/attendance', label: 'Attendance', enabled: true },
  { to: '/hostel', label: 'Hostel', enabled: true },
  { to: '/fees', label: 'Fees & Finance', enabled: true },
  { to: '/library', label: 'Library', enabled: true },
  { to: '/transport', label: 'Transport', enabled: true },
  { to: '/exams', label: 'Exams & Results', enabled: true },
  { to: '/certificates', label: 'Certificates', enabled: true },
  { to: '/hr', label: 'HR & Payroll', enabled: true },
  { to: '/settings/import', label: 'Import Data', enabled: true },
  { to: '/settings/site-content', label: 'Public Site Content', enabled: true },
  { to: '/settings/users', label: 'Staff Logins', enabled: true },
  { to: '/settings/roles', label: 'Roles & Permissions', enabled: true },
  { to: '/settings/demo-data', label: 'Sample Data', enabled: true },
]

export function AppLayout() {
  const { user, logout } = useAuth()
  const [navOpen, setNavOpen] = useState(false)

  const sidebar = (
    <>
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
        <span className="min-w-0 truncate text-lg font-semibold tracking-tight">{APP_NAME}</span>
        <button
          onClick={() => setNavOpen(false)}
          aria-label="Close menu"
          className="-mr-1 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) =>
          item.enabled ? (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setNavOpen(false)}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ) : (
            <div
              key={item.to}
              title="Coming soon"
              className="flex cursor-not-allowed items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-slate-400"
            >
              <span>{item.label}</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Soon
              </span>
            </div>
          ),
        )}
      </nav>
      <div className="border-t border-slate-200 p-4">
        <Link to="/training" target="_blank" rel="noreferrer" className="mb-3 block text-xs font-medium text-indigo-600 hover:underline">
          Help &amp; Training Guide ↗
        </Link>
        <div className="mb-2 truncate text-sm font-medium text-slate-700">{user?.name}</div>
        <div className="mb-3 truncate text-xs text-slate-400">{user?.email}</div>
        <button
          onClick={logout}
          className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Log out
        </button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">{sidebar}</aside>

      {/* Mobile off-canvas sidebar */}
      {navOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setNavOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setNavOpen(true)}
            aria-label="Open menu"
            className="-ml-1 rounded-md p-1.5 text-slate-600 hover:bg-slate-100"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="min-w-0 truncate text-base font-semibold tracking-tight">{APP_NAME}</span>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
