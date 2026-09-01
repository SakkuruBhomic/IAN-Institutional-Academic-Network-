import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  trend?: string
  icon: ReactNode
}

export function StatCard({ label, value, trend, icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-amber-200">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-600">
          {icon}
        </div>
        {trend && <span className="text-xs font-medium text-emerald-300">{trend}</span>}
      </div>
      <p className="text-sm text-gray-600">{label}</p>
      <h3 className="mt-2 text-3xl font-bold text-gray-900">{value}</h3>
    </div>
  )
}

