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
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
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
  addRequest: (request: ApprovalRequest) => Promise<{ ok: boolean; message?: string }>
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

/* ──────────── localStorage helpers (fallback when Supabase isn't configured) ──────────── */

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

/* ──────────── Supabase row <-> app-model mappers ──────────── */

interface RequestRow {
  id: string
  title: string
  student: string
  student_roll_no: string
  student_branch: string
  student_photo: string
  category: string
  description: string
  ai_summary: string
  generated_letter: string | null
  status: string
  current_stage_index: number
  request_type: string
  workflow: string[]
  documents: string[]
  attachments: AttachmentItem[]
  comments: ApprovalRequest['comments']
  timeline: ApprovalRequest['timeline']
  student_email: string | null
  assigned_coordinator_id: string | null
  assigned_coordinator_name: string | null
  assigned_deputy_hod_id: string | null
  assigned_deputy_hod_name: string | null
  assigned_hod_name: string | null
  urgency: string | null
  created_at: string
  updated_at: string
}

function mapRequestRowToApp(row: RequestRow): ApprovalRequest {
  return {
    id: row.id,
    title: row.title,
    student: row.student,
    studentRollNo: row.student_roll_no,
    studentBranch: row.student_branch,
    studentPhoto: row.student_photo,
    category: row.category,
    description: row.description,
    aiSummary: row.ai_summary,
    generatedLetter: row.generated_letter ?? undefined,
    status: row.status as ApprovalRequest['status'],
    currentStageIndex: row.current_stage_index,
    requestType: row.request_type,
    workflow: row.workflow ?? [],
    documents: row.documents ?? [],
    attachments: row.attachments ?? [],
    comments: row.comments ?? [],
    timeline: row.timeline ?? [],
    studentEmail: row.student_email ?? undefined,
    assignedCoordinatorId: row.assigned_coordinator_id ?? undefined,
    assignedCoordinatorName: row.assigned_coordinator_name ?? undefined,
    assignedDeputyHODId: row.assigned_deputy_hod_id ?? undefined,
    assignedDeputyHODName: row.assigned_deputy_hod_name ?? undefined,
    assignedHODName: row.assigned_hod_name ?? undefined,
    urgency: (row.urgency as ApprovalRequest['urgency']) ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapAppRequestToRow(request: ApprovalRequest): RequestRow {
  return {
    id: request.id,
    title: request.title,
    student: request.student,
    student_roll_no: request.studentRollNo,
    student_branch: request.studentBranch,
    student_photo: request.studentPhoto,
    category: request.category,
    description: request.description,
    ai_summary: request.aiSummary,
    generated_letter: request.generatedLetter ?? null,
    status: request.status,
    current_stage_index: request.currentStageIndex,
    request_type: request.requestType,
    workflow: request.workflow,
    documents: request.documents,
    attachments: request.attachments,
    comments: request.comments,
    timeline: request.timeline,
    student_email: request.studentEmail ?? null,
    assigned_coordinator_id: request.assignedCoordinatorId ?? null,
    assigned_coordinator_name: request.assignedCoordinatorName ?? null,
    assigned_deputy_hod_id: request.assignedDeputyHODId ?? null,
    assigned_deputy_hod_name: request.assignedDeputyHODName ?? null,
    assigned_hod_name: request.assignedHODName ?? null,
    urgency: request.urgency ?? null,
    created_at: request.createdAt,
    updated_at: request.updatedAt,
  }
}

interface NotificationRow {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  created_at: string
}

function mapNotificationRowToApp(row: NotificationRow): NotificationItem {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type as NotificationItem['type'],
    read: row.read,
    createdAt: row.created_at,
  }
}

function mapAppNotificationToRow(notification: NotificationItem): NotificationRow {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    read: notification.read,
    created_at: notification.createdAt,
  }
}

interface UserRow {
  id: string
  roll_no: string
  name: string
  role: string
  branch: string | null
  password: string | null
  phone: string | null
  photo: string | null
  department: string | null
  year: number | null
  email: string | null
  class_coordinator: string | null
  deputy_hod: string | null
  first_login: boolean
}

function mapUserRowToApp(row: UserRow): UserProfile {
  return {
    id: row.id,
    rollNo: row.roll_no,
    name: row.name,
    role: row.role as Role,
    branch: row.branch ?? '',
    password: row.password ?? '',
    phone: row.phone ?? '',
    photo: row.photo ?? '',
    department: row.department ?? undefined,
    year: row.year ?? undefined,
    email: row.email ?? undefined,
    classCoordinator: row.class_coordinator ?? undefined,
    deputyHOD: row.deputy_hod ?? undefined,
    firstLogin: row.first_login,
  }
}

function mapAppUserToRow(user: UserProfile): UserRow {
  return {
    id: user.id,
    roll_no: user.rollNo,
    name: user.name,
    role: user.role,
    branch: user.branch ?? null,
    password: user.password ?? null,
    phone: user.phone ?? null,
    photo: user.photo ?? null,
    department: user.department ?? null,
    year: user.year ?? null,
    email: user.email ?? null,
    class_coordinator: user.classCoordinator ?? null,
    deputy_hod: user.deputyHOD ?? null,
    first_login: user.firstLogin,
  }
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

  /* ── Persist session locally (per-device; login itself is a static check, not Supabase Auth) ── */
  useEffect(() => {
    if (currentUser) writeJSON(AUTH_KEY, currentUser)
    else localStorage.removeItem(AUTH_KEY)
  }, [currentUser])

  /* ══════════════ Supabase mode: shared cross-device data ══════════════ */

  /* ── Initial load from Supabase ── */
  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    void (async () => {
      const [requestsRes, notificationsRes, usersRes] = await Promise.all([
        supabase.from('requests').select('*').order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }),
        supabase.from('users').select('*'),
      ])
      if (cancelled) return

      if (requestsRes.error) console.error('[IAN] Failed to load requests from Supabase:', requestsRes.error)
      else setRequests((requestsRes.data as RequestRow[]).map(mapRequestRowToApp))

      if (notificationsRes.error) console.error('[IAN] Failed to load notifications from Supabase:', notificationsRes.error)
      else setNotifications((notificationsRes.data as NotificationRow[]).map(mapNotificationRowToApp))

      if (usersRes.error) console.error('[IAN] Failed to load users from Supabase:', usersRes.error)
      else if (usersRes.data && usersRes.data.length > 0) setUsers((usersRes.data as UserRow[]).map(mapUserRowToApp))
    })()
    return () => {
      cancelled = true
    }
  }, [])

  /* ── Realtime subscriptions: live cross-device updates ── */
  useEffect(() => {
    if (!isSupabaseConfigured) return

    const channel = supabase
      .channel('ian-live-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const deletedId = (payload.old as { id: string }).id
          setRequests((prev) => prev.filter((request) => request.id !== deletedId))
          return
        }
        const row = mapRequestRowToApp(payload.new as RequestRow)
        setRequests((prev) => (prev.some((request) => request.id === row.id)
          ? prev.map((request) => (request.id === row.id ? row : request))
          : [row, ...prev]))
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const deletedId = (payload.old as { id: string }).id
          setNotifications((prev) => prev.filter((notification) => notification.id !== deletedId))
          return
        }
        const row = mapNotificationRowToApp(payload.new as NotificationRow)
        setNotifications((prev) => (prev.some((notification) => notification.id === row.id)
          ? prev.map((notification) => (notification.id === row.id ? row : notification))
          : [row, ...prev]))
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const deletedId = (payload.old as { id: string }).id
          setUsers((prev) => prev.filter((user) => user.id !== deletedId))
          return
        }
        const row = mapUserRowToApp(payload.new as UserRow)
        setUsers((prev) => (prev.some((user) => user.id === row.id)
          ? prev.map((user) => (user.id === row.id ? row : user))
          : [...prev, row]))
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
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

    const updatedUser = { ...user, password, firstLogin: false }
    setUsers((prev) => prev.map((item) => item.rollNo === normalizedRoll ? updatedUser : item))
    setCurrentUser(updatedUser)

    if (isSupabaseConfigured) {
      void supabase.from('users').upsert(mapAppUserToRow(updatedUser)).then(({ error }) => {
        if (error) console.error('[IAN] Failed to persist password change to Supabase:', error)
      })
    } else {
      writeJSON(USERS_KEY, users.map((item) => item.rollNo === normalizedRoll ? updatedUser : item))
    }

    return { ok: true, message: 'Password created successfully.' }
  }

  const addRequest = useCallback(async (request: ApprovalRequest) => {
    setRequests((prev) => [request, ...prev])

    const notification: NotificationItem = {
      id: `${Date.now()}`,
      title: 'Request submitted',
      message: `${request.title} has been submitted and is now awaiting approval.`,
      type: 'success',
      createdAt: new Date().toISOString(),
      read: false,
    }
    setNotifications((prev) => [notification, ...prev])

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('requests').insert(mapAppRequestToRow(request))
      if (error) {
        console.error('[IAN] Failed to save request to Supabase:', error)
        // Roll back the optimistic update — the request never actually made it
        // to the shared database, so no other device/reviewer will ever see it.
        setRequests((prev) => prev.filter((item) => item.id !== request.id))
        setNotifications((prev) => prev.filter((item) => item.id !== notification.id))
        return {
          ok: false,
          message: error.code === '23505'
            ? 'That request ID is already in use. Please try submitting again.'
            : 'Failed to submit your request. Please check your connection and try again.',
        }
      }
      void supabase.from('notifications').insert(mapAppNotificationToRow(notification)).then(({ error: notificationError }) => {
        if (notificationError) console.error('[IAN] Failed to save notification to Supabase:', notificationError)
      })
    } else {
      const currentRequests = readJSON<ApprovalRequest[]>(REQUESTS_KEY, [])
      writeJSON(REQUESTS_KEY, [request, ...currentRequests])
      const currentNotifications = readJSON<NotificationItem[]>(NOTIFICATIONS_KEY, [])
      writeJSON(NOTIFICATIONS_KEY, [notification, ...currentNotifications])
    }

    return { ok: true }
  }, [])

  const updateRequest = useCallback((requestId: string, updater: (request: ApprovalRequest) => ApprovalRequest) => {
    const source = isSupabaseConfigured ? requests : readJSON<ApprovalRequest[]>(REQUESTS_KEY, requests)
    const oldRequest = source.find((request) => request.id === requestId)
    if (!oldRequest) return
    const newRequest = updater(oldRequest)
    const nextRequests = source.map((request) => (request.id === requestId ? newRequest : request))

    setRequests(nextRequests)

    let notification: NotificationItem | null = null
    if (oldRequest.status !== newRequest.status || oldRequest.currentStageIndex !== newRequest.currentStageIndex) {
      const action =
        newRequest.status === 'Approved' ? 'approved'
          : newRequest.status === 'Rejected' ? 'rejected'
            : newRequest.status === 'Changes Requested' ? 'requested for changes'
              : newRequest.status === 'Waiting for Deputy HOD' ? 'forwarded to Deputy HOD'
                : newRequest.status === 'HOD Review' ? 'forwarded to HOD'
                  : 'updated'
      notification = {
        id: `${Date.now()}-${requestId}`,
        title: 'Request status updated',
        message: `${newRequest.title} was ${action}.`,
        type: newRequest.status === 'Rejected' ? 'warning' : 'info',
        createdAt: new Date().toISOString(),
        read: false,
      }
      setNotifications((prev) => [notification as NotificationItem, ...prev])
    }

    if (isSupabaseConfigured) {
      void supabase.from('requests').update(mapAppRequestToRow(newRequest)).eq('id', requestId).then(({ error }) => {
        if (error) console.error('[IAN] Failed to update request in Supabase:', error)
      })
      if (notification) {
        void supabase.from('notifications').insert(mapAppNotificationToRow(notification)).then(({ error }) => {
          if (error) console.error('[IAN] Failed to save notification to Supabase:', error)
        })
      }
    } else {
      writeJSON(REQUESTS_KEY, nextRequests)
      if (notification) {
        const currentNotifications = readJSON<NotificationItem[]>(NOTIFICATIONS_KEY, [])
        writeJSON(NOTIFICATIONS_KEY, [notification, ...currentNotifications])
      }
    }
  }, [requests])

  const addAttachmentToRequest = (requestId: string, attachment: AttachmentItem) => {
    setRequests((prev) => {
      const next = prev.map((request) => request.id === requestId ? { ...request, attachments: [...request.attachments, attachment] } : request)
      const updated = next.find((request) => request.id === requestId)
      if (isSupabaseConfigured && updated) {
        void supabase.from('requests').update({ attachments: updated.attachments, documents: updated.documents }).eq('id', requestId).then(({ error }) => {
          if (error) console.error('[IAN] Failed to save attachment to Supabase:', error)
        })
      } else {
        writeJSON(REQUESTS_KEY, next)
      }
      return next
    })
  }

  const removeAttachmentFromRequest = (requestId: string, attachmentId: string) => {
    setRequests((prev) => {
      const next = prev.map((request) => request.id === requestId ? { ...request, attachments: request.attachments.filter((attachment) => attachment.id !== attachmentId) } : request)
      const updated = next.find((request) => request.id === requestId)
      if (isSupabaseConfigured && updated) {
        void supabase.from('requests').update({ attachments: updated.attachments }).eq('id', requestId).then(({ error }) => {
          if (error) console.error('[IAN] Failed to remove attachment in Supabase:', error)
        })
      } else {
        writeJSON(REQUESTS_KEY, next)
      }
      return next
    })
  }

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      if (!prev) return null
      const updated = { ...prev, ...updates }
      writeJSON(AUTH_KEY, updated)
      if (isSupabaseConfigured) {
        void supabase.from('users').upsert(mapAppUserToRow(updated)).then(({ error }) => {
          if (error) console.error('[IAN] Failed to save profile to Supabase:', error)
        })
      }
      return updated
    })
    setUsers((prevUsers) => {
      const exists = prevUsers.some((item) => item.id === currentUser?.id)
      const next = exists
        ? prevUsers.map((item) => (item.id === currentUser?.id ? { ...item, ...updates } : item))
        : currentUser
          ? [...prevUsers, { ...currentUser, ...updates }]
          : prevUsers
      if (!isSupabaseConfigured) writeJSON(USERS_KEY, next)
      return next
    })
  }

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => {
      const next = prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification))
      if (!isSupabaseConfigured) writeJSON(NOTIFICATIONS_KEY, next)
      return next
    })
    if (isSupabaseConfigured) {
      void supabase.from('notifications').update({ read: true }).eq('id', id).then(({ error }) => {
        if (error) console.error('[IAN] Failed to mark notification read in Supabase:', error)
      })
    }
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
