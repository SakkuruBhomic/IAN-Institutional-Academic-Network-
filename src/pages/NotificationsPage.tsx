import { Bell, CheckCheck, Info, TriangleAlert } from 'lucide-react'
import { useAppContext } from '../contexts/AppContext'
import { AppShell } from '../components/ui/AppShell'

export default function NotificationsPage() {
  const { notifications, markNotificationRead } = useAppContext()

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Inbox</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-gray-900">Notifications</h1>
      </div>

      <div className="space-y-4">
        {notifications.map((item) => {
          const iconMap = {
            success: <CheckCheck className="h-4 w-4 text-emerald-600" />,
            warning: <TriangleAlert className="h-4 w-4 text-amber-600" />,
            info: <Info className="h-4 w-4 text-sky-600" />,
          }

          return (
            <div key={item.id} className={`rounded-2xl border p-4 shadow-sm ${item.read ? 'border-amber-200 bg-white' : 'border-sky-200 bg-sky-50'}`}>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-gray-700">
                  {iconMap[item.type]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    {!item.read && <button type="button" onClick={() => markNotificationRead(item.id)} className="text-xs font-medium text-sky-700">Mark read</button>}
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{item.message}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                    <Bell className="h-3.5 w-3.5" />
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </AppShell>
  )
}


