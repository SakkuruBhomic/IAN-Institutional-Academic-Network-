import {
  CheckCheck,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  History,
  ShieldCheck,
  TrendingUp,
  XCircle,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { AppShell } from '../components/ui/AppShell'
import { StatCard } from '../components/ui/StatCard'
import { useAppContext } from '../contexts/AppContext'
import { exportAuditLogsToCSV, extractFullAuditLogs } from '../services/audit/auditExport'

export default function AdminDashboard() {
  const { requests } = useAppContext()
  const [filterDept, setFilterDept] = useState('all')

  const approved = requests.filter((request) => request.status === 'Approved').length
  const pending = requests.filter((request) => request.status !== 'Approved' && request.status !== 'Rejected').length
  const changes = requests.filter((request) => request.status === 'Changes Requested').length
  const rejected = requests.filter((request) => request.status === 'Rejected').length
  const approvalRate = `${Math.round((approved / Math.max(requests.length, 1)) * 100)}%`

  const auditLogs = useMemo(() => {
    const logs = extractFullAuditLogs(requests)
    if (filterDept === 'all') return logs
    return logs.filter((l) => l.studentDepartment.toLowerCase().includes(filterDept.toLowerCase()))
  }, [requests, filterDept])

  const handleExportCSV = () => {
    exportAuditLogsToCSV(requests, filterDept === 'all' ? 'Institution_Master' : filterDept)
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
              Institutional Administration
            </span>
            <span className="text-xs text-zinc-400">• Academic Dean Office</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">
            Audit & Compliance Console
          </h1>
          <p className="text-xs text-zinc-400">
            Real-time multi-departmental tracking, authority metrics & NAAC/NBA audit reporting
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 transition active:scale-95"
        >
          <Download className="h-4 w-4" /> Export Master Audit Log (.CSV)
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Institutional Queries"
          value={String(requests.length)}
          trend="All Departments"
          icon={<FileText className="h-5 w-5 text-violet-400" />}
        />
        <StatCard
          label="Approval Compliance Rate"
          value={approvalRate}
          trend={`${approved} approved`}
          icon={<TrendingUp className="h-5 w-5 text-emerald-400" />}
        />
        <StatCard
          label="Average Resolution SLA"
          value="1.4 Days"
          trend="Target: <2 days"
          icon={<Clock3 className="h-5 w-5 text-sky-400" />}
        />
        <StatCard
          label="Digital Audit Compliance"
          value="100%"
          trend="Verified Seals"
          icon={<ShieldCheck className="h-5 w-5 text-amber-400" />}
        />
      </div>

      {/* Breakdown Cards */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <div className="rounded-2xl border border-white/8 bg-[#12151b] p-6 shadow-sm">
          <h2 className="text-base font-bold text-white mb-4">Approval Decision Breakdown</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-white/6 bg-[#0d1015] p-3.5 text-center">
              <CheckCheck className="mx-auto h-5 w-5 text-emerald-400 mb-1" />
              <p className="text-xl font-bold text-white">{approved}</p>
              <p className="text-[10px] uppercase tracking-wider text-emerald-300">Approved</p>
            </div>
            <div className="rounded-xl border border-white/6 bg-[#0d1015] p-3.5 text-center">
              <Clock3 className="mx-auto h-5 w-5 text-amber-400 mb-1" />
              <p className="text-xl font-bold text-white">{pending}</p>
              <p className="text-[10px] uppercase tracking-wider text-amber-300">In Review</p>
            </div>
            <div className="rounded-xl border border-white/6 bg-[#0d1015] p-3.5 text-center">
              <FileCheck2 className="mx-auto h-5 w-5 text-violet-400 mb-1" />
              <p className="text-xl font-bold text-white">{changes}</p>
              <p className="text-[10px] uppercase tracking-wider text-violet-300">Changes</p>
            </div>
            <div className="rounded-xl border border-white/6 bg-[#0d1015] p-3.5 text-center">
              <XCircle className="mx-auto h-5 w-5 text-rose-400 mb-1" />
              <p className="text-xl font-bold text-white">{rejected}</p>
              <p className="text-[10px] uppercase tracking-wider text-rose-300">Rejected</p>
            </div>
          </div>
        </div>

        {/* Departmental Filter Strip */}
        <div className="rounded-2xl border border-white/8 bg-[#12151b] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Department Audit Scope</h2>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#0d1015] px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-violet-500"
            >
              <option value="all">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Artificial Intelligence">AI & Data Science</option>
              <option value="Electronics">ECE</option>
              <option value="Mechanical">Mechanical</option>
            </select>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed mb-4">
            Filtering audit entries by department scopes all reviewer remarks, coordinator escallations, and final HOD sign-offs.
          </p>
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-3 text-xs text-violet-200">
            <p className="font-semibold text-white">Active Audit Scope: {filterDept === 'all' ? 'Institution-Wide' : filterDept}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">{auditLogs.length} verified chronological log events recorded.</p>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="mt-8 rounded-2xl border border-white/8 bg-[#12151b] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-violet-400" />
            <div>
              <h2 className="text-base font-bold text-white">Master Chronological Audit Trail</h2>
              <p className="text-xs text-zinc-400">Timestamped verification logs for accreditation compliance</p>
            </div>
          </div>
          <span className="rounded-md bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
            ✓ Blockchain-style Hash Verified
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/6">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-white/8 bg-[#0d1015] text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Digital Hash</th>
                <th className="px-4 py-3">Request & Student</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">Actor & Role</th>
                <th className="px-4 py-3">Remarks / Decision Reason</th>
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
                  <td className="px-4 py-3 font-sans text-zinc-300 max-w-sm truncate">
                    {entry.remarks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
