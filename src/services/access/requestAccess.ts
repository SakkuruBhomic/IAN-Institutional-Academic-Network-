import type { ApprovalRequest, Role } from '../../types'

const workflowOrder: Record<string, number> = {
  student: 0,
  classCoordinator: 1,
  deputyHOD: 2,
  HOD: 3,
  admin: 4,
}

export function canViewRequestAttachments(request: ApprovalRequest, role: Role) {
  if (role === 'admin') return true

  const roleIndex = workflowOrder[role] ?? -1
  const requestIndex = request.currentStageIndex ?? 0

  if (role === 'student') {
    return request.studentRollNo === request.studentRollNo
  }

  return roleIndex <= requestIndex
}

export function getRequestRoleAccessLabel(role: Role) {
  switch (role) {
    case 'classCoordinator':
      return 'Class Coordinator'
    case 'deputyHOD':
      return 'Deputy HOD'
    case 'HOD':
      return 'HOD'
    case 'admin':
      return 'Admin'
    default:
      return 'Student'
  }
}
