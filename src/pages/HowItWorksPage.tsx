import { ArrowRight, CheckCircle2 } from 'lucide-react'

const steps = [
  { number: '01', title: 'Student submits', description: 'The student describes the request in natural language and attaches supporting files when needed.' },
  { number: '02', title: 'IAN understands', description: 'The request is classified and interpreted into structured fields for the approval process.' },
  { number: '03', title: 'AI structures the request', description: 'The AI identifies key details, missing information, and the expected approval route.' },
  { number: '04', title: 'Required information is identified', description: 'Fields like date, venue, participants, and coordinator information are highlighted if incomplete.' },
  { number: '05', title: 'Approval workflow is generated', description: 'A route is created based on the type of request and the governing department.' },
  { number: '06', title: 'Correct authority reviews', description: 'The request moves from Class Coordinator to Deputy HOD to HOD according to the workflow.' },
  { number: '07', title: 'Documents remain attached', description: 'All uploaded evidence stays attached to the same request through every approval stage.' },
  { number: '08', title: 'Request moves through approval levels', description: 'Each authority sees the same request, the same metadata, and the same supporting files.' },
  { number: '09', title: 'Student sees final decision', description: 'The student receives the final outcome with an auditable trail and status updates.' },
]

export default function HowItWorksPage() {
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
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">How It Works</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-6xl">A clear approval path from request to decision.</h1>
        </section>

        <section className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {steps.map(({ number, title, description }) => (
            <div key={number} className="rounded-2xl border border-white/8 bg-[#12151b] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">{number}</p>
              <h2 className="mt-3 text-xl font-semibold text-white">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
            </div>
          ))}
        </section>

        <section className="mt-20 rounded-2xl border border-white/8 bg-[#12151b] p-6">
          <h2 className="text-2xl font-semibold text-white">Example flow</h2>
          <div className="mt-8 flex flex-col items-center gap-3 md:flex-row md:justify-center md:flex-wrap">
            {['Student', 'Class Coordinator', 'Deputy HOD', 'HOD', 'Approved'].map((step, index, array) => (
              <div key={step} className="flex items-center gap-3">
                <div className="rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-200">{step}</div>
                {index < array.length - 1 && <ArrowRight className="h-4 w-4 text-zinc-500" />}
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-xl border border-white/8 bg-[#0d1015] p-4 text-sm text-zinc-300">
            <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" /><span>At every stage, the request remains the same record, with the same attachments, comments, and approval history.</span></div>
          </div>
        </section>
      </main>
    </div>
  )
}
