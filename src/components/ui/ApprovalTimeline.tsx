import type { TimelineItem } from '../../types'

export function ApprovalTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-lg shadow-black/10">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Approval Timeline</h3>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={`${item.label}-${index}`} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${item.completed ? 'border-emerald-400 bg-emerald-400' : 'border-amber-200 bg-white'}`}>
                {item.completed ? <span className="h-2.5 w-2.5 rounded-full bg-white" /> : null}
              </div>
              {index < items.length - 1 && <div className="mt-2 h-8 w-px bg-slate-700" />}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-800">{item.label}</div>
              {item.timestamp ? <div className="mt-1 text-xs text-gray-600">{new Date(item.timestamp).toLocaleString()}</div> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

