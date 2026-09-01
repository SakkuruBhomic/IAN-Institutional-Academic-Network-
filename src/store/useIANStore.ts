import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProcessedStudentRequest, StudentDetails } from '../lib/aiEngine'

export type UserRole = 'Student' | 'Class Coordinator' | 'Deputy HOD' | 'HOD'
export type RequestStatus = 'Pending' | 'Approved' | 'Rejected'

export interface AuditEntry {
  role: UserRole
  action: 'Approved' | 'Rejected' | 'Forwarded'
  timestamp: string
}

export interface RequestItem {
  id: string
  studentDetails: StudentDetails
  originalPrompt: string
  category: string
  urgency: string
  generatedLetterText: string
  approvalChain: UserRole[]
  currentStepIndex: number
  status: RequestStatus
  auditLog: AuditEntry[]
  createdAt: string
}

interface IANStore {
  role: UserRole
  requests: RequestItem[]
  setRole: (role: UserRole) => void
  addRequest: (request: ProcessedStudentRequest, studentDetails: StudentDetails, originalPrompt: string) => void
  approveRequest: (id: string) => void
  forwardRequest: (id: string) => void
  rejectRequest: (id: string) => void
}

const seededRequest: RequestItem = {
  id: 'ian-seeded-001',
  studentDetails: { name: 'A. Meghana', rollNumber: '21CS042', department: 'Computer Science and Engineering', year: 'Third-year' },
  originalPrompt: 'I need to attend the National AI Hackathon at VIT from 14 to 16 September.',
  category: 'Hackathon',
  urgency: 'Medium',
  generatedLetterText: 'To\nThe Head of Department\nComputer Science and Engineering\n\nSubject: Request for permission to attend the National AI Hackathon\n\nRespected Sir/Madam,\n\nI, A. Meghana (21CS042), a Third-year student of Computer Science and Engineering, kindly request permission to represent the department at the National AI Hackathon at VIT from 14 to 16 September. I assure you that I will complete all academic work missed during this period.\n\nI request you to consider my application favourably.\n\nYours faithfully,\nA. Meghana\n21CS042',
  approvalChain: ['Class Coordinator', 'Deputy HOD', 'HOD'],
  currentStepIndex: 0,
  status: 'Pending',
  auditLog: [],
  createdAt: '2026-08-28T09:30:00.000Z',
}

const updateRequest = (requests: RequestItem[], id: string, updater: (request: RequestItem) => RequestItem) => requests.map((request) => request.id === id ? updater(request) : request)

export const useIANStore = create<IANStore>()(persist((set) => ({
  role: 'Student',
  requests: [seededRequest],
  setRole: (role) => set({ role }),
  addRequest: (request, studentDetails, originalPrompt) => set((state) => ({ requests: [{ id: crypto.randomUUID(), studentDetails, originalPrompt, category: request.category, urgency: request.urgency, generatedLetterText: request.generatedLetterText, approvalChain: request.approvalChain.filter((item): item is UserRole => ['Class Coordinator', 'Deputy HOD', 'HOD'].includes(item)), currentStepIndex: 0, status: 'Pending', auditLog: [], createdAt: new Date().toISOString() }, ...state.requests] })),
  approveRequest: (id) => set((state) => ({ requests: updateRequest(state.requests, id, (request) => request.status === 'Pending' && request.approvalChain[request.currentStepIndex] === state.role ? { ...request, currentStepIndex: request.approvalChain.length, status: 'Approved', auditLog: [...request.auditLog, { role: state.role, action: 'Approved', timestamp: new Date().toISOString() }] } : request) })),
  forwardRequest: (id) => set((state) => ({ requests: updateRequest(state.requests, id, (request) => request.status === 'Pending' && request.approvalChain[request.currentStepIndex] === state.role && request.currentStepIndex < request.approvalChain.length - 1 ? { ...request, currentStepIndex: request.currentStepIndex + 1, auditLog: [...request.auditLog, { role: state.role, action: 'Forwarded', timestamp: new Date().toISOString() }] } : request) })),
  rejectRequest: (id) => set((state) => ({ requests: updateRequest(state.requests, id, (request) => request.status === 'Pending' && request.approvalChain[request.currentStepIndex] === state.role ? { ...request, status: 'Rejected', auditLog: [...request.auditLog, { role: state.role, action: 'Rejected', timestamp: new Date().toISOString() }] } : request) })),
}), { name: 'ian-requests' }))