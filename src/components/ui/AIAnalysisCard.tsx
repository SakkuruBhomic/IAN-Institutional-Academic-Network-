import { ArrowRight, CheckCircle2, Sparkles, TriangleAlert } from 'lucide-react'
import type { AIAnalysis } from '../../types'

export function AIAnalysisCard({ analysis }: { analysis: AIAnalysis }) {
  return (
    <div className="rounded-xl border border-violet-500/20 bg-[#11151d] p-5 shadow-lg shadow-black/10">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-violet-300">IAN AI</p>
            <h3 className="text-lg font-semibold text-white">AI Analysis</h3>
          </div>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">{analysis.confidence}% confidence</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(analysis.extractedData).map(([key, value]) => (
          <div key={key} className="rounded-lg border border-white/8 bg-[#0d1015] p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">{key}</p>
            <p className="mt-1 font-medium text-zinc-200">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-white/8 bg-[#0d1015] p-4">
        <p className="text-sm font-semibold text-white">AI Summary</p>
        <p className="mt-2 text-sm text-zinc-300">{analysis.summary}</p>
      </div>

      <div className="mt-5 flex flex-col gap-4 md:flex-row">
        <div className="flex-1 rounded-xl border border-white/8 bg-[#0d1015] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <TriangleAlert className="h-4 w-4 text-amber-400" /> Missing Information
          </div>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            {analysis.missingInformation.length ? analysis.missingInformation.map((item) => <li key={item}>• {item}</li>) : <li>• No critical missing information</li>}
          </ul>
        </div>

        <div className="flex-1 rounded-xl border border-white/8 bg-[#0d1015] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Suggested Workflow
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-zinc-200">
            {analysis.suggestedWorkflow.map((step, index) => (
              <span key={step} className="inline-flex items-center gap-2 rounded-full bg-[#12151b] px-2 py-1">
                {step}
                {index < analysis.suggestedWorkflow.length - 1 && <ArrowRight className="h-3 w-3 text-zinc-500" />}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

