import { ArrowRight, Paperclip } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ApprovalRequest } from '../../types'
import { StatusBadge } from './StatusBadge'

export function RequestCard({ request }: { request: ApprovalRequest }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-lg shadow-black/10 transition hover:border-amber-200">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-600">{request.id}</p>
          <h3 className="mt-2 text-xl font-semibold text-gray-900">{request.title}</h3>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <p>{request.category}</p>
        <p>{request.aiSummary}</p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-amber-200 pt-4">
        <span className="inline-flex items-center gap-2 text-sm text-gray-600">
          <Paperclip className="h-4 w-4" /> {request.documents.length} docs
        </span>
        <Link to={`/requests/${request.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-amber-600">
          View request <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

