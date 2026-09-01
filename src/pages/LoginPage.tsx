import {
  ArrowRight,
  ChevronDown,
  Eye,
  EyeOff,
  GraduationCap,
  HelpCircle,
  KeyRound,
  Lock,
  Shield,
  User,
} from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppContext } from '../contexts/AppContext'
import type { OfficialRole } from '../data/officialAccounts'
import type { Role } from '../types'

type LoginMode = 'student' | 'official'

const officialRoleOptions: Array<{ value: OfficialRole; label: string }> = [
  { value: 'classCoordinator', label: 'Class Coordinator Desk' },
  { value: 'deputyHOD', label: 'Deputy Head of Department (Deputy HOD)' },
  { value: 'HOD', label: 'Head of Department (HOD Office)' },
  { value: 'admin', label: 'Academic Dean / Administration' },
]

function getRoleRoute(role: Role) {
  if (role === 'admin') return '/admin'
  if (role === 'HOD' || role === 'deputyHOD' || role === 'classCoordinator') return '/official'
  return '/dashboard'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loginOfficial, currentUser } = useAppContext()
  const [mode, setMode] = useState<LoginMode>('student')
  const [role, setRole] = useState<OfficialRole>('classCoordinator')
  const [rollNo, setRollNo] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showDirectory, setShowDirectory] = useState(false)

  useEffect(() => {
    if (currentUser) {
      navigate(getRoleRoute(currentUser.role), { replace: true })
    }
  }, [currentUser, navigate])

  const handleStudentLogin = async (event: FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setMessage('')

    if (!rollNo.trim()) {
      setMessage('Please enter your University Roll Number.')
      setIsLoading(false)
      return
    }
    if (!password) {
      setMessage('Please enter your password.')
      setIsLoading(false)
      return
    }

    const result = login(rollNo.trim(), password)

    if (!result.ok) {
      setMessage(result.message)
      setIsLoading(false)
      return
    }

    navigate('/dashboard')
  }

  const handleOfficialLogin = async (event: FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setMessage('')

    if (!username.trim()) {
      setMessage('Please enter your Official Faculty ID / Desk Username.')
      setIsLoading(false)
      return
    }
    if (!password) {
      setMessage('Please enter your password.')
      setIsLoading(false)
      return
    }

    const result = loginOfficial(role, username.trim(), password)

    if (!result.ok) {
      setMessage(result.message)
      setIsLoading(false)
      return
    }

    navigate(getRoleRoute(role))
  }

  return (
    <div className="min-h-screen bg-[#07090d] flex flex-col items-center justify-center px-4 py-12 md:px-6 relative text-zinc-100 selection:bg-violet-500/30">
      {/* Subtle Ambient Institutional Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(139,92,246,0.1),transparent_70%)]" />

      <div className="relative w-full max-w-[480px] flex flex-col items-center">
        {/* Header Institution Crest */}
        <Link to="/" className="mb-6 flex flex-col items-center text-center group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-sm font-black text-white shadow-xl shadow-violet-600/30 group-hover:scale-105 transition">
            IAN
          </div>
          <span className="mt-2 text-xl font-bold tracking-tight text-white">
            Institutional Access Portal
          </span>
          <p className="text-[11px] text-zinc-400 uppercase tracking-[0.18em]">
            Academic Operations & Approvals
          </p>
        </Link>

        {/* Auth Box */}
        <div className="w-full rounded-3xl border border-white/10 bg-[#10131a]/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
          {/* Segmented Switch */}
          <div className="flex rounded-2xl border border-white/8 bg-[#0a0c10] p-1.5 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('student')
                setMessage('')
              }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
                mode === 'student'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <GraduationCap className="h-4 w-4" /> Student Portal
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('official')
                setMessage('')
              }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
                mode === 'official'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Shield className="h-4 w-4" /> Faculty & Review Desk
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {mode === 'student' ? 'Student Authentication' : 'Faculty & Reviewer Sign In'}
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              {mode === 'student'
                ? 'Sign in to generate OD permission letters and monitor approval stages.'
                : 'Sign in to review, sanction, or escalate pending student applications.'}
            </p>
          </div>

          {message && (
            <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-300">
              {message}
            </div>
          )}

          {mode === 'student' ? (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Institutional Roll Number
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value.toUpperCase())}
                    placeholder="e.g. 24CS1042"
                    className="w-full rounded-xl border border-white/8 bg-[#0a0c10] py-2.5 pl-10 pr-4 text-sm font-mono text-white placeholder-zinc-500 outline-none focus:border-violet-500 transition"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/8 bg-[#0a0c10] py-2.5 pl-10 pr-10 text-sm text-white placeholder-zinc-500 outline-none focus:border-violet-500 transition"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 active:scale-[0.98] transition disabled:opacity-50"
              >
                {isLoading ? 'Verifying Credentials...' : 'Sign In as Student'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleOfficialLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Administrative Designation
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as OfficialRole)}
                    className="w-full appearance-none rounded-xl border border-white/8 bg-[#0a0c10] px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500 transition"
                  >
                    {officialRoleOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#0a0c10] text-white">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-zinc-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Reviewer ID / Username
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. coordinator_cse_a or hod"
                    className="w-full rounded-xl border border-white/8 bg-[#0a0c10] py-2.5 pl-10 pr-4 text-sm font-mono text-white placeholder-zinc-500 outline-none focus:border-violet-500 transition"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/8 bg-[#0a0c10] py-2.5 pl-10 pr-10 text-sm text-white placeholder-zinc-500 outline-none focus:border-violet-500 transition"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 active:scale-[0.98] transition disabled:opacity-50"
              >
                {isLoading ? 'Verifying Faculty Access...' : 'Access Review Desk'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* Directory Reference Helper */}
          <div className="mt-6 pt-5 border-t border-white/8">
            <button
              type="button"
              onClick={() => setShowDirectory(!showDirectory)}
              className="flex w-full items-center justify-between text-xs text-zinc-400 hover:text-zinc-200 transition"
            >
              <span className="flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-violet-400" /> Institutional Account Directory
              </span>
              <span className="text-[10px] text-violet-400 font-semibold underline">
                {showDirectory ? 'Collapse' : 'View Account Reference'}
              </span>
            </button>

            {showDirectory && (
              <div className="mt-3 rounded-2xl border border-white/8 bg-[#0a0c10] p-4 text-xs space-y-3 text-zinc-300">
                <div className="text-[11px] font-semibold text-violet-300 pb-2 border-b border-white/6">
                  Default password for all accounts: <span className="font-mono text-white font-bold">12345678</span>
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Student Roll Numbers:</p>
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px] text-zinc-400">
                    <div><span className="text-zinc-200 font-bold">24CS1042</span> - S. Bhomic</div>
                    <div><span className="text-zinc-200 font-bold">24AI2089</span> - J. Yashika</div>
                    <div><span className="text-zinc-200 font-bold">24CS3015</span> - Varshita</div>
                    <div><span className="text-zinc-200 font-bold">24CS4078</span> - Joel</div>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Faculty & Reviewer Desks:</p>
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px] text-zinc-400">
                    <div><span className="text-zinc-200">coordinator_cse_a</span> (CSE-A)</div>
                    <div><span className="text-zinc-200">coordinator_ai</span> (AI & DS)</div>
                    <div><span className="text-zinc-200">deputyhod_cse</span> (CSE Dept)</div>
                    <div><span className="text-zinc-200">deputyhod_ai</span> (AI Dept)</div>
                    <div><span className="text-zinc-200">hod</span> (Head of Dept)</div>
                    <div><span className="text-zinc-200">admin</span> (Dean Office)</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security / Compliance Notice */}
        <p className="mt-6 text-center text-[11px] text-zinc-500">
          Authorized university access only. All actions are digitally signed and recorded in institutional audit logs.
        </p>
      </div>
    </div>
  )
}
