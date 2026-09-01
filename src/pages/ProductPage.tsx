import { ArrowRight, CheckCircle2, FileText, Route, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const problem = [
  'Manual letters and repeated campus visits',
  'Unclear status updates across teams',
  'Scattered supporting documents and approvals',
  'Slow, inconsistent academic request handling',
]

const solution = [
  'Digital request submission with natural-language capture',
  'AI-assisted classification and extracted details',
  'Workflow routing across student, coordinator, HOD, and admin layers',
  'Centralized attachments and transparent tracking',
]

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-[#07090d] text-zinc-100">
      <header className="border-b border-white/8 bg-[#0b0d11]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500 text-xs font-black text-white">IA</div>
            <div>
              <p className="font-bold text-white">IAN</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-zinc-300 md:flex">
            <Link to="/product" className="text-white">Product</Link>
            <Link to="/how-it-works" className="hover:text-white">How It Works</Link>
            <Link to="/features" className="hover:text-white">Features</Link>
            <Link to="/login" className="inline-flex items-center gap-2 rounded-lg bg-violet-500 px-3 py-2 font-medium text-white">Sign In <ArrowRight className="h-4 w-4" /></Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">Product</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-6xl">A modern approval system for academic requests.</h1>
            <p className="mt-5 max-w-xl text-lg text-zinc-400">IAN removes the friction from permission requests by turning verbal needs into structured, tracked, and auditable approvals.</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-[#12151b] p-6">
            <div className="space-y-4">
              <div className="rounded-xl border border-white/8 bg-[#0d1015] p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">Current challenge</p>
                <p className="mt-2 text-xl font-semibold text-white">Requests move across departments manually</p>
              </div>
              <div className="rounded-xl border border-violet-500/25 bg-violet-500/8 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-violet-300">IAN approach</p>
                <p className="mt-2 text-xl font-semibold text-white">AI, routing, and approvals in one place</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-[#12151b] p-6">
            <div className="mb-4 flex items-center gap-3 text-violet-300"><FileText className="h-5 w-5" /><h2 className="text-2xl font-semibold text-white">The Problem</h2></div>
            <ul className="space-y-3 text-zinc-300">
              {problem.map((item) => (
                <li key={item} className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" /> <span>{item}</span></li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/8 bg-[#12151b] p-6">
            <div className="mb-4 flex items-center gap-3 text-violet-300"><Route className="h-5 w-5" /><h2 className="text-2xl font-semibold text-white">The Solution</h2></div>
            <ul className="space-y-3 text-zinc-300">
              {solution.map((item) => (
                <li key={item} className="flex items-start gap-3"><Sparkles className="mt-0.5 h-4 w-4 text-violet-300" /> <span>{item}</span></li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-20 rounded-2xl border border-white/8 bg-[#12151b] p-6">
          <div className="mb-6 flex items-center gap-3 text-violet-300"><ShieldCheck className="h-5 w-5" /><h2 className="text-2xl font-semibold text-white">Architecture overview</h2></div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-white/8 bg-[#0d1015] p-4"><p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">01</p><p className="mt-2 text-lg font-semibold text-white">Student submission</p></div>
            <div className="rounded-xl border border-white/8 bg-[#0d1015] p-4"><p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">02</p><p className="mt-2 text-lg font-semibold text-white">AI-first classification</p></div>
            <div className="rounded-xl border border-white/8 bg-[#0d1015] p-4"><p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">03</p><p className="mt-2 text-lg font-semibold text-white">Routing and approvals</p></div>
          </div>
        </section>
      </main>
    </div>
  )
}
