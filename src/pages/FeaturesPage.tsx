import { ArrowUpDown, BadgeCheck, FileText, MessageSquare, ShieldCheck, Sparkles, Zap } from 'lucide-react'

const features = [
  { icon: Sparkles, title: 'AI-assisted request writing', description: 'Turn a simple prompt into a structured, professional permission request.' },
  { icon: FileText, title: 'Request classification', description: 'Automatically identify event, workshop, leave, or other request categories.' },
  { icon: BadgeCheck, title: 'Information extraction', description: 'Collect date, participants, venue, budget, and supporting context from the request text.' },
  { icon: Zap, title: 'Missing information detection', description: 'Flag the fields that are still required before submission or approval.' },
  { icon: ArrowUpDown, title: 'Smart approval routing', description: 'Route each request to the correct authority based on request type and approval workflow.' },
  { icon: FileText, title: 'Attachment management', description: 'Keep all request documents attached to the same record throughout the approval chain.' },
  { icon: ShieldCheck, title: 'Role-based access', description: 'Control which officials can view a request and its attachments at each workflow stage.' },
  { icon: MessageSquare, title: 'Real-time status tracking', description: 'Students and officials can monitor the current stage and resulting action items.' },
  { icon: BadgeCheck, title: 'Notification system', description: 'Stay updated when requests are submitted, forwarded, or require changes.' },
  { icon: FileText, title: 'Digital permission letter', description: 'Generate and store a clean permission letter tied to the request record.' },
  { icon: BadgeCheck, title: 'Approval analytics', description: 'Monitor throughput, pending items, and processing trends over time.' },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#07090d] text-zinc-100">
      <header className="border-b border-white/8 bg-[#0b0d11]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500 text-xs font-black text-white">IA</div>
            <p className="font-bold text-white">IAN</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <section className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">Features</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-6xl">Everything needed to manage academic approvals.</h1>
        </section>

        <section className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border border-white/8 bg-[#12151b] p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300"><Icon className="h-5 w-5" /></div>
              <h2 className="text-xl font-semibold text-white">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
