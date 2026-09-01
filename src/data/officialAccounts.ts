export type OfficialRole = 'classCoordinator' | 'deputyHOD' | 'HOD' | 'admin'

export type OfficialAccount = {
  role: OfficialRole
  username: string
  password: string
  displayName: string
  department?: string
  section?: string
  title?: string
}

export const officialAccounts: OfficialAccount[] = [
  // Class Coordinators (6 Total: Original + 5 New)
  {
    role: 'classCoordinator',
    username: 'coordinator_ai',
    password: '12345678',
    displayName: 'Dr. Rajesh Sharma',
    department: 'Artificial Intelligence',
    section: 'Year 1 - AI',
    title: 'Class Coordinator (AI)',
  },
  {
    role: 'classCoordinator',
    username: 'coordinator',
    password: '12345678',
    displayName: 'Dr. Rajesh Sharma',
    department: 'Artificial Intelligence',
    section: 'Year 1 - AI',
    title: 'Class Coordinator (AI)',
  },
  {
    role: 'classCoordinator',
    username: 'coordinator_cse_a',
    password: '12345678',
    displayName: 'Prof. Priya Nair',
    department: 'Computer Science and Engineering',
    section: 'Year 1 - CSE Sec A',
    title: 'Class Coordinator (CSE-A)',
  },
  {
    role: 'classCoordinator',
    username: 'coordinator_cse_b',
    password: '12345678',
    displayName: 'Dr. Ananya Sen',
    department: 'Computer Science and Engineering',
    section: 'Year 1 - CSE Sec B',
    title: 'Class Coordinator (CSE-B)',
  },
  {
    role: 'classCoordinator',
    username: 'coordinator_cse_c',
    password: '12345678',
    displayName: 'Prof. Vikram Reddy',
    department: 'Computer Science and Engineering',
    section: 'Year 1 - CSE Sec C',
    title: 'Class Coordinator (CSE-C)',
  },
  {
    role: 'classCoordinator',
    username: 'coordinator_ece',
    password: '12345678',
    displayName: 'Dr. Sunita Deshmukh',
    department: 'Electronics and Communication',
    section: 'Year 1 - ECE',
    title: 'Class Coordinator (ECE)',
  },
  {
    role: 'classCoordinator',
    username: 'coordinator_mech',
    password: '12345678',
    displayName: 'Prof. Manoj Kumar',
    department: 'Mechanical Engineering',
    section: 'Year 1 - ME',
    title: 'Class Coordinator (ME)',
  },

  // Deputy HODs (4 Total: Original + 3 New)
  {
    role: 'deputyHOD',
    username: 'deputyhod_ai',
    password: '12345678',
    displayName: 'Dr. K. V. Raman',
    department: 'Artificial Intelligence',
    title: 'Deputy HOD (AI & Data Science)',
  },
  {
    role: 'deputyHOD',
    username: 'deputyhod',
    password: '12345678',
    displayName: 'Dr. K. V. Raman',
    department: 'Artificial Intelligence',
    title: 'Deputy HOD (AI & Data Science)',
  },
  {
    role: 'deputyHOD',
    username: 'deputyhod_cse',
    password: '12345678',
    displayName: 'Dr. Meenakshi Sundaram',
    department: 'Computer Science and Engineering',
    title: 'Deputy HOD (CSE)',
  },
  {
    role: 'deputyHOD',
    username: 'deputyhod_ece',
    password: '12345678',
    displayName: 'Dr. Arvind Swaminathan',
    department: 'Electronics and Communication',
    title: 'Deputy HOD (ECE)',
  },
  {
    role: 'deputyHOD',
    username: 'deputyhod_mech',
    password: '12345678',
    displayName: 'Dr. Suresh Pillai',
    department: 'Mechanical Engineering',
    title: 'Deputy HOD (Mechanical)',
  },

  // HOD & Admin
  {
    role: 'HOD',
    username: 'hod',
    password: '12345678',
    displayName: 'Dr. A. P. Jayaram',
    department: 'School of Computing & AI',
    title: 'Head of Department (HOD)',
  },
  {
    role: 'admin',
    username: 'admin',
    password: '12345678',
    displayName: 'Academic Office Admin',
    department: 'Dean Academics',
    title: 'Academic Dean Office',
  },
]

export function authenticateOfficial(role: OfficialRole, username: string, password: string) {
  const normalizedUsername = username.trim().toLowerCase()
  const normalizedPassword = password.trim()

  if (!normalizedUsername || !normalizedPassword) {
    return null
  }

  return (
    officialAccounts.find(
      (account) =>
        account.role === role &&
        account.username.toLowerCase() === normalizedUsername &&
        account.password === normalizedPassword,
    ) ?? null
  )
}

export function getOfficialByUsername(username: string): OfficialAccount | null {
  const normalized = username.trim().toLowerCase()
  return officialAccounts.find((account) => account.username.toLowerCase() === normalized) ?? null
}

