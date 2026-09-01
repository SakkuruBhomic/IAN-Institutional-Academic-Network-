import type { ApprovalRequest } from '../../types'

export interface AuditLogEntry {
  timestamp: string
  requestId: string
  requestTitle: string
  studentName: string
  studentRollNo: string
  studentDepartment: string
  category: string
  action: string
  actor: string
  actorRole: string
  stage: string
  status: string
  remarks: string
  verificationHash: string
}

export function generateAuditHash(requestId: string, timestamp: string, actor: string): string {
  const seed = `${requestId}:${timestamp}:${actor}:IAN-ACCREDITATION-V1`
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0 // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')
  return `AUTH-${hex}`
}

export function extractFullAuditLogs(requests: ApprovalRequest[]): AuditLogEntry[] {
  const logs: AuditLogEntry[] = []

  requests.forEach((req) => {
    // 1. Initial Submission
    logs.push({
      timestamp: req.createdAt,
      requestId: req.id,
      requestTitle: req.title,
      studentName: req.student,
      studentRollNo: req.studentRollNo,
      studentDepartment: req.studentBranch,
      category: req.category,
      action: 'REQUEST_SUBMITTED',
      actor: req.student,
      actorRole: 'Student',
      stage: 'Initial Submission',
      status: 'Submitted',
      remarks: 'Application submitted with auto-generated permission draft.',
      verificationHash: generateAuditHash(req.id, req.createdAt, req.student),
    })

    // 2. Comments / Decision Actions
    req.comments.forEach((c) => {
      const isApproved = req.status === 'Approved'
      const isRejected = req.status === 'Rejected'
      const isForwarded = req.status === 'Waiting for Deputy HOD' || req.status === 'HOD Review'
      const actionType = isApproved
        ? 'STAGE_SANCTIONED'
        : isRejected
          ? 'STAGE_REJECTED'
          : isForwarded
            ? 'AUTHORITY_ESCALATED'
            : 'REMARK_LOGGED'

      logs.push({
        timestamp: c.timestamp,
        requestId: req.id,
        requestTitle: req.title,
        studentName: req.student,
        studentRollNo: req.studentRollNo,
        studentDepartment: req.studentBranch,
        category: req.category,
        action: actionType,
        actor: c.author,
        actorRole: c.role,
        stage: req.workflow[req.currentStageIndex] ?? 'Review Desk',
        status: req.status,
        remarks: c.text,
        verificationHash: generateAuditHash(req.id, c.timestamp, c.author),
      })
    })

    // 3. Final State if not in comments
    if (req.comments.length === 0 && req.status !== 'Pending') {
      logs.push({
        timestamp: req.updatedAt,
        requestId: req.id,
        requestTitle: req.title,
        studentName: req.student,
        studentRollNo: req.studentRollNo,
        studentDepartment: req.studentBranch,
        category: req.category,
        action: `STATUS_${req.status.toUpperCase().replace(/\s+/g, '_')}`,
        actor: req.assignedCoordinatorName ?? 'Review Desk',
        actorRole: 'Reviewer',
        stage: req.workflow[req.currentStageIndex] ?? 'Completed',
        status: req.status,
        remarks: `Request status transitioned to ${req.status}.`,
        verificationHash: generateAuditHash(req.id, req.updatedAt, 'ReviewDesk'),
      })
    }
  })

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function exportAuditLogsToCSV(requests: ApprovalRequest[], departmentName = 'All Departments') {
  const logs = extractFullAuditLogs(requests)

  const headers = [
    'Log Timestamp',
    'Audit Hash / Digital Seal',
    'Request ID',
    'Title',
    'Student Name',
    'Roll Number',
    'Department',
    'Category',
    'Action Type',
    'Actor',
    'Actor Role',
    'Workflow Stage',
    'Current Status',
    'Official Remarks / Decision Reason',
  ]

  const rows = logs.map((log) => [
    `"${log.timestamp}"`,
    `"${log.verificationHash}"`,
    `"${log.requestId}"`,
    `"${log.requestTitle.replace(/"/g, '""')}"`,
    `"${log.studentName}"`,
    `"${log.studentRollNo}"`,
    `"${log.studentDepartment}"`,
    `"${log.category}"`,
    `"${log.action}"`,
    `"${log.actor}"`,
    `"${log.actorRole}"`,
    `"${log.stage}"`,
    `"${log.status}"`,
    `"${log.remarks.replace(/"/g, '""')}"`,
  ])

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  const filename = `IAN_Audit_Compliance_Report_${departmentName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
