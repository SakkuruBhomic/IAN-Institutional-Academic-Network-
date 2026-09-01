import { AppShell } from '../components/ui/AppShell'
import { WorkflowVisualizer } from '../components/ui/WorkflowVisualizer'

const workflows = [
  { name: 'Technical Event', steps: ['Student', 'Class Coordinator', 'Deputy HOD', 'HOD'] },
  { name: 'Simple Leave', steps: ['Student', 'Class Coordinator'] },
  { name: 'Large Event', steps: ['Student', 'Class Coordinator', 'Deputy HOD', 'HOD', 'Dean'] },
]

export default function AdminWorkflowPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-gray-900">Workflow Library</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {workflows.map((workflow) => (
          <div key={workflow.name} className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">{workflow.name}</h2>
            <div className="mt-5">
              <WorkflowVisualizer steps={workflow.steps} currentStep={workflow.steps.length - 1} />
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  )
}


