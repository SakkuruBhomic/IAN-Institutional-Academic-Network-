import {
  Bell,
  ClipboardList,
  FilePlus2,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
} from 'lucide-react'
import { type ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAppContext } from '../../contexts/AppContext'
import { useAppStore } from '../../store/useAppStore'

const studentNav = [
  { key: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { key: 'requests', label: 'Requests', to: '/requests', icon: ClipboardList },
  { key: 'new-request', label: 'New Request', to: '/requests/new', icon: FilePlus2 },
  { key: 'notifications', label: 'Notifications', to: '/notifications', icon: Bell },
]

const officialNav = [
  { key: 'official', label: 'Dashboard', to: '/official', icon: LayoutDashboard },
  { key: 'workflow-library', label: 'Workflow Library', to: '/admin/workflows', icon: ShieldCheck },
  { key: 'admin', label: 'Admin Console', to: '/admin', icon: ShieldCheck },
]

export function AppShell({ children }: { children: ReactNode }) {
  const { currentRole, roleLabel, currentUser, logout } = useAppContext()
  const theme = useAppStore((state) => state.theme)
  const toggleTheme = useAppStore((state) => state.toggleTheme)
  const navigate = useNavigate()
  const location = useLocation()
  const isOfficial = currentRole === 'admin' || currentRole === 'HOD' || currentRole === 'deputyHOD' || currentRole === 'classCoordinator'
  const navItems = isOfficial ? officialNav : studentNav

  const activeNavKey = (() => {
    const path = location.pathname

    if (path === '/dashboard') return 'dashboard'
    if (path === '/requests') return 'requests'
    if (path === '/requests/new') return 'new-request'
    if (path === '/notifications') return 'notifications'
    if (path === '/settings') return 'settings'
    if (path === '/admin/workflows') return 'workflow-library'
    if (path === '/admin') return 'admin'
    if (path === '/official') return 'official'
    if (/^\/requests\/[^/]+$/.test(path)) return 'requests'
    if (/^\/official\//.test(path)) return 'official'

    return 'dashboard'
  })()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen app-container text-zinc-100 transition-colors duration-200">
      <div className="mx-auto flex min-h-screen max-w-[1600px] border-x border-white/8 app-wrapper">
        <aside className="hidden w-72 shrink-0 border-r border-white/8 app-sidebar p-5 lg:flex lg:flex-col">
          <Link to="/" className="mb-8 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-[11px] font-black text-white shadow-lg shadow-violet-600/30">
              IAN
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-white app-title">IAN</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">Intelligent Approval</div>
            </div>
          </Link>

          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Workspace</p>
          <nav className="space-y-1">
            {navItems.map(({ key, label, to, icon: Icon }) => (
              <NavLink
                key={`${label}-${to}`}
                to={to}
                className={() => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${activeNavKey === key ? 'border border-violet-500/30 bg-violet-500/15 text-violet-300 font-semibold' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
            <NavLink
              to="/settings"
              className={() => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${activeNavKey === 'settings' ? 'border border-violet-500/30 bg-violet-500/15 text-violet-300 font-semibold' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'}`}
            >
              <Settings className="h-4 w-4" />
              Settings & Profile
            </NavLink>
          </nav>

          <div className="mt-auto space-y-2">
            <Link
              to="/settings"
              className="block rounded-2xl border border-white/8 bg-[#12151b] app-card p-3.5 hover:border-violet-500/40 transition group"
            >
              <div className="flex items-center gap-3">
                {currentUser?.photo ? (
                  <img
                    src={currentUser.photo}
                    alt={currentUser.name}
                    className="h-10 w-10 rounded-xl border border-white/10 object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-xs font-bold text-white shadow-md">
                    {currentUser?.name?.slice(0, 2).toUpperCase() ?? 'ST'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-white group-hover:text-violet-300 transition">
                    {currentUser?.name ?? 'User'}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-mono">{currentUser?.rollNo ?? roleLabel}</p>
                </div>
              </div>
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full items-center justify-between rounded-xl border border-white/8 bg-[#12151b] app-card px-3 py-2.5 text-sm text-zinc-200 hover:bg-white/[0.06] transition"
            >
              <span className="flex items-center gap-2">
                {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-violet-400" />}
                <span className="text-xs">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </span>
              <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                {theme}
              </span>
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-white/8 app-header backdrop-blur-md">
            <div className="flex min-h-16 items-center justify-between gap-4 px-5 md:px-8">
              <div className="flex items-center gap-3">
                <Link to="/dashboard" className="flex items-center gap-2 lg:hidden">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-[10px] font-black text-white">IAN</div>
                  <span className="font-bold text-white app-title">IAN</span>
                </Link>
                <div className="hidden items-center gap-2 text-sm text-zinc-400 md:flex">
                  <span>{currentRole === 'student' ? 'Student' : 'Official'}</span>
                  <span>›</span>
                  <span className="text-zinc-200 font-medium">{navItems.find((item) => item.key === activeNavKey)?.label ?? 'Overview'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                {/* Theme Toggle Button */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-[#12151b] app-card text-zinc-300 hover:text-white transition hover:scale-105 active:scale-95"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-violet-500" />}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/notifications')}
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-[#12151b] app-card text-zinc-300 hover:text-white transition"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-violet-500" />
                </button>

                <Link
                  to="/settings"
                  className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-[#12151b] app-card px-2.5 py-1.5 hover:border-violet-500/40 transition group"
                >
                  {currentUser?.photo ? (
                    <img
                      src={currentUser.photo}
                      alt={currentUser.name}
                      className="h-8 w-8 rounded-lg border border-white/10 object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-xs font-bold text-white shadow-md">
                      {currentUser?.name?.slice(0, 2).toUpperCase() ?? 'ST'}
                    </div>
                  )}
                  <div className="hidden text-left md:block">
                    <p className="text-[10px] text-zinc-400">{currentUser?.rollNo ?? roleLabel}</p>
                    <p className="text-xs font-bold text-white group-hover:text-violet-300 transition">
                      {currentUser?.name ?? 'User'}
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/8 bg-[#12151b] app-card px-3 py-2 text-sm text-zinc-300 hover:text-rose-400 transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            </div>
          </header>

          <div className="p-5 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}


