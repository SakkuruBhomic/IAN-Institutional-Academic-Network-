import { ArrowRight } from 'lucide-react'

interface WorkflowVisualizerProps {
  steps: string[]
  currentStep?: number
}

export function WorkflowVisualizer({ steps, currentStep = 0 }: WorkflowVisualizerProps) {
  return (
    <div className="rounded-xl border border-white/8 bg-[#11151d] p-5 shadow-lg shadow-black/10">
      <h3 className="text-lg font-semibold text-white">Approval Route</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {steps.map((step, index) => {
          const active = index <= currentStep
          return (
            <div key={step} className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium ${active ? 'bg-violet-500 text-white' : 'bg-[#12151b] text-zinc-400'}`}>
                {step}
              </span>
              {index < steps.length - 1 && <ArrowRight className="h-4 w-4 text-zinc-500" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

