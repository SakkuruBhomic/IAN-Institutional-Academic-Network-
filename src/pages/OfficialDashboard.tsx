import {
  CheckCheck,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  History,
  Inbox,
  Search,
  ShieldCheck,
  UserCheck,
  XCircle,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { AppShell } from '../components/ui/AppShell'
import { RequestTable } from '../components/ui/RequestTable'
import { StatCard } from '../components/ui/StatCard'
import { useAppContext } from '../contexts/AppContext'
import { exportAuditLogsToCSV, extractFullAuditLogs } from '../services/audit/auditExport'
import { uiRoleToWorkflowRole } from '../services/requestVisibility'

export default function OfficialDashboard() {
  const { requests, currentRole, currentUser } = useAppContext()
  const [activeTab, setActiveTab] = useState<'assigned' | 'department' | 'all' | 'reviewed' | 'audit'>('assigned')
  const [searchQuery, setSearchQuery] = useState('')

  const workflowRole = uiRoleToWorkflowRole(currentRole)

  // Requests specifically waiting for this official's review
  const pendingForMe = useMemo(() => {
    const myUsername = currentUser?.rollNo ?? '' // For officials, rollNo = username (e.g. 'coordinator_cse_a')

    return requests
      .filter((request) => {
        // Skip finalized requests
        if (request.status === 'Approved' || request.status === 'Rejected') return false

        // Admin sees everything pending
        if (currentRole === 'admin') return true

        // Class Coordinator: show requests at coordinator stage that are assigned to THIS coordinator
        if (currentRole === 'classCoordinator') {
          const isCoordinatorStage =
            request.currentStageIndex === 1 ||
            request.status === 'Pending' ||
            request.status === 'Submitted' ||
            request.workflow[request.currentStageIndex] === 'Class Coordinator'

          if (!isCoordinatorStage) return false

          // If the request has an assigned coordinator, only show if it's THIS coordinator
          if (request.assignedCoordinatorId) {
            return request.assignedCoordinatorId === myUsername
          }
          // Fallback: show all coordinator-stage requests (for legacy/demo data)
          return true
        }

        // Deputy HOD: show requests forwarded to deputy HOD stage
        if (currentRole === 'deputyHOD') {
          const isDeputyStage =
            request.status === 'Waiting for Deputy HOD' ||
            request.currentStageIndex === 2 ||
            request.workflow[request.currentStageIndex] === 'Deputy HOD'

          if (!isDeputyStage) return false

          // If assigned, only show if assigned to THIS deputy HOD
          if (request.assignedDeputyHODId) {
            return request.assignedDeputyHODId === myUsername
          }
          return true
        }

        // HOD: show requests escalated to HOD stage
        if (currentRole === 'HOD') {
          return (
            request.status === 'HOD Review' ||
            request.currentStageIndex === 3 ||
            request.workflow[request.currentStageIndex] === 'HOD'
          )
        }

        return request.workflow[request.currentStageIndex] === workflowRole
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [requests, currentRole, currentUser, workflowRole])

  // Department requests
  const departmentRequests = useMemo(() => {
    const userDept = currentUser?.branch ?? currentUser?.department
    if (!userDept || userDept === 'Administration' || currentRole === 'admin') return requests
    return requests.filter(
      (r) =>
        r.studentBranch?.toLowerCase().includes(userDept.toLowerCase()) ||
        userDept.toLowerCase().includes(r.studentBranch?.toLowerCase() ?? ''),
    )
  }, [requests, currentUser, currentRole])

  // Reviewed by me
  const reviewedByMe = useMemo(() => {
    return requests.filter((request) =>
      request.comments.some(
        (comment) =>
          comment.role === currentRole ||
          comment.author === currentUser?.name ||
          comment.author === currentUser?.rollNo,
      ),
    )
  }, [requests, currentRole, currentUser])

  // All extracted audit logs
  const auditLogs = useMemo(() => {
    const logs = extractFullAuditLogs(requests)
    if (!searchQuery.trim()) return logs
    const q = searchQuery.toLowerCase()
    return logs.filter(
      (l) =>
        l.requestId.toLowerCase().includes(q) ||
        l.studentName.toLowerCase().includes(q) ||
        l.actor.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.remarks.toLowerCase().includes(q),
    )
  }, [requests, searchQuery])

  const approvedToday = requests.filter((request) => request.status === 'Approved').length
  const rejected = requests.filter((request) => request.status === 'Rejected').length

  const visibleRequests = useMemo(() => {
    let list = pendingForMe
    if (activeTab === 'assigned') list = pendingForMe
    if (activeTab === 'department') list = departmentRequests
    if (activeTab === 'all') list = requests
    if (activeTab === 'reviewed') list = reviewedByMe

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.student.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q),
      )
    }
    return list
  }, [activeTab, pendingForMe, departmentRequests, requests, reviewedByMe, searchQuery])

  const deskTitle = currentUser?.name
    ? `${currentUser.name} - ${currentRole === 'classCoordinator' ? 'Coordinator Desk' : currentRole === 'deputyHOD' ? 'Deputy HOD Desk' : currentRole === 'HOD' ? 'HOD Office' : 'Admin Console'}`
    : currentRole === 'classCoordinator'
      ? 'Class Coordinator Review Desk'
      : currentRole === 'deputyHOD'
        ? 'Deputy HOD Review Desk'
        : currentRole === 'HOD'
          ? 'HOD Approvals'
          : 'Official Dashboard'

  const handleExportCSV = () => {
    const deptName = currentUser?.department ?? 'All_Departments'
    exportAuditLogsToCSV(requests, deptName)
  }

  return (
    <AppShell>
      {/* Top Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
              Official Review Workspace
            </span>
            {currentUser?.department && (
              <span className="text-xs text-zinc-400">• {currentUser.department}</span>
            )}
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">
            {deskTitle}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-[#12151b] px-3 py-2 text-sm text-zinc-400">
            <Search className="h-4 w-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, student, remarks..."
              className="w-44 bg-transparent text-xs text-zinc-200 placeholder-zinc-500 outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            title="Download full institutional audit trail and compliance log as CSV"
            className="inline-flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3.5 py-2 text-xs font-bold text-violet-200 hover:bg-violet-600 hover:text-white transition shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Audit CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Awaiting My Review"
          value={String(pendingForMe.length)}
          trend={pendingForMe.length > 0 ? 'Action Required' : 'Cleared'}
          icon={<Inbox className="h-5 w-5 text-violet-400" />}
        />
        <StatCard
          label="Sanctioned / Approved"
          value={String(approvedToday)}
          trend="Finalized"
          icon={<CheckCheck className="h-5 w-5 text-emerald-400" />}
        />
        <StatCard
          label="Rejected / Revision"
          value={String(rejected)}
          trend="Tracked"
          icon={<XCircle className="h-5 w-5 text-rose-400" />}
        />
        <StatCard
          label="Audit Compliance"
          value="100%"
          trend="NAAC / NBA Ready"
          icon={<ShieldCheck className="h-5 w-5 text-sky-400" />}
        />
      </div>

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-white/8 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('assigned')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'assigned'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
              : 'border border-white/8 bg-[#12151b] text-zinc-400 hover:text-white'
          }`}
        >
          <Inbox className="h-3.5 w-3.5" /> Awaiting My Review ({pendingForMe.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('department')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'department'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
              : 'border border-white/8 bg-[#12151b] text-zinc-400 hover:text-white'
          }`}
        >
          <UserCheck className="h-3.5 w-3.5" /> My Department ({departmentRequests.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'all'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
              : 'border border-white/8 bg-[#12151b] text-zinc-400 hover:text-white'
          }`}
        >
          <FileText className="h-3.5 w-3.5" /> All Live Requests ({requests.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reviewed')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'reviewed'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
              : 'border border-white/8 bg-[#12151b] text-zinc-400 hover:text-white'
          }`}
        >
          <Clock3 className="h-3.5 w-3.5" /> Reviewed by Me ({reviewedByMe.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'audit'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
              : 'border border-white/8 bg-[#12151b] text-zinc-400 hover:text-white'
          }`}
        >
          <History className="h-3.5 w-3.5 text-violet-400" /> Audit Trail & Compliance ({auditLogs.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'audit' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4 text-xs">
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="h-5 w-5 text-violet-400 shrink-0" />
                <div>
                  <p className="font-bold text-white">Institutional Audit & Accreditation Record</p>
                  <p className="text-zinc-400">
                    Immutable chronological record of submissions, faculty scrutinies, authority escalations, and official remarks.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportCSV}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 font-bold text-white shadow-md hover:bg-violet-500 transition"
              >
                <Download className="h-3.5 w-3.5" /> Download CSV
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/8 bg-[#12151b]">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="border-b border-white/8 bg-[#0d1015] text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Digital Seal Hash</th>
                    <th className="px-4 py-3">Request ID & Student</th>
                    <th className="px-4 py-3">Action Type</th>
                    <th className="px-4 py-3">Actor & Role</th>
                    <th className="px-4 py-3">Stage / Status</th>
                    <th className="px-4 py-3">Official Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6 font-mono text-[11px]">
                  {auditLogs.map((entry, idx) => (
                    <tr key={`${entry.requestId}-${idx}`} className="hover:bg-white/[0.02] transition">
                      <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="rounded bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-300">
                          {entry.verificationHash}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-sans">
                        <div className="font-bold text-white">{entry.requestId}</div>
                        <div className="text-[11px] text-zinc-400">{entry.studentName} ({entry.studentRollNo})</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-sans">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            entry.action.includes('SANCTIONED') || entry.action.includes('APPROVED')
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : entry.action.includes('ESCALATED')
                                ? 'bg-amber-500/20 text-amber-300'
                                : entry.action.includes('REJECTED')
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : 'bg-violet-500/20 text-violet-300'
                          }`}
                        >
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-sans">
                        <div className="font-semibold text-zinc-200">{entry.actor}</div>
                        <div className="text-[10px] text-zinc-400">{entry.actorRole}</div>
                      </td>
                      <td className="px-4 py-3 font-sans whitespace-nowrap">
                        <div className="text-zinc-200">{entry.stage}</div>
                        <div className="text-[10px] text-zinc-400">{entry.status}</div>
                      </td>
                      <td className="px-4 py-3 font-sans text-zinc-300 max-w-xs truncate">
                        {entry.remarks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : visibleRequests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#12151b] p-12 text-center text-zinc-400">
            <Inbox className="mx-auto h-10 w-10 text-zinc-500 mb-2" />
            <p className="text-base font-semibold text-white">No requests in this view</p>
            <p className="mt-1 text-xs text-zinc-400">
              {activeTab === 'assigned'
                ? 'Great job! You have cleared all pending requests assigned to your desk.'
                : 'No requests match the selected filter or search query.'}
            </p>
          </div>
        ) : (
          <RequestTable requests={visibleRequests} detailRoutePrefix="/official/requests" />
        )}
      </div>
    </AppShell>
  )
}
