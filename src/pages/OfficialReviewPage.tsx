import {
  ArrowRight,
  Check,
  Download,
  FileText,
  Info,
  MessageSquareText,
  Paperclip,
  ShieldCheck,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/ui/AppShell'
import { ApprovalTimeline } from '../components/ui/ApprovalTimeline'
import { StatusBadge } from '../components/ui/StatusBadge'
import { useAppContext } from '../contexts/AppContext'
import { analyzeRequest } from '../services/ai/analyzeRequest'
import { uiRoleToWorkflowRole } from '../services/requestVisibility'
import { formatAttachmentSize, getAttachment } from '../services/storage/attachmentStorage'

export default function OfficialReviewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { requests, updateRequest, currentRole } = useAppContext()
  const request = requests.find((item) => item.id === id)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState(false)

  if (!request) {
    return (
      <AppShell>
        <div className="rounded-2xl border border-white/8 bg-[#12151b] p-8 text-white">Request not found</div>
      </AppShell>
    )
  }

  const workflowRole = uiRoleToWorkflowRole(currentRole)
  const isCurrentApprover =
    currentRole === 'admin' ||
    request.workflow[request.currentStageIndex] === workflowRole ||
    (currentRole === 'classCoordinator' && (request.currentStageIndex === 1 || request.status === 'Pending' || request.status === 'Submitted')) ||
    (currentRole === 'deputyHOD' && (request.currentStageIndex === 2 || request.status === 'Waiting for Deputy HOD')) ||
    (currentRole === 'HOD' && (request.currentStageIndex === 3 || request.status === 'HOD Review'))
  const isFinalized = request.status === 'Approved' || request.status === 'Rejected'

  const handleDownload = async (storageKey: string, fileName: string) => {
    const blob = await getAttachment(storageKey)
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleDecision = (decision: 'approve' | 'forward' | 'changes' | 'reject') => {
    if ((decision === 'changes' || decision === 'reject') && !reason.trim()) {
      setReasonError(true)
      return
    }
    setReasonError(false)

    const updatedRequest = { ...request }
    const now = new Date().toISOString()
    const authorName =
      currentRole === 'classCoordinator'
        ? 'Class Coordinator'
        : currentRole === 'deputyHOD'
          ? 'Deputy HOD'
          : currentRole === 'HOD'
            ? 'HOD'
            : 'Admin'

    if (decision === 'approve') {
      // Direct approval: Approver has sufficient authority to grant approval directly
      updatedRequest.status = 'Approved'
      updatedRequest.currentStageIndex = request.workflow.length
      updatedRequest.updatedAt = now
      updatedRequest.timeline = updatedRequest.timeline.map((item, index) => {
        if (index <= request.currentStageIndex) {
          return {
            ...item,
            completed: true,
            timestamp: item.timestamp || now,
          }
        }
        return {
          ...item,
          completed: true,
          timestamp: item.timestamp || now,
        }
      })

      const approvalComment =
        currentRole === 'classCoordinator'
          ? reason.trim()
            ? `Approved by Class Coordinator: ${reason.trim()}`
            : 'Approved directly by Class Coordinator within authority.'
          : currentRole === 'deputyHOD'
            ? reason.trim()
              ? `Approved by Deputy HOD: ${reason.trim()}`
              : 'Approved directly by Deputy HOD within authority.'
            : reason.trim()
              ? `Final approval granted by HOD: ${reason.trim()}`
              : 'Final approval granted by Head of Department (HOD).'

      updatedRequest.comments = [
        ...updatedRequest.comments,
        {
          author: authorName,
          role: currentRole,
          text: approvalComment,
          timestamp: now,
        },
      ]
    }

    if (decision === 'forward') {
      // Forwarding: Reviewer lacks authority and escalates to the next tier in the chain
      if (currentRole === 'classCoordinator') {
        const nextIndex = Math.min(request.currentStageIndex + 1, request.workflow.length - 1)
        updatedRequest.status = 'Waiting for Deputy HOD'
        updatedRequest.currentStageIndex = nextIndex
        updatedRequest.updatedAt = now
        updatedRequest.timeline = updatedRequest.timeline.map((item, index) => {
          if (index <= request.currentStageIndex) {
            return {
              ...item,
              completed: true,
              timestamp: item.timestamp || now,
            }
          }
          return item
        })
        updatedRequest.comments = [
          ...updatedRequest.comments,
          {
            author: 'Class Coordinator',
            role: currentRole,
            text: reason.trim()
              ? `Forwarded to Deputy HOD (beyond coordinator authority): ${reason.trim()}`
              : 'Forwarded to Deputy HOD due to lack of approving authority for this request.',
            timestamp: now,
          },
        ]
      } else if (currentRole === 'deputyHOD') {
        const nextIndex = Math.min(request.currentStageIndex + 1, request.workflow.length - 1)
        updatedRequest.status = 'HOD Review'
        updatedRequest.currentStageIndex = nextIndex
        updatedRequest.updatedAt = now
        updatedRequest.timeline = updatedRequest.timeline.map((item, index) => {
          if (index <= request.currentStageIndex) {
            return {
              ...item,
              completed: true,
              timestamp: item.timestamp || now,
            }
          }
          return item
        })
        updatedRequest.comments = [
          ...updatedRequest.comments,
          {
            author: 'Deputy HOD',
            role: currentRole,
            text: reason.trim()
              ? `Forwarded to HOD (requires department head authority): ${reason.trim()}`
              : 'Forwarded to HOD due to lack of approving authority for this request.',
            timestamp: now,
          },
        ]
      } else {
        // Fallback for admin or general forward
        const nextIndex = Math.min(request.currentStageIndex + 1, request.workflow.length - 1)
        updatedRequest.currentStageIndex = nextIndex
        updatedRequest.updatedAt = now
        updatedRequest.timeline = updatedRequest.timeline.map((item, index) => {
          if (index <= request.currentStageIndex) {
            return {
              ...item,
              completed: true,
              timestamp: item.timestamp || now,
            }
          }
          return item
        })
        updatedRequest.comments = [
          ...updatedRequest.comments,
          {
            author: authorName,
            role: currentRole,
            text: reason.trim() ? `Forwarded to next stage: ${reason.trim()}` : 'Forwarded to next stage.',
            timestamp: now,
          },
        ]
      }
    }

    if (decision === 'changes') {
      updatedRequest.status = 'Changes Requested'
      updatedRequest.updatedAt = now
      updatedRequest.comments = [
        ...updatedRequest.comments,
        {
          author: authorName,
          role: currentRole,
          text: reason || 'Additional information is required.',
          timestamp: now,
        },
      ]
    }

    if (decision === 'reject') {
      updatedRequest.status = 'Rejected'
      updatedRequest.updatedAt = now
      updatedRequest.comments = [
        ...updatedRequest.comments,
        {
          author: authorName,
          role: currentRole,
          text: reason || 'Request rejected.',
          timestamp: now,
        },
      ]
    }

    updateRequest(request.id, () => updatedRequest)
    navigate('/official')
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">Official Review</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-white">{request.title}</h1>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/8 bg-[#12151b] p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-white">Request Overview</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div><p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Request ID</p><p className="mt-2 font-medium text-zinc-200">{request.id}</p></div>
              <div><p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Student</p><p className="mt-2 font-medium text-zinc-200">{request.student}</p></div>
              <div><p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Category</p><p className="mt-2 font-medium text-zinc-200">{request.category}</p></div>
              <div><p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Request Type</p><p className="mt-2 font-medium text-zinc-200">{request.requestType}</p></div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/8 bg-[#0d1015] p-4">
              <div className="flex items-center gap-4">
                <img src={request.studentPhoto} alt={request.student} className="h-14 w-14 rounded-full border border-white/10 object-cover" />
                <div>
                  <p className="text-lg font-semibold text-white">{request.student}</p>
                  <p className="text-sm text-zinc-400">{request.studentBranch} • {request.studentRollNo}</p>
                </div>
              </div>
            </div>

            {/* AI Administrative Summary */}
            {request.aiSummary && (
              <div className="mt-5 rounded-xl border border-violet-500/20 bg-violet-500/10 p-4 text-xs">
                <p className="font-bold text-violet-200 mb-1">AI Academic Evaluation Summary</p>
                <p className="text-zinc-300 leading-relaxed">{request.aiSummary}</p>
              </div>
            )}

            {/* Generated Formal Institutional Letter */}
            <div className="mt-5 rounded-2xl border border-white/10 bg-[#0d1015] p-5 shadow-inner">
              <div className="flex items-center justify-between border-b border-white/8 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-violet-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Formal Institutional Permission Letter
                  </h3>
                </div>
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  AI Synthesized & Formatted
                </span>
              </div>

              <div className="whitespace-pre-line rounded-xl border border-white/6 bg-[#12151b] p-5 text-xs leading-relaxed text-zinc-100 font-sans shadow-sm">
                {request.generatedLetter ||
                  analyzeRequest(request.description, {
                    id: request.studentRollNo,
                    rollNo: request.studentRollNo,
                    name: request.student,
                    role: 'student',
                    branch: request.studentBranch,
                    department: request.studentBranch,
                    password: '12345678',
                    phone: '0000000000',
                    photo: request.studentPhoto,
                    firstLogin: false,
                    classCoordinator: request.assignedCoordinatorName,
                    deputyHOD: request.assignedDeputyHODName,
                  }).generatedLetter}
              </div>
            </div>

            {/* Collapsible Raw Input Drawer */}
            <div className="mt-4">
              <details className="group">
                <summary className="cursor-pointer text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 transition list-none flex items-center gap-1.5">
                  <span className="text-violet-400">▸</span> View Student Raw Input Prompt
                </summary>
                <div className="mt-2 rounded-xl border border-white/6 bg-[#0a0c10] p-3 text-xs text-zinc-400 italic">
                  "{request.description}"
                </div>
              </details>
            </div>
          </div>

          <ApprovalTimeline items={request.timeline} />
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#12151b] p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-zinc-300" />
            <h3 className="text-lg font-semibold text-white">Decision Panel</h3>
          </div>

          <div className="mb-5 rounded-2xl border border-white/8 bg-[#0d1015] p-4">
            <div className="mb-3 flex items-center gap-2 text-zinc-200">
              <Paperclip className="h-4 w-4 text-violet-300" />
              <span className="font-medium">Supporting Documents</span>
            </div>

            {request.attachments.length === 0 ? (
              <p className="text-sm text-zinc-400">No supporting documents attached.</p>
            ) : (
              <div className="space-y-2">
                {request.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-[#12151b] px-3 py-2 text-sm text-zinc-200">
                    <div>
                      <p className="font-medium text-white">{attachment.fileName}</p>
                      <p className="text-xs text-zinc-400">{attachment.fileType} • {formatAttachmentSize(attachment.fileSize)}</p>
                    </div>
                    <button type="button" onClick={() => void handleDownload(attachment.storageKey, attachment.fileName)} className="inline-flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 py-1.5 text-xs font-medium text-violet-200">
                      <Download className="h-3.5 w-3.5" /> Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isFinalized ? (
            <div className="rounded-xl border border-white/8 bg-[#0d1015] p-4 text-center">
              <ShieldCheck className="mx-auto h-8 w-8 text-emerald-400" />
              <p className="mt-2 font-medium text-white">This request has already been {request.status.toLowerCase()}.</p>
              <p className="mt-1 text-xs text-zinc-400">No further action is required from this review desk.</p>
            </div>
          ) : !isCurrentApprover ? (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-center">
              <Info className="mx-auto h-6 w-6 text-amber-400" />
              <p className="mt-2 font-medium text-amber-200">Currently awaiting action from: {request.workflow[request.currentStageIndex] || 'Next Approver'}</p>
              <p className="mt-1 text-xs text-amber-300/70">You can view the details and comments above for reference.</p>
            </div>
          ) : (
            <>
              {/* Authority Guidance Note */}
              {(currentRole === 'classCoordinator' || currentRole === 'deputyHOD') && (
                <div className="mb-4 rounded-xl border border-sky-500/20 bg-sky-500/10 p-3 text-xs text-sky-200">
                  <div className="flex items-start gap-2">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                    <div>
                      <span className="font-semibold text-sky-100">Authority Guidance:</span>
                      <p className="mt-0.5 text-sky-200/90">
                        {currentRole === 'classCoordinator'
                          ? 'If this request falls within your authority, approve it directly. If it requires higher department authority (e.g. budget, external events, leave policy exceptions), forward it to Deputy HOD.'
                          : 'If this request falls within your authority, approve it directly. If it requires department head approval (HOD), forward it to HOD.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Institutional Remark Presets */}
              <div className="mb-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Quick Institutional Remark Templates:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Attendance verified (>75%) — Sanctioned within purview.',
                    'Academic merit verified. Forwarding to Deputy HOD for budget clearance.',
                    'Inter-disciplinary travel requires HOD final sign-off.',
                    'Please attach official event brochure and registration receipt.',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setReason(preset)}
                      className="rounded-lg border border-white/8 bg-[#0d1015] px-2.5 py-1 text-[11px] text-zinc-300 hover:border-violet-500/40 hover:text-white transition"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value)
                  if (reasonError && event.target.value.trim()) setReasonError(false)
                }}
                placeholder={
                  currentRole === 'classCoordinator'
                    ? 'Official remarks (required for changes/reject; optional explanation when forwarding or approving)'
                    : currentRole === 'deputyHOD'
                      ? 'Official remarks (required for changes/reject; optional explanation when forwarding or approving)'
                      : 'Official remarks (required for changes/reject)'
                }
                rows={4}
                className={`w-full rounded-xl border bg-[#0d1015] p-3 text-sm text-zinc-200 outline-none transition ${
                  reasonError ? 'border-rose-500 focus:border-rose-500' : 'border-white/8 focus:border-violet-500'
                }`}
              />
              {reasonError ? (
                <p className="mt-1.5 text-xs font-medium text-rose-400">
                  Please enter a reason before requesting changes or rejecting.
                </p>
              ) : (
                reason.trim().length === 0 && (
                  <p className="mt-1.5 text-xs text-zinc-400">
                    A reason is required when requesting changes or rejecting.
                  </p>
                )
              )}

              <div className="mt-5 space-y-2.5">
                {/* 1. Approve directly if authority exists */}
                <button
                  type="button"
                  onClick={() => handleDecision('approve')}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition"
                >
                  <Check className="h-4 w-4" />
                  {currentRole === 'classCoordinator'
                    ? 'Approve (I have authority)'
                    : currentRole === 'deputyHOD'
                      ? 'Approve (I have authority)'
                      : 'Approve Request (Final Approval)'}
                </button>

                {/* 2. Forward to next authority if reviewer lacks authority */}
                {currentRole === 'classCoordinator' && (
                  <button
                    type="button"
                    onClick={() => handleDecision('forward')}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/20 px-4 py-3 text-sm font-semibold text-sky-200 shadow-sm hover:bg-sky-500/30 transition"
                  >
                    <ArrowRight className="h-4 w-4 text-sky-300" />
                    Forward to Deputy HOD (No authority)
                  </button>
                )}

                {currentRole === 'deputyHOD' && (
                  <button
                    type="button"
                    onClick={() => handleDecision('forward')}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/20 px-4 py-3 text-sm font-semibold text-sky-200 shadow-sm hover:bg-sky-500/30 transition"
                  >
                    <ArrowRight className="h-4 w-4 text-sky-300" />
                    Forward to HOD (No authority)
                  </button>
                )}

                {/* 3. Request Changes */}
                <button
                  type="button"
                  onClick={() => handleDecision('changes')}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 transition"
                >
                  <MessageSquareText className="h-4 w-4" /> Request Changes
                </button>

                {/* 4. Reject */}
                <button
                  type="button"
                  onClick={() => handleDecision('reject')}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 transition"
                >
                  <X className="h-4 w-4" /> Reject
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  )
}



