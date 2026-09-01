export type Role =
  | 'student'
  | 'classCoordinator'
  | 'deputyHOD'
  | 'HOD'
  | 'admin'

export type RequestStatus =
  | 'Submitted'
  | 'Coordinator Approved'
  | 'Waiting for Deputy HOD'
  | 'HOD Review'
  | 'Approved'
  | 'Changes Requested'
  | 'Rejected'
  | 'Pending'

export interface UserProfile {
  id: string
  rollNo: string
  name: string
  role: Role
  branch: string
  password: string
  phone: string
  photo: string
  department?: string
  year?: number
  email?: string
  profileImageUrl?: string
  classCoordinator?: string
  deputyHOD?: string
  firstLogin: boolean
}

export interface CommentItem {
  author: string
  role: string
  text: string
  timestamp: string
}

export interface TimelineItem {
  label: string
  timestamp: string
  completed: boolean
}

export interface AIAnalysis {
  category: string
  title: string
  summary: string
  extractedData: Record<string, string>
  missingInformation: string[]
  suggestedWorkflow: string[]
  confidence: number
}

export interface AttachmentItem {
  id: string
  requestId: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedBy: string
  uploadedAt: string
  storageKey: string
  mimeType?: string
}

export interface ApprovalRequest {
  id: string
  title: string
  student: string
  studentRollNo: string
  studentBranch: string
  studentPhoto: string
  category: string
  description: string
  aiSummary: string
  generatedLetter?: string
  status: RequestStatus
  currentStageIndex: number
  requestType: string
  workflow: string[]
  createdAt: string
  updatedAt: string
  documents: string[]
  attachments: AttachmentItem[]
  comments: CommentItem[]
  timeline: TimelineItem[]
  studentEmail?: string
  assignedCoordinatorId?: string
  assignedCoordinatorName?: string
  assignedDeputyHODId?: string
  assignedDeputyHODName?: string
  assignedHODName?: string
  urgency?: 'Low' | 'Medium' | 'High' | 'Urgent'
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  type: 'success' | 'warning' | 'info'
  createdAt: string
  read: boolean
}

export interface RoleConfig {
  label: string
  description: string
  color: string
}
