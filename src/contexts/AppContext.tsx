import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authenticateOfficial, type OfficialRole } from '../data/officialAccounts'
import { authenticateStudent } from '../data/studentAccounts'
import { initialNotifications, initialRequests, roleConfig, seedUsers } from '../data/mockData'
import type { ApprovalRequest, AttachmentItem, NotificationItem, Role, UserProfile } from '../types'

interface AppContextValue {
  users: UserProfile[]
  currentUser: UserProfile | null
  currentRole: Role
  requests: ApprovalRequest[]
  notifications: NotificationItem[]
  login: (rollNo: string, password: string) => { ok: boolean; message: string }
  loginOfficial: (role: OfficialRole, username: string, password: string) => { ok: boolean; message: string }
  logout: () => void
  setCurrentRole: (role: Role) => void
  setPassword: (rollNo: string, password: string) => { ok: boolean; message: string }
  updateUserProfile: (updates: Partial<UserProfile>) => void
  addRequest: (request: ApprovalRequest) => void
  updateRequest: (requestId: string, updater: (request: ApprovalRequest) => ApprovalRequest) => void
  addAttachmentToRequest: (requestId: string, attachment: AttachmentItem) => void
  removeAttachmentFromRequest: (requestId: string, attachmentId: string) => void
  markNotificationRead: (id: string) => void
  roleLabel: string
}

const USERS_KEY = 'ian-users-v1'
const REQUESTS_KEY = 'ian-requests-v1'
const AUTH_KEY = 'ian-auth-v1'
const NOTIFICATIONS_KEY = 'ian-notifications-v1'

const AppContext = createContext<AppContextValue | undefined>(undefined)

function getStoredUsers() {
  const stored = localStorage.getItem(USERS_KEY)
  if (!stored) {
    localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers))
    return seedUsers
  }
  try {
    return JSON.parse(stored) as UserProfile[]
  } catch {
    localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers))
    return seedUsers
  }
}

function getStoredRequests() {
  const stored = localStorage.getItem(REQUESTS_KEY)
  if (!stored) {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(initialRequests))
    return initialRequests
  }
  try {
    return JSON.parse(stored) as ApprovalRequest[]
  } catch {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(initialRequests))
    return initialRequests
  }
}

function getStoredNotifications() {
  const stored = localStorage.getItem(NOTIFICATIONS_KEY)
  if (!stored) {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(initialNotifications))
    return initialNotifications
  }
  try {
    return JSON.parse(stored) as NotificationItem[]
  } catch {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(initialNotifications))
    return initialNotifications
  }
}

function getBranchShort(department?: string): string {
  if (!department) return 'CSE'
  if (department.includes('Artificial Intelligence')) return 'AI'
  if (department.includes('Computer Science')) return 'CSE'
  if (department.includes('Electronics')) return 'ECE'
  if (department.includes('Mechanical')) return 'ME'
  if (department.includes('Civil')) return 'CE'
  return 'CSE'
}

function buildStudentUser(
  rollNo: string,
  name: string,
  department?: string,
  year?: number,
  email?: string,
  classCoordinator?: string,
  deputyHOD?: string,
): UserProfile {
  return {
    id: `student-${rollNo}`,
    rollNo,
    name,
    role: 'student',
    branch: getBranchShort(department),
    password: '12345678',
    phone: '0000000000',
    photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff&size=200`,
    department: department ?? 'Computer Science and Engineering',
    year: year ?? 1,
    email: email ?? `${rollNo.toLowerCase()}@college.edu`,
    classCoordinator,
    deputyHOD,
    firstLogin: false,
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<UserProfile[]>(() => getStoredUsers())
  const [requests, setRequests] = useState<ApprovalRequest[]>(() => getStoredRequests())
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getStoredNotifications())
  const [fallbackRole, setFallbackRole] = useState<Role>('student')
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem(AUTH_KEY)
    if (!stored) return null
    try {
      const parsed = JSON.parse(stored) as UserProfile | null
      if (!parsed) return null
      return parsed
    } catch {
      return null
    }
  })

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }, [users])

  useEffect(() => {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests))
  }, [requests])

  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications))
  }, [notifications])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(currentUser))
    } else {
      localStorage.removeItem(AUTH_KEY)
    }
  }, [currentUser])

  const login = (rollNo: string, password: string) => {
    const student = authenticateStudent(rollNo, password)
    if (!student) {
      return { ok: false, message: 'Invalid roll number or password.' }
    }

    const sessionUser = buildStudentUser(
      student.rollNumber,
      student.name,
      student.department,
      student.year,
      student.email,
      student.assignedCoordinatorName,
      student.assignedDeputyHODName,
    )
    setCurrentUser(sessionUser)
    setFallbackRole('student')
    return { ok: true, message: 'Login successful.' }
  }

  const loginOfficial = (role: OfficialRole, username: string, password: string) => {
    const account = authenticateOfficial(role, username, password)
    if (!account) {
      return { ok: false, message: 'Invalid role, username or password.' }
    }

    const officialUser: UserProfile = {
      id: `official-${account.username}`,
      rollNo: account.username,
      name: account.displayName,
      role: account.role,
      branch: account.department ?? 'Administration',
      department: account.department ?? 'Administration',
      password: account.password,
      phone: '0000000000',
      photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(account.displayName)}&background=8b5cf6&color=fff&size=200`,
      firstLogin: false,
    }

    setCurrentUser(officialUser)
    setFallbackRole(account.role)
    return { ok: true, message: 'Login successful.' }
  }

  const logout = () => {
    setCurrentUser(null)
    setFallbackRole('student')
    localStorage.removeItem(AUTH_KEY)
  }

  const setCurrentRole = (role: Role) => {
    setFallbackRole(role)
  }

  const setPassword = (rollNo: string, password: string) => {
    const normalizedRoll = rollNo.trim()
    const user = users.find((item) => item.rollNo === normalizedRoll)
    if (!user) return { ok: false, message: 'Roll number not found.' }
    if (password.trim().length < 6) return { ok: false, message: 'Password must be at least 6 characters long.' }

    setUsers((prev) => prev.map((item) => item.rollNo === normalizedRoll ? { ...item, password, firstLogin: false } : item))

    const updatedUser = { ...user, password, firstLogin: false }
    setCurrentUser(updatedUser)
    return { ok: true, message: 'Password created successfully.' }
  }

  const addRequest = (request: ApprovalRequest) => {
    setRequests((prev) => [request, ...prev])
    setNotifications((prev) => [{
      id: `${Date.now()}`,
      title: 'Request submitted',
      message: `${request.title} has been submitted and is now awaiting approval.`,
      type: 'success',
      createdAt: new Date().toISOString(),
      read: false,
    }, ...prev])
  }

  const updateRequest = (requestId: string, updater: (request: ApprovalRequest) => ApprovalRequest) => {
    setRequests((prev) => prev.map((request) => {
      if (request.id !== requestId) return request
      const updated = updater(request)
      if (updated.status === request.status && updated.currentStageIndex === request.currentStageIndex) return updated
      const action =
        updated.status === 'Approved'
          ? 'approved'
          : updated.status === 'Rejected'
            ? 'rejected'
            : updated.status === 'Changes Requested'
              ? 'requested for changes'
              : updated.status === 'Waiting for Deputy HOD'
                ? 'forwarded to Deputy HOD'
                : updated.status === 'HOD Review'
                  ? 'forwarded to HOD'
                  : 'updated'
      setNotifications((notificationsPrev) => [
        {
          id: `${Date.now()}-${requestId}`,
          title: 'Request status updated',
          message: `${updated.title} was ${action}.`,
          type: updated.status === 'Rejected' ? 'warning' : 'info',
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...notificationsPrev,
      ])
      return updated
    }))
  }

  const addAttachmentToRequest = (requestId: string, attachment: AttachmentItem) => {
    setRequests((prev) => prev.map((request) => request.id === requestId ? { ...request, attachments: [...request.attachments, attachment] } : request))
  }

  const removeAttachmentFromRequest = (requestId: string, attachmentId: string) => {
    setRequests((prev) => prev.map((request) => request.id === requestId ? { ...request, attachments: request.attachments.filter((attachment) => attachment.id !== attachmentId) } : request))
  }

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      if (!prev) return null
      const updated = { ...prev, ...updates }
      localStorage.setItem(AUTH_KEY, JSON.stringify(updated))
      return updated
    })
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === currentUser?.id ? { ...u, ...updates } : u)),
    )
  }

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)))
  }

  const currentRole = currentUser?.role ?? fallbackRole

  const value = useMemo<AppContextValue>(() => ({
    users,
    currentUser,
    currentRole,
    requests,
    notifications,
    login,
    loginOfficial,
    logout,
    setCurrentRole,
    setPassword,
    updateUserProfile,
    addRequest,
    updateRequest,
    addAttachmentToRequest,
    removeAttachmentFromRequest,
    markNotificationRead,
    roleLabel: roleConfig[currentRole]?.label ?? 'Student',
  }), [currentRole, currentUser, notifications, requests, users])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider')
  }
  return context
}

