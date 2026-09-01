import {
  ArrowLeft,
  Download,
  FileText,
  MessageSquareText,
  Paperclip,
  Printer,
  ShieldCheck,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/ui/AppShell'
import { ApprovalTimeline } from '../components/ui/ApprovalTimeline'
import { StatusBadge } from '../components/ui/StatusBadge'
import { useAppContext } from '../contexts/AppContext'
import { generateAuditHash } from '../services/audit/auditExport'
import { formatAttachmentSize, getAttachment, getRequestAttachments } from '../services/storage/attachmentStorage'
import type { AttachmentItem } from '../types'

export default function RequestDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { requests, currentUser } = useAppContext()
  const [attachments, setAttachments] = useState<AttachmentItem[]>([])
  const [showSanctionModal, setShowSanctionModal] = useState(false)
  const request = requests.find((item) => item.id === id)

  useEffect(() => {
    if (!request) return
    void (async () => {
      const saved = await getRequestAttachments(request.id)
      setAttachments(saved)
    })()
  }, [request])

  const currentAttachments = request?.attachments.length ? request.attachments : attachments

  const handleDownload = async (attachment: AttachmentItem) => {
    const blob = await getAttachment(attachment.storageKey)
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = attachment.fileName
    anchor.click()
    URL.revokeObjectURL(url)
  }

  if (!request) {
    return (
      <AppShell>
        <div className="rounded-2xl border border-white/8 bg-[#12151b] p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-white">Request not found</h1>
        </div>
      </AppShell>
    )
  }

  const auditHash = generateAuditHash(request.id, request.createdAt, request.student)

  return (
    <AppShell>
      {/* Top Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(currentUser?.role === 'student' ? '/dashboard' : '/official')}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-[#12151b] text-zinc-300 hover:bg-[#181c24] transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-violet-400">
                {request.id}
              </span>
              <span className="text-xs text-zinc-400">• {request.category}</span>
            </div>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-white md:text-3xl">
              {request.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {request.status === 'Approved' && (
            <button
              type="button"
              onClick={() => setShowSanctionModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition active:scale-95"
            >
              <Printer className="h-3.5 w-3.5" /> Official Sanction Order
            </button>
          )}
          <StatusBadge status={request.status} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {/* Main Request Information */}
          <div className="rounded-2xl border border-white/8 bg-[#12151b] p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-[#0d1015] p-4">
              <img
                src={request.studentPhoto}
                alt={request.student}
                className="h-14 w-14 rounded-2xl border border-white/10 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-white">{request.student}</p>
                <p className="text-xs text-zinc-400 font-mono">
                  {request.studentRollNo} • {request.studentBranch}
                </p>
                <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-zinc-300">
                  <span>Coordinator: <strong className="text-emerald-300">{request.assignedCoordinatorName ?? 'Prof. Priya Nair'}</strong></span>
                  <span>• Deputy HOD: <strong className="text-amber-300">{request.assignedDeputyHODName ?? 'Dr. Meenakshi Sundaram'}</strong></span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400 mb-1.5">
                Request Summary & Scope
              </p>
              <p className="text-xs leading-relaxed text-zinc-300">{request.description}</p>
            </div>

            <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-4 text-xs">
              <p className="font-bold text-violet-200 mb-1">Administrative Evaluation Summary</p>
              <p className="text-zinc-300 leading-relaxed">{request.aiSummary}</p>
            </div>

            {/* Generated Letter Section */}
            <div className="rounded-xl border border-white/8 bg-[#0d1015] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-violet-400" /> Formal Institutional Permission Letter
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">Addressed to Class Coordinator</span>
              </div>
              <div className="whitespace-pre-line rounded-xl border border-white/6 bg-[#12151b] p-4 text-xs leading-relaxed text-zinc-200 font-sans shadow-inner">
                {request.generatedLetter ?? 'Official permission letter generated on file.'}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <ApprovalTimeline items={request.timeline} />
        </div>

        {/* Right Sidebar: Audit Seal, Comments & Documents */}
        <div className="space-y-6">
          {/* Digital Audit Seal Card */}
          <div className="rounded-2xl border border-violet-500/30 bg-[#12151b] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-violet-400" />
                <h3 className="text-sm font-bold text-white">Digital Audit & Seal</h3>
              </div>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                AUDIT VERIFIED
              </span>
            </div>

            <div className="space-y-2 text-xs text-zinc-300">
              <div className="flex justify-between py-1 border-b border-white/6">
                <span className="text-zinc-400">Digital Seal Hash:</span>
                <span className="font-mono font-bold text-violet-300">{auditHash}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/6">
                <span className="text-zinc-400">Timestamp:</span>
                <span className="font-mono">{new Date(request.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/6">
                <span className="text-zinc-400">Audit Compliance:</span>
                <span className="text-emerald-400 font-medium">NAAC / NBA Format Ready</span>
              </div>
            </div>
          </div>

          {/* Comments and Decision Remarks */}
          <div className="rounded-2xl border border-white/8 bg-[#12151b] p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquareText className="h-4 w-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white">Reviewer Remarks Log ({request.comments.length})</h3>
            </div>
            <div className="space-y-2.5">
              {request.comments.length ? (
                request.comments.map((comment, idx) => (
                  <div key={`${comment.author}-${idx}`} className="rounded-xl border border-white/6 bg-[#0d1015] p-3 text-xs">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-white">{comment.author}</span>
                      <span className="text-[10px] text-zinc-400">{new Date(comment.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed">{comment.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-400">No reviewer remarks logged yet.</p>
              )}
            </div>
          </div>

          {/* Documents & Attachments */}
          <div className="rounded-2xl border border-white/8 bg-[#12151b] p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white">Supporting Documents</h3>
            </div>

            {currentAttachments.length === 0 ? (
              <p className="text-xs text-zinc-400">No uploaded supporting documents.</p>
            ) : (
              <div className="space-y-2">
                {currentAttachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-[#0d1015] px-3 py-2 text-xs text-zinc-200"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{attachment.fileName}</p>
                      <p className="text-[10px] text-zinc-400">{formatAttachmentSize(attachment.fileSize)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDownload(attachment)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-200 hover:bg-violet-600 hover:text-white transition"
                    >
                      <Download className="h-3 w-3" /> Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Official Sanction Order Printable Modal */}
      {showSanctionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0d1015] p-6 sm:p-8 text-zinc-100 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Sanction Letterhead */}
            <div className="text-center border-b border-white/10 pb-4">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-xs font-black text-white mb-2">
                IAN
              </div>
              <h2 className="text-lg font-bold uppercase tracking-wider text-white">
                University Academic Council
              </h2>
              <p className="text-xs text-zinc-400">Official Sanction & Permission Order</p>
              <p className="text-[11px] font-mono text-violet-300 mt-1">
                Ref: {request.id} / SANCTION / {new Date().getFullYear()}
              </p>
            </div>

            {/* Order Body */}
            <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
              <p>
                <strong>Sanction Subject:</strong> Official grant of permission and attendance On-Duty (OD) sanction for <strong>{request.title}</strong>.
              </p>
              <div className="rounded-xl border border-white/6 bg-[#12151b] p-3 space-y-1 font-mono text-[11px]">
                <p>Student Name: <strong className="text-white">{request.student}</strong></p>
                <p>Roll Number: <strong className="text-white">{request.studentRollNo}</strong></p>
                <p>Department: <strong className="text-white">{request.studentBranch}</strong></p>
                <p>Sanction Category: <strong className="text-white">{request.category}</strong></p>
                <p>Verification Seal: <strong className="text-emerald-400">{auditHash}</strong></p>
              </div>
              <p>
                This sanction order confirms that all multi-tier academic scrutinies by the Class Coordinator, Deputy Head of Department, and Head of Department have been formally authorized.
              </p>
            </div>

            {/* Signatures & Seal Stamps */}
            <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4 text-center text-[10px]">
              <div className="rounded-xl border border-white/6 bg-[#12151b] p-2.5">
                <p className="text-emerald-400 font-bold">✓ SANCTIONED</p>
                <p className="font-semibold text-white mt-1">{request.assignedCoordinatorName ?? 'Class Coordinator'}</p>
                <p className="text-zinc-500">Class Coordinator</p>
              </div>
              <div className="rounded-xl border border-white/6 bg-[#12151b] p-2.5">
                <p className="text-emerald-400 font-bold">✓ SANCTIONED</p>
                <p className="font-semibold text-white mt-1">{request.assignedDeputyHODName ?? 'Deputy HOD'}</p>
                <p className="text-zinc-500">Deputy HOD</p>
              </div>
              <div className="rounded-xl border border-white/6 bg-[#12151b] p-2.5">
                <p className="text-emerald-400 font-bold">✓ APPROVED</p>
                <p className="font-semibold text-white mt-1">Dr. A. P. Jayaram</p>
                <p className="text-zinc-500">Head of Department</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-violet-500 transition"
              >
                <Printer className="h-3.5 w-3.5" /> Print Sanction Order
              </button>
              <button
                type="button"
                onClick={() => setShowSanctionModal(false)}
                className="rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-xs font-medium text-zinc-400 hover:text-white transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
