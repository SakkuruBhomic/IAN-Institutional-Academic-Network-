import {
  AlertCircle,
  Clock3,
  FilePlus2,
  FileText,
  FolderCheck,
  Shield,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/ui/AppShell'
import { RequestTable } from '../components/ui/RequestTable'
import { StatCard } from '../components/ui/StatCard'
import { useAppContext } from '../contexts/AppContext'
import { getStudentByRoll } from '../data/studentAccounts'

export default function StudentDashboard() {
  const { requests, currentUser } = useAppContext()
  const studentName = currentUser?.name ?? 'Student'
  const studentMeta = currentUser ? getStudentByRoll(currentUser.rollNo) : null

  // Requests belonging to this student (matching by roll number or aliases)
  const studentRequests = currentUser
    ? requests.filter(
        (request) =>
          request.studentRollNo === currentUser.rollNo ||
          (studentMeta?.aliases && studentMeta.aliases.includes(request.studentRollNo)),
      )
    : requests

  const pendingCount = studentRequests.filter(
    (r) => r.status !== 'Approved' && r.status !== 'Rejected',
  ).length
  const approvedCount = studentRequests.filter((r) => r.status === 'Approved').length
  const changesCount = studentRequests.filter((r) => r.status === 'Changes Requested').length

  const stats = [
    {
      label: 'My Requests',
      value: String(studentRequests.length),
      trend: 'Total submitted',
      icon: <FileText className="h-5 w-5 text-violet-400" />,
    },
    {
      label: 'In Review Queue',
      value: String(pendingCount),
      trend: 'Active progress',
      icon: <Clock3 className="h-5 w-5 text-amber-400" />,
    },
    {
      label: 'Approved Sanctions',
      value: String(approvedCount),
      trend: 'Finalized',
      icon: <FolderCheck className="h-5 w-5 text-emerald-400" />,
    },
    {
      label: 'Action Required',
      value: String(changesCount),
      trend: 'Needs student revision',
      icon: <AlertCircle className="h-5 w-5 text-rose-400" />,
    },
  ]

  const coordinatorName =
    studentMeta?.assignedCoordinatorName ?? currentUser?.classCoordinator ?? 'Assigned Coordinator'
  const deputyHODName =
    studentMeta?.assignedDeputyHODName ?? currentUser?.deputyHOD ?? 'Dr. Meenakshi Sundaram'

  return (
    <AppShell>
      {/* Top Welcome Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 items-center gap-1 rounded-md bg-violet-500/20 px-2 text-[10px] font-bold uppercase tracking-wider text-violet-300">
              Student Workspace
            </span>
            <span className="text-xs text-zinc-400 font-mono">{currentUser?.rollNo}</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">
            Welcome back, {studentName}
          </h1>
          <p className="mt-0.5 text-xs text-zinc-400">
            Automated submission & live multi-tier institutional tracking
          </p>
        </div>

        <Link
          to="/requests/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 transition active:scale-[0.98]"
        >
          <Sparkles className="h-4 w-4" /> Create New Request
        </Link>
      </div>

      {/* Assigned Review Desk Banner */}
      <div className="mb-6 rounded-2xl border border-white/8 bg-[#12151b] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Assigned Approval Routing
            </p>
            <p className="text-xs font-semibold text-white">
              Primary Coordinator: <span className="text-emerald-300">{coordinatorName}</span> · Deputy HOD: <span className="text-amber-300">{deputyHODName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>AI Routing Desk Active</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            trend={stat.trend}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Requests Section */}
      <div className="mt-8 rounded-2xl border border-white/8 bg-[#12151b] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">My Live Submissions</h2>
            <p className="text-xs text-zinc-400">
              Showing {studentRequests.length} active approval request(s)
            </p>
          </div>

          <Link
            to="/requests/new"
            className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition"
          >
            <FilePlus2 className="h-3.5 w-3.5" /> Submit Query
          </Link>
        </div>

        {studentRequests.length > 0 ? (
          <RequestTable requests={studentRequests} detailRoutePrefix="/requests" />
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 bg-[#0d1015] p-8 text-center">
            <FileText className="mx-auto h-8 w-8 text-zinc-500 mb-2" />
            <p className="text-sm font-semibold text-white">No requests submitted yet</p>
            <p className="mt-1 text-xs text-zinc-400">
              Use the AI Copilot to generate and submit your first OD / permission letter.
            </p>
            <Link
              to="/requests/new"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-violet-500 transition"
            >
              <Sparkles className="h-3.5 w-3.5" /> Launch AI Studio
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  )
}
