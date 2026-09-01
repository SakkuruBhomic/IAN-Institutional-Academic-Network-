// Map UI role to workflow stage name
export function uiRoleToWorkflowRole(uiRole: string): string {
  switch (uiRole) {
    case 'classCoordinator':
      return 'Class Coordinator'
    case 'deputyHOD':
      return 'Deputy HOD'
    case 'HOD':
      return 'HOD'
    case 'student':
      return 'Student'
    case 'admin':
      return 'Admin'
    default:
      return uiRole
  }
}

// Map workflow stage name to UI role
export function workflowRoleToUIRole(workflowRole: string): string {
  switch (workflowRole) {
    case 'Class Coordinator':
      return 'classCoordinator'
    case 'Deputy HOD':
      return 'deputyHOD'
    case 'HOD':
      return 'HOD'
    case 'Student':
      return 'student'
    case 'Admin':
      return 'admin'
    default:
      return workflowRole
  }
}

// Check if a user can see a request based on workflow stage
export function canUserSeeRequest(
  currentStageIndex: number,
  workflow: string[],
  userRole: string,
): boolean {
  // User can see if they are the current approver
  if (workflow[currentStageIndex] === uiRoleToWorkflowRole(userRole)) {
    return true
  }

  // User can see if they have already approved (i.e., they're earlier in the workflow)
  const userWorkflowIndex = workflow.findIndex((role) => role === uiRoleToWorkflowRole(userRole))
  if (userWorkflowIndex !== -1 && userWorkflowIndex < currentStageIndex) {
    return true
  }

  // Student can always see their own request
  if (userRole === 'student') {
    return true
  }

  return false
}

/**
 * Get the current approver stage information
 * Useful for displaying "Currently at X stage" status
 */
export function getCurrentApprovalStage(
  currentStageIndex: number,
  workflow: string[],
): { stage: string; index: number } | null {
  if (currentStageIndex < 0 || currentStageIndex >= workflow.length) {
    return null
  }
  return {
    stage: workflow[currentStageIndex],
    index: currentStageIndex,
  }
}
