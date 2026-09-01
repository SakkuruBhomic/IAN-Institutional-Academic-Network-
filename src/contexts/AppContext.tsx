import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authenticateOfficial, type OfficialRole } from '../data/officialAccounts'
import { authenticateStudent } from '../data/studentAccounts'
import { initialNotifications, roleConfig, seedUsers } from '../data/mockData'
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

const USERS_KEY = 'ian-users-v2'
const REQUESTS_KEY = 'ian-requests-v2'
const AUTH_KEY = 'ian-auth-v2'
const NOTIFICATIONS_KEY = 'ian-notifications-v2'

const AppContext = createContext<AppContextValue | undefined>(undefined)

/* ──────────── localStorage helpers ──────────── */

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

/* ──────────── helpers ──────────── */

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

/* ═══════════════════════════════════════════════
   Provider
   ═══════════════════════════════════════════════ */

export function AppProvider({ children }: { children: ReactNode }) {
  // Start with EMPTY requests — only real student submissions will appear
  const [users, setUsers] = useState<UserProfile[]>(() => readJSON(USERS_KEY, seedUsers))
  const [requests, setRequests] = useState<ApprovalRequest[]>(() => readJSON(REQUESTS_KEY, []))
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => readJSON(NOTIFICATIONS_KEY, initialNotifications))
  const [fallbackRole, setFallbackRole] = useState<Role>('student')
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => readJSON(AUTH_KEY, null))

  /* ── Sync TO localStorage whenever React state changes ── */
  useEffect(() => { writeJSON(USERS_KEY, users) }, [users])
  useEffect(() => { writeJSON(REQUESTS_KEY, requests) }, [requests])
  useEffect(() => { writeJSON(NOTIFICATIONS_KEY, notifications) }, [notifications])
  useEffect(() => {
    if (currentUser) writeJSON(AUTH_KEY, currentUser)
    else localStorage.removeItem(AUTH_KEY)
  }, [currentUser])

  /* ── Cross-tab sync: listen for localStorage changes from other tabs ── */
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === REQUESTS_KEY && e.newValue) {
        try { setRequests(JSON.parse(e.newValue)) } catch { /* ignore */ }
      }
      if (e.key === NOTIFICATIONS_KEY && e.newValue) {
        try { setNotifications(JSON.parse(e.newValue)) } catch { /* ignore */ }
      }
      if (e.key === USERS_KEY && e.newValue) {
        try { setUsers(JSON.parse(e.newValue)) } catch { /* ignore */ }
      }
    }
    window.addEventListener('storage', handleStorageEvent)
    return () => window.removeEventListener('storage', handleStorageEvent)
  }, [])

  /* ── Same-tab freshness: poll localStorage every 2s to catch writes from
       the same browsing context (e.g. student submits, then switches to
       coordinator in the same tab without a full page reload) ── */
  useEffect(() => {
    const interval = setInterval(() => {
      const freshRequests = readJSON<ApprovalRequest[]>(REQUESTS_KEY, [])
      setRequests((prev) => {
        // Only update if the data actually changed (compare by length + last id)
        if (prev.length !== freshRequests.length) return freshRequests
        if (prev.length > 0 && freshRequests.length > 0) {
          const prevFirst = prev[0]
          const freshFirst = freshRequests[0]
          if (prevFirst.id !== freshFirst.id || prevFirst.status !== freshFirst.status || prevFirst.currentStageIndex !== freshFirst.currentStageIndex) {
            return freshRequests
          }
        }
        return prev
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  /* ── Force-refresh requests from localStorage on login ── */
  const refreshFromStorage = useCallback(() => {
    setRequests(readJSON(REQUESTS_KEY, []))
    setNotifications(readJSON(NOTIFICATIONS_KEY, initialNotifications))
  }, [])

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
    refreshFromStorage()
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
    refreshFromStorage()
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

  const addRequest = useCallback((request: ApprovalRequest) => {
    // Synchronous write FIRST so other sessions/polls pick it up immediately
    const current = readJSON<ApprovalRequest[]>(REQUESTS_KEY, [])
    const updated = [request, ...current]
    writeJSON(REQUESTS_KEY, updated)

    setRequests(updated)
    setNotifications((prev) => {
      const next = [{
        id: `${Date.now()}`,
        title: 'Request submitted',
        message: `${request.title} has been submitted and is now awaiting approval.`,
        type: 'success' as const,
        createdAt: new Date().toISOString(),
        read: false,
      }, ...prev]
      writeJSON(NOTIFICATIONS_KEY, next)
      return next
    })
  }, [])

  const updateRequest = useCallback((requestId: string, updater: (request: ApprovalRequest) => ApprovalRequest) => {
    // Read fresh from localStorage to avoid stale overwrites
    const current = readJSON<ApprovalRequest[]>(REQUESTS_KEY, [])
    const updated = current.map((request) => {
      if (request.id !== requestId) return request
      const result = updater(request)
      return result
    })
    writeJSON(REQUESTS_KEY, updated)
    setRequests(updated)

    // Generate notification
    const oldReq = current.find((r) => r.id === requestId)
    const newReq = updated.find((r) => r.id === requestId)
    if (oldReq && newReq && (oldReq.status !== newReq.status || oldReq.currentStageIndex !== newReq.currentStageIndex)) {
      const action =
        newReq.status === 'Approved' ? 'approved'
          : newReq.status === 'Rejected' ? 'rejected'
            : newReq.status === 'Changes Requested' ? 'requested for changes'
              : newReq.status === 'Waiting for Deputy HOD' ? 'forwarded to Deputy HOD'
                : newReq.status === 'HOD Review' ? 'forwarded to HOD'
                  : 'updated'
      setNotifications((prev) => {
        const next = [
          {
            id: `${Date.now()}-${requestId}`,
            title: 'Request status updated',
            message: `${newReq.title} was ${action}.`,
            type: (newReq.status === 'Rejected' ? 'warning' : 'info') as 'warning' | 'info',
            createdAt: new Date().toISOString(),
            read: false,
          },
          ...prev,
        ]
        writeJSON(NOTIFICATIONS_KEY, next)
        return next
      })
    }
  }, [])

  const addAttachmentToRequest = (requestId: string, attachment: AttachmentItem) => {
    setRequests((prev) => {
      const next = prev.map((request) => request.id === requestId ? { ...request, attachments: [...request.attachments, attachment] } : request)
      writeJSON(REQUESTS_KEY, next)
      return next
    })
  }

  const removeAttachmentFromRequest = (requestId: string, attachmentId: string) => {
    setRequests((prev) => {
      const next = prev.map((request) => request.id === requestId ? { ...request, attachments: request.attachments.filter((attachment) => attachment.id !== attachmentId) } : request)
      writeJSON(REQUESTS_KEY, next)
      return next
    })
  }

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      if (!prev) return null
      const updated = { ...prev, ...updates }
      writeJSON(AUTH_KEY, updated)
      return updated
    })
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === currentUser?.id ? { ...u, ...updates } : u)),
    )
  }

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => {
      const next = prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification))
      writeJSON(NOTIFICATIONS_KEY, next)
      return next
    })
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [currentRole, currentUser, notifications, requests, users, addRequest, updateRequest])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider')
  }
  return context
}

