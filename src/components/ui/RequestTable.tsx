import { Eye, UserCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ApprovalRequest } from '../../types'
import { StatusBadge } from './StatusBadge'

export function RequestTable({
  requests,
  detailRoutePrefix = '/requests',
}: {
  requests: ApprovalRequest[]
  detailRoutePrefix?: string
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#12151b] shadow-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/8 text-left">
          <thead className="bg-[#0d1015]/80">
            <tr>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Request Details
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Student
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Category
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Assigned Desk
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Status
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6">
            {requests.map((request) => (
              <tr key={request.id} className="transition-colors hover:bg-white/[0.03]">
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-violet-300">
                        {request.id}
                      </span>
                      {request.urgency && (
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            request.urgency === 'Urgent'
                              ? 'bg-rose-500/20 text-rose-300'
                              : request.urgency === 'High'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {request.urgency}
                        </span>
                      )}
                    </div>
                    <span className="mt-1 font-medium text-white line-clamp-1">{request.title}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-zinc-300">
                  <div className="font-medium text-white">{request.student}</div>
                  <div className="text-xs text-zinc-400">{request.studentRollNo}</div>
                </td>
                <td className="px-4 py-4 text-xs font-medium text-zinc-300">{request.category}</td>
                <td className="px-4 py-4 text-xs">
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="font-medium">
                      {request.assignedCoordinatorName || 'Class Coordinator'}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    {request.workflow[request.currentStageIndex] || 'In Review'}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={request.status} />
                </td>
                <td className="px-4 py-4 text-right">
                  <Link
                    to={`${detailRoutePrefix}/${request.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 active:scale-95 transition"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


