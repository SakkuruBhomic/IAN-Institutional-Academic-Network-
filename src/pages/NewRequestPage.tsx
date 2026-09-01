import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  Edit3,
  FileCheck2,
  FileText,
  Lightbulb,
  Paperclip,
  RotateCcw,
  Send,
  Shield,
  Sparkles,
  Trash2,
  Upload,
  User,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/ui/AppShell'
import { useAppContext } from '../contexts/AppContext'
import { getStudentByRoll } from '../data/studentAccounts'
import { analyzeRequest, type RichAIAnalysis } from '../services/ai/analyzeRequest'
import { formatAttachmentSize, isSupportedAttachmentType, saveAttachment } from '../services/storage/attachmentStorage'
import type { ApprovalRequest, AttachmentItem } from '../types'

const presetPrompts = [
  {
    icon: '🏆',
    title: 'AI Hackathon at VIT',
    category: 'Hackathon',
    text: 'I want to organize a 2-day AI Hackathon for 120 participants in the Main Seminar Hall from 15th to 16th October. We need projectors, audio systems, and high-speed WiFi with a ₹12,000 budget.',
  },
  {
    icon: '⚡',
    title: 'Robotics Competition On-Duty',
    category: 'On-Duty Leave',
    text: 'I am requesting 3 days on-duty leave from 18th to 20th September to represent the college at the National Autonomous Robotics Championship at IIT Madras. Requesting attendance waiver.',
  },
  {
    icon: '🏢',
    title: 'Smart Grid Industrial Visit',
    category: 'Industrial Visit',
    text: 'We propose an industrial visit to the Smart Grid & Renewable Energy facility on 26th September for 45 students and 2 faculty coordinators. Transport and safety clearance requested.',
  },
  {
    icon: '🔬',
    title: 'Technical Workshop in Lab 2',
    category: 'Technical Workshop',
    text: 'Requesting permission to conduct a hands-on technical workshop on Deep Learning and GPU computing for 80 students in Lab 2 on 12th October.',
  },
  {
    icon: '🏥',
    title: 'Medical Leave Request',
    category: 'Medical Leave',
    text: 'Requesting medical leave for 4 days from 5th to 8th September due to viral fever and recovery under doctor advice. Medical prescription attached.',
  },
  {
    icon: '🎨',
    title: 'Cultural Club Activity',
    category: 'Club Activity',
    text: 'Requesting auditorium booking and sound equipment for our Annual Student Music & Coding showcase on 22nd October from 2:00 PM to 6:00 PM for 200 participants.',
  },
]

export default function NewRequestPage() {
  const navigate = useNavigate()
  const { addRequest, currentUser } = useAppContext()
  const studentMeta = currentUser?.rollNo ? getStudentByRoll(currentUser.rollNo) : null

  const coordinatorName =
    studentMeta?.assignedCoordinatorName ?? currentUser?.classCoordinator ?? 'Prof. Priya Nair'
  const coordinatorId = studentMeta?.assignedCoordinatorId ?? 'coordinator_cse_a'
  const deputyHODName =
    studentMeta?.assignedDeputyHODName ?? currentUser?.deputyHOD ?? 'Dr. Meenakshi Sundaram'
  const deputyHODId = studentMeta?.assignedDeputyHODId ?? 'deputyhod_cse'
  const hodName = studentMeta?.assignedHODName ?? 'Dr. A. P. Jayaram'

  const [step, setStep] = useState<1 | 2>(1)
  const [rawText, setRawText] = useState(
    'I want to conduct a coding competition for 120 students on 15 September in Block A. We need the seminar hall and projector. Estimated budget is ₹8,000.',
  )
  const [analysis, setAnalysis] = useState<RichAIAnalysis | null>(null)
  const [customLetter, setCustomLetter] = useState('')
  const [isEditingLetter, setIsEditingLetter] = useState(false)
  const [isAiProcessing, setIsAiProcessing] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [activeStyle, setActiveStyle] = useState<'balanced' | 'formal' | 'academic' | 'budget' | 'urgent'>('balanced')

  const runAIAnalysis = (input: string, style: 'balanced' | 'formal' | 'academic' | 'budget' | 'urgent' = activeStyle) => {
    setIsAiProcessing(true)
    setActiveStyle(style)
    setTimeout(() => {
      const result = analyzeRequest(input, currentUser, style)
      setAnalysis(result)
      setCustomLetter(result.generatedLetter)
      setIsAiProcessing(false)
    }, 200)
  }

  useEffect(() => {
    if (!analysis && rawText.trim()) {
      runAIAnalysis(rawText, 'balanced')
    }
  }, [])

  const handleApplyPreset = (presetText: string) => {
    setRawText(presetText)
    runAIAnalysis(presetText, 'balanced')
  }

  const handleProceedToReview = () => {
    runAIAnalysis(rawText, activeStyle)
    setStep(2)
  }

  const handleFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const incomingFiles = Array.from(event.target.files ?? [])
    const validFiles = incomingFiles.filter((file) => {
      if (isSupportedAttachmentType(file)) return true
      setUploadError('Unsupported file type. Please upload PDF, DOCX, PNG, or JPG.')
      return false
    })

    if (validFiles.length) {
      setSelectedFiles((prev) => [...prev, ...validFiles])
      setUploadError('')
    }
    event.target.value = ''
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const requestId = useMemo(() => {
    return `IAN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`
  }, [])

  const handleSubmit = async () => {
    if (!analysis || !currentUser) return

    const savedAttachments: AttachmentItem[] = []
    if (selectedFiles.length > 0) {
      savedAttachments.push(
        ...(await Promise.all(
          selectedFiles.map(async (file) =>
            saveAttachment(file, requestId, currentUser.name),
          ),
        )),
      )
    }

    const request: ApprovalRequest = {
      id: requestId,
      title: analysis.title,
      student: currentUser.name,
      studentRollNo: currentUser.rollNo,
      studentBranch: currentUser.branch,
      studentPhoto: currentUser.photo,
      category: analysis.category,
      description: rawText,
      aiSummary: analysis.summary,
      generatedLetter: customLetter || analysis.generatedLetter,
      status: 'Pending',
      currentStageIndex: 1,
      requestType: analysis.category,
      workflow: ['Student', 'Class Coordinator', 'Deputy HOD', 'HOD'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documents: [
        'Institutional_Letter.pdf',
        ...savedAttachments.map((a) => a.fileName),
      ],
      attachments: savedAttachments,
      comments: [
        {
          author: 'AI Copilot',
          role: 'system',
          text: `Request parsed & routed to designated Class Coordinator (${coordinatorName}). Confidence score: ${analysis.confidence}%.`,
          timestamp: new Date().toISOString(),
        },
      ],
      timeline: [
        { label: 'Student Submitted', timestamp: new Date().toISOString(), completed: true },
        { label: `Class Coordinator Review (${coordinatorName})`, timestamp: '', completed: false },
        { label: `Deputy HOD Review (${deputyHODName})`, timestamp: '', completed: false },
        { label: `HOD Review (${hodName})`, timestamp: '', completed: false },
      ],
      assignedCoordinatorId: coordinatorId,
      assignedCoordinatorName: coordinatorName,
      assignedDeputyHODId: deputyHODId,
      assignedDeputyHODName: deputyHODName,
      assignedHODName: hodName,
      urgency: analysis.urgency,
      studentEmail: currentUser.email,
    }

    addRequest(request)
    setSubmitted(true)
  }

  if (submitted && analysis) {
    return (
      <AppShell>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="max-w-xl rounded-3xl border border-emerald-500/30 bg-[#12151b] p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              AI Processing Complete
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white">Request Successfully Dispatched</h1>
            <p className="mt-3 text-sm text-zinc-300">
              Request ID <span className="font-semibold text-white">{requestId}</span> has been
              automatically routed to your assigned Class Coordinator:
            </p>

            <div className="mt-5 rounded-2xl border border-white/8 bg-[#0d1015] p-4 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-zinc-400">Next Approver</p>
                  <p className="text-base font-semibold text-white">{coordinatorName}</p>
                  <p className="text-xs text-violet-300">Class Coordinator Desk</p>
                </div>
                <div className="rounded-xl bg-violet-500/20 px-3 py-1 text-xs font-medium text-violet-200">
                  Step 1 of 3
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="rounded-xl border border-white/10 bg-[#0d1015] px-5 py-2.5 text-sm font-medium text-zinc-200 hover:bg-[#181c24] transition"
              >
                Return to Dashboard
              </button>
              <button
                type="button"
                onClick={() => navigate(`/requests/${requestId}`)}
                className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 transition"
              >
                Track Request Live
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => (step === 2 ? setStep(1) : navigate('/dashboard'))}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-[#12151b] text-zinc-300 hover:bg-[#181c24] transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 items-center gap-1 rounded-md bg-violet-500/20 px-2 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                <Sparkles className="h-3 w-3" /> AI Copilot
              </span>
              <span className="text-xs text-zinc-400">Step {step} of 2</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">
              {step === 1 ? 'AI Approval Request Studio' : 'Review & Confirm Submission'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs text-violet-200">
          <User className="h-4 w-4 text-violet-400 shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-violet-300/80">Assigned Coordinator</p>
            <p className="font-semibold text-white">{coordinatorName}</p>
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/8 bg-[#12151b] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-violet-400" />
                  <h2 className="text-base font-semibold text-white">Describe Your Request</h2>
                </div>
                <span className="text-xs text-zinc-400">Natural language parsed automatically</span>
              </div>

              <textarea
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value)
                  runAIAnalysis(e.target.value)
                }}
                placeholder="Explain what you need permission or approval for. Mention dates, venue, participants, budget, or event details in plain English..."
                rows={5}
                className="w-full rounded-xl border border-white/8 bg-[#0d1015] p-4 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition leading-relaxed"
              />

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-violet-400" /> AI Enhancement Mode:
                </span>
                <button
                  type="button"
                  onClick={() => runAIAnalysis(rawText, 'balanced')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    activeStyle === 'balanced'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'border border-white/8 bg-[#0d1015] text-zinc-400 hover:text-white'
                  }`}
                >
                  ✨ Standard Synthesis
                </button>
                <button
                  type="button"
                  onClick={() => runAIAnalysis(rawText, 'formal')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    activeStyle === 'formal'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'border border-white/8 bg-[#0d1015] text-zinc-400 hover:text-white'
                  }`}
                >
                  🏛️ Executive Formal
                </button>
                <button
                  type="button"
                  onClick={() => runAIAnalysis(rawText, 'academic')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    activeStyle === 'academic'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'border border-white/8 bg-[#0d1015] text-zinc-400 hover:text-white'
                  }`}
                >
                  📚 Academic Rationale
                </button>
                <button
                  type="button"
                  onClick={() => runAIAnalysis(rawText, 'urgent')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    activeStyle === 'urgent'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                  }`}
                >
                  ⚡ Expedited Sanction
                </button>
              </div>

              <div className="mt-6 border-t border-white/8 pt-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Quick Query Templates:
                </p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {presetPrompts.map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => handleApplyPreset(preset.text)}
                      className="flex items-start gap-2.5 rounded-xl border border-white/6 bg-[#0d1015] p-3 text-left hover:border-violet-500/40 hover:bg-[#141820] transition group"
                    >
                      <span className="text-lg">{preset.icon}</span>
                      <div>
                        <p className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                          {preset.title}
                        </p>
                        <p className="text-[11px] text-zinc-400 line-clamp-1">{preset.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-[#12151b] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-violet-400" />
                  <h3 className="text-sm font-semibold text-white">Supporting Documents (Optional)</h3>
                </div>
                <span className="text-xs text-zinc-400">PDF, DOCX, PNG up to 10MB</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFilesSelected}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-xl border border-dashed border-white/12 bg-[#0d1015] p-4 text-center hover:border-violet-500/50 hover:bg-[#121620] transition"
              >
                <Upload className="mx-auto h-6 w-6 text-zinc-400" />
                <p className="mt-1 text-xs font-medium text-zinc-200">
                  Click to attach invitation letters, brochures, or receipts
                </p>
              </div>

              {uploadError && <p className="mt-2 text-xs text-rose-400">{uploadError}</p>}

              {selectedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {selectedFiles.map((file, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      className="flex items-center justify-between rounded-xl border border-white/8 bg-[#0d1015] px-3 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2 text-zinc-200">
                        <FileText className="h-4 w-4 text-violet-400" />
                        <span className="font-medium">{file.name}</span>
                        <span className="text-zinc-500">({formatAttachmentSize(file.size)})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="text-zinc-400 hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {analysis && (
              <div className="rounded-2xl border border-white/8 bg-[#12151b] p-5 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-white/8 pb-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400">Detected Category</span>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {analysis.category}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          analysis.urgency === 'Urgent'
                            ? 'bg-rose-500/20 text-rose-300'
                            : analysis.urgency === 'High'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {analysis.urgency} Priority
                      </span>
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400">AI Confidence</span>
                    <p className="text-lg font-black text-emerald-400">{analysis.confidence}%</p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Extracted Request Metadata:
                  </p>
                  <div className="grid gap-2 text-xs">
                    {Object.entries(analysis.extractedData).map(([key, val]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-lg border border-white/6 bg-[#0d1015] px-3 py-2"
                      >
                        <span className="text-zinc-400">{key}</span>
                        <span className="font-semibold text-zinc-200 text-right">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-3.5 text-xs text-violet-200">
                  <p className="font-semibold text-violet-100 flex items-center gap-1.5 mb-2">
                    <Shield className="h-4 w-4 text-violet-400" /> Automated Approval Chain:
                  </p>
                  <div className="space-y-1.5 text-zinc-300">
                    <div className="flex items-center justify-between">
                      <span>1. Student Submission:</span>
                      <span className="text-white font-medium">{currentUser?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>2. Class Coordinator:</span>
                      <span className="text-emerald-300 font-semibold">{coordinatorName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>3. Deputy HOD:</span>
                      <span className="text-amber-300 font-medium">{deputyHODName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>4. Final Authority:</span>
                      <span className="text-sky-300 font-medium">{hodName}</span>
                    </div>
                  </div>
                </div>

                {analysis.recommendations.length > 0 && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200 space-y-1">
                    <p className="font-semibold text-amber-100 flex items-center gap-1">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-400" /> AI Insights:
                    </p>
                    {analysis.recommendations.map((rec, i) => (
                      <p key={i} className="text-amber-200/80">
                        • {rec}
                      </p>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleProceedToReview}
                  disabled={isAiProcessing || !rawText.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 transition disabled:opacity-50"
                >
                  Proceed to Review & Generated Letter <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 2 && analysis && (
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-2xl border border-white/8 bg-[#12151b] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-white/8 pb-4">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-violet-400" />
                <div>
                  <h2 className="text-lg font-bold text-white">Institutional Permission Letter</h2>
                  <p className="text-xs text-zinc-400">
                    Generated for {coordinatorName} ({studentMeta?.department ?? currentUser?.branch})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingLetter(!isEditingLetter)}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0d1015] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white transition"
              >
                <Edit3 className="h-3.5 w-3.5" />
                {isEditingLetter ? 'Done Editing' : 'Edit Letter'}
              </button>
            </div>

            {isEditingLetter ? (
              <textarea
                value={customLetter}
                onChange={(e) => setCustomLetter(e.target.value)}
                rows={16}
                className="w-full rounded-xl border border-white/10 bg-[#0d1015] p-4 text-sm font-mono text-zinc-200 outline-none focus:border-violet-500 leading-relaxed"
              />
            ) : (
              <div className="whitespace-pre-line rounded-xl border border-white/6 bg-[#0d1015] p-5 text-sm font-sans leading-relaxed text-zinc-200 shadow-inner">
                {customLetter}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-white/8 bg-[#12151b] p-5 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-white">Submission Summary</h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/6">
                  <span className="text-zinc-400">Student:</span>
                  <span className="font-semibold text-white">{currentUser?.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/6">
                  <span className="text-zinc-400">Roll Number:</span>
                  <span className="font-semibold text-white">{currentUser?.rollNo}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/6">
                  <span className="text-zinc-400">Assigned Coordinator:</span>
                  <span className="font-semibold text-emerald-300">{coordinatorName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/6">
                  <span className="text-zinc-400">Deputy HOD:</span>
                  <span className="font-semibold text-amber-300">{deputyHODName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/6">
                  <span className="text-zinc-400">HOD:</span>
                  <span className="font-semibold text-sky-300">{hodName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/6">
                  <span className="text-zinc-400">Attachments:</span>
                  <span className="font-semibold text-white">
                    {selectedFiles.length > 0
                      ? `${selectedFiles.length} file(s)`
                      : 'None (Letter only)'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition"
                >
                  <Send className="h-4 w-4" /> Send to {coordinatorName}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/8 bg-transparent py-2 text-xs font-medium text-zinc-400 hover:text-white transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Back to Edit Query
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}


