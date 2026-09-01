import type { RequestStatus } from '../../types'

const statusStyles: Record<RequestStatus, string> = {
  Submitted: 'bg-amber-100 text-gray-700',
  'Coordinator Approved': 'bg-amber-400/10 text-amber-600',
  'Waiting for Deputy HOD': 'bg-amber-400/10 text-amber-300',
  'HOD Review': 'bg-sky-400/10 text-sky-300',
  Approved: 'bg-emerald-400/10 text-emerald-300',
  'Changes Requested': 'bg-amber-400/10 text-amber-300',
  Rejected: 'bg-rose-400/10 text-rose-300',
  Pending: 'bg-amber-400/10 text-amber-300',
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}>
      {status}
    </span>
  )
}

