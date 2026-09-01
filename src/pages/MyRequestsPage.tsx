import { Filter, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AppShell } from '../components/ui/AppShell'
import { RequestCard } from '../components/ui/RequestCard'
import { useAppContext } from '../contexts/AppContext'

const filters = ['All', 'Pending', 'Approved', 'Rejected', 'Changes Requested'] as const

export default function MyRequestsPage() {
  const { requests } = useAppContext()
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>('All')

  const visibleRequests = useMemo(() => {
    if (activeFilter === 'All') return requests
    return requests.filter((request) => request.status === activeFilter)
  }, [activeFilter, requests])

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">My Requests</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-gray-900">Request tracker</h1>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-gray-600">
          <Search className="h-4 w-4" />
          <input aria-label="Search my requests" className="w-40 border-0 bg-transparent outline-none placeholder:text-gray-600" placeholder="Search" />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-3 py-2 text-sm font-medium transition ${activeFilter === filter ? 'bg-white text-gray-900' : 'border border-amber-200 bg-white text-gray-700 hover:border-amber-200'}`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {visibleRequests.length ? visibleRequests.map((request) => <RequestCard key={request.id} request={request} />) : (
          <div className="rounded-2xl border border-dashed border-amber-200 bg-white p-8 text-center text-gray-700 lg:col-span-2">
            <Filter className="mx-auto h-8 w-8 text-gray-600" />
            <p className="mt-3 text-lg font-medium">No requests match this filter.</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}


