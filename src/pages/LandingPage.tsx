import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  FileText,
  GraduationCap,
  History,
  Lock,
  Route,
  Shield,
  ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import TypewriterText from '../components/TypewriterText'

const workflowSteps = [
  {
    step: '01',
    role: 'Student Submission',
    title: 'Digital Query & Letter Draft',
    description: 'Students submit OD requests, event permissions, or leave applications with automated formal letter generation.',
  },
  {
    step: '02',
    role: 'Class Coordinator',
    title: 'Initial Scrutiny & Validation',
    description: 'Class Coordinators verify academic eligibility, attendance records, and grant immediate approval or forward upwards.',
  },
  {
    step: '03',
    role: 'Deputy HOD',
    title: 'Departmental Review',
    description: 'Deputy HOD assesses budget, inter-departmental impact, and sanctions medium-tier escalations.',
  },
  {
    step: '04',
    role: 'Head of Department',
    title: 'Final Institutional Sanction',
    description: 'HOD grants final institutional authorization with complete digital audit trails and immutable records.',
  },
]

const institutionalFeatures = [
  {
    icon: Route,
    title: 'Multi-Tier Authority Routing',
    text: 'Role-based hierarchical review that routes queries directly to assigned Class Coordinators, Deputy HODs, and HODs.',
  },
  {
    icon: FileCheck2,
    title: 'Institutional Letter Generation',
    text: 'Automatically drafts standardized academic permission letters formatted with student roll numbers, event dates, and agendas.',
  },
  {
    icon: ShieldCheck,
    title: 'Strict Authority Scrutiny',
    text: 'Officials can grant direct approval within their jurisdiction or forward higher-budget queries with reviewer remarks.',
  },
  {
    icon: History,
    title: 'Immutable Audit Trail',
    text: 'Every status transition, timestamp, remark, and official signature is preserved for institutional accreditation and review.',
  },
  {
    icon: Lock,
    title: 'Departmental Isolation',
    text: 'Dedicated review desks for Computer Science, AI & Data Science, Electronics, and Mechanical Engineering.',
  },
  {
    icon: FileText,
    title: 'Document & Receipt Repository',
    text: 'Secure upload and verification of event invitations, registration receipts, brochures, and medical certificates.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#07090d] text-zinc-100 selection:bg-violet-500/30">
      {/* Institutional Top Header */}
      <header className="sticky top-0 z-30 border-b border-white/8 bg-[#0b0d11]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-xs font-black text-white shadow-lg shadow-violet-600/30 group-hover:scale-105 transition">
              IAN
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                IAN Portal
                <span className="rounded-full bg-violet-500/20 border border-violet-500/30 px-2 py-0.2 text-[9px] font-bold text-violet-300 uppercase tracking-wider">
                  Enterprise
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-400">
                Institutional Academic Network
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-wider text-zinc-300 md:flex">
            <a href="#workflow" className="transition hover:text-white">Workflow Hierarchy</a>
            <a href="#features" className="transition hover:text-white">Governance Features</a>
            <a href="#departments" className="transition hover:text-white">Department Desks</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 transition active:scale-95"
            >
              Sign In to Portal <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center overflow-hidden px-5 py-20 md:px-8 md:py-28">
          {/* Subtle Ambient Radial Glow */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />
          </div>

          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1 text-xs font-semibold text-violet-300">
              <Shield className="h-3.5 w-3.5 text-violet-400" />
              <span>Official Academic Workflow & Approval System</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl leading-[1.15]">
              Institutional Permission & Approval Governance,
              <span className="block mt-2 bg-gradient-to-r from-violet-300 via-purple-200 to-indigo-300 bg-clip-text text-transparent">
                <TypewriterText
                  phrases={[
                    'Structured & Paperless.',
                    'Direct Multi-Tier Routing.',
                    'Transparent & Auditable.',
                    'Zero Administrative Delay.',
                  ]}
                  typingSpeed={50}
                  deletingSpeed={30}
                  pauseDuration={2000}
                  loop={true}
                />
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-sm md:text-base leading-relaxed text-zinc-400">
              A unified digital administration portal for On-Duty (OD) permissions, hackathon travel sanctions, industrial visits, and medical leave across university departments.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                to="/login"
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-violet-600/30 hover:bg-violet-500 transition active:scale-95"
              >
                Access Approval Portal <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#workflow"
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#12151b] px-6 py-3.5 text-sm font-semibold text-zinc-200 hover:bg-[#181c24] hover:text-white transition"
              >
                View Approval Hierarchy
              </a>
            </div>

            {/* Key Metrics Strip */}
            <div className="mt-14 grid grid-cols-2 gap-4 border-t border-white/8 pt-8 sm:grid-cols-4 text-left">
              <div className="rounded-xl border border-white/6 bg-[#0d1015] p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Escalation Protocol</p>
                <p className="mt-1 text-lg font-bold text-white">3-Tier Hierarchy</p>
                <p className="text-[11px] text-violet-300">Coordinator → Deputy HOD → HOD</p>
              </div>
              <div className="rounded-xl border border-white/6 bg-[#0d1015] p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Compliance</p>
                <p className="mt-1 text-lg font-bold text-emerald-400">100% Auditable</p>
                <p className="text-[11px] text-zinc-400">Timestamped Remarks</p>
              </div>
              <div className="rounded-xl border border-white/6 bg-[#0d1015] p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Letter Standard</p>
                <p className="mt-1 text-lg font-bold text-white">Auto-Drafted</p>
                <p className="text-[11px] text-violet-300">Institutional Format</p>
              </div>
              <div className="rounded-xl border border-white/6 bg-[#0d1015] p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Turnaround</p>
                <p className="mt-1 text-lg font-bold text-sky-400">Same-Day Action</p>
                <p className="text-[11px] text-zinc-400">Live Stage Tracker</p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Hierarchy Section */}
        <section id="workflow" className="border-t border-white/8 bg-[#0a0c10] py-20 px-5 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-400">Governance Architecture</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Structured Multi-Tier Academic Approval Chain
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Each submission follows an orderly escalation hierarchy where reviewers act within defined authority boundaries.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {workflowSteps.map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-white/8 bg-[#12151b] p-6 flex flex-col justify-between hover:border-violet-500/40 transition group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-black tracking-widest text-violet-400">{item.step}</span>
                      <span className="rounded-md bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-300">
                        {item.role}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/6 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Direct Authority Sanction
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-5 md:px-8 max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-400">Institutional Capabilities</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Enterprise Governance & Security
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Eliminate paper circulars and lost permission slips with verified digital accountability.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {institutionalFeatures.map((feat) => {
              const Icon = feat.icon
              return (
                <div
                  key={feat.title}
                  className="rounded-2xl border border-white/8 bg-[#12151b] p-6 hover:border-violet-500/40 transition"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-xs leading-relaxed text-zinc-400">{feat.text}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Department Desks */}
        <section id="departments" className="border-t border-white/8 bg-[#0a0c10] py-20 px-5 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-3xl border border-white/8 bg-[#12151b] p-6 md:p-10">
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 mb-4">
                    <GraduationCap className="h-3.5 w-3.5" /> Departmental Specialization
                  </div>
                  <h2 className="text-2xl font-bold text-white md:text-4xl tracking-tight">
                    Dedicated Faculty Desks Across Disciplines
                  </h2>
                  <p className="mt-3 text-xs md:text-sm text-zinc-400 leading-relaxed">
                    Queries are automatically segregated by faculty department and section, ensuring students are directly connected to their designated Class Coordinator and Deputy HOD.
                  </p>

                  <div className="mt-6 space-y-2.5">
                    <div className="flex items-center gap-3 text-xs text-zinc-300">
                      <span className="h-2 w-2 rounded-full bg-violet-400" />
                      <span>Computer Science & Engineering (Sections A, B, C)</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-300">
                      <span className="h-2 w-2 rounded-full bg-violet-400" />
                      <span>Artificial Intelligence & Data Science</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-300">
                      <span className="h-2 w-2 rounded-full bg-violet-400" />
                      <span>Electronics & Communication Engineering</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-300">
                      <span className="h-2 w-2 rounded-full bg-violet-400" />
                      <span>Mechanical Engineering</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-[#0d1015] p-5 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Live Review Pipeline Status</p>
                  <div className="flex items-center justify-between rounded-xl border border-white/6 bg-[#12151b] p-3 text-xs">
                    <span className="text-zinc-300 font-medium">1. Student Query Letter</span>
                    <span className="text-emerald-300 font-semibold">✓ Auto-Drafted</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/6 bg-[#12151b] p-3 text-xs">
                    <span className="text-zinc-300 font-medium">2. Class Coordinator Desk</span>
                    <span className="text-emerald-300 font-semibold">✓ Authority / Forward</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/6 bg-[#12151b] p-3 text-xs">
                    <span className="text-zinc-300 font-medium">3. Deputy HOD Review</span>
                    <span className="text-amber-300 font-semibold">● In Progress</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/6 bg-[#12151b] p-3 text-xs">
                    <span className="text-zinc-300 font-medium">4. HOD Final Sanction</span>
                    <span className="text-sky-300 font-semibold">○ Scheduled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 text-center">
          <div className="rounded-3xl border border-violet-500/30 bg-gradient-to-b from-violet-900/20 to-[#10131a] p-8 md:p-14">
            <h2 className="text-2xl font-bold text-white md:text-4xl tracking-tight">
              Ready to submit or review academic requests?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-xs md:text-sm text-zinc-400">
              Sign in with your institutional credentials to experience paperless, structured academic governance.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-violet-600/30 hover:bg-violet-500 transition"
              >
                Sign In to Portal <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/8 bg-[#0b0d11] text-zinc-400 py-8 px-5 md:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-[10px] font-black text-white">
              IAN
            </div>
            <span className="font-semibold text-white">IAN System</span>
            <span className="text-zinc-500">| Institutional Academic Governance Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#workflow" className="hover:text-white transition">Hierarchy</a>
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#departments" className="hover:text-white transition">Departments</a>
            <Link to="/login" className="hover:text-white transition">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
