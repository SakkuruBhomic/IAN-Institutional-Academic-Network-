import { BellRing } from 'lucide-react'
import type { NotificationItem } from '../../types'

export function NotificationPanel({ items }: { items: NotificationItem[] }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-lg shadow-black/10">
      <div className="mb-4 flex items-center gap-2">
        <BellRing className="h-5 w-5 text-amber-600" />
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className={`rounded-lg border p-3 ${item.read ? 'border-amber-200 bg-amber-50/60' : 'border-amber-400/20 bg-amber-400/5'}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-gray-800">{item.title}</p>
              {!item.read && <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />}
            </div>
            <p className="mt-1 text-sm text-gray-600">{item.message}</p>
            <p className="mt-2 text-xs text-gray-700">{new Date(item.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

