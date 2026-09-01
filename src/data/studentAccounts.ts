export type StudentAccount = {
  rollNumber: string
  aliases?: string[]
  password: string
  name: string
  role: 'student'
  department: string
  section: string
  year: number
  email: string
  assignedCoordinatorId: string
  assignedCoordinatorName: string
  assignedDeputyHODId: string
  assignedDeputyHODName: string
  assignedHODName: string
}

export const studentAccounts: StudentAccount[] = [
  {
    rollNumber: '24CS1042',
    aliases: ['26BHOCS', 'BHOMIC'],
    password: '12345678',
    name: 'Sakkuru Bhomic',
    role: 'student',
    department: 'Computer Science and Engineering',
    section: 'CSE Sec A - Year 1',
    year: 1,
    email: '24cs1042@college.edu',
    assignedCoordinatorId: 'coordinator_cse_a',
    assignedCoordinatorName: 'Prof. Priya Nair',
    assignedDeputyHODId: 'deputyhod_cse',
    assignedDeputyHODName: 'Dr. Meenakshi Sundaram',
    assignedHODName: 'Dr. A. P. Jayaram',
  },
  {
    rollNumber: '24AI2089',
    aliases: ['26YASHAI', 'YASHIKA'],
    password: '12345678',
    name: 'J Yashika',
    role: 'student',
    department: 'Artificial Intelligence',
    section: 'AI & DS - Year 1',
    year: 1,
    email: '24ai2089@college.edu',
    assignedCoordinatorId: 'coordinator_ai',
    assignedCoordinatorName: 'Dr. Rajesh Sharma',
    assignedDeputyHODId: 'deputyhod_ai',
    assignedDeputyHODName: 'Dr. K. V. Raman',
    assignedHODName: 'Dr. A. P. Jayaram',
  },
  {
    rollNumber: '24CS3015',
    aliases: ['26VARCS', 'VARSHITA'],
    password: '12345678',
    name: 'Varshita',
    role: 'student',
    department: 'Computer Science and Engineering',
    section: 'CSE Sec B - Year 1',
    year: 1,
    email: '24cs3015@college.edu',
    assignedCoordinatorId: 'coordinator_cse_b',
    assignedCoordinatorName: 'Dr. Ananya Sen',
    assignedDeputyHODId: 'deputyhod_cse',
    assignedDeputyHODName: 'Dr. Meenakshi Sundaram',
    assignedHODName: 'Dr. A. P. Jayaram',
  },
  {
    rollNumber: '24CS4078',
    aliases: ['26JOECS', 'JOEL'],
    password: '12345678',
    name: 'Joel',
    role: 'student',
    department: 'Computer Science and Engineering',
    section: 'CSE Sec C - Year 1',
    year: 1,
    email: '24cs4078@college.edu',
    assignedCoordinatorId: 'coordinator_cse_c',
    assignedCoordinatorName: 'Prof. Vikram Reddy',
    assignedDeputyHODId: 'deputyhod_cse',
    assignedDeputyHODName: 'Dr. Meenakshi Sundaram',
    assignedHODName: 'Dr. A. P. Jayaram',
  },
]

export const studentRoster = studentAccounts.map((account) => ({
  ...account,
  rollNo: account.rollNumber,
  photo:
    account.rollNumber === '24CS1042'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      : account.rollNumber === '24AI2089'
        ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
        : account.rollNumber === '24CS3015'
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
}))

export function getStudentByRoll(rollNumber: string): StudentAccount | null {
  const normalized = rollNumber.trim().toUpperCase()
  return (
    studentAccounts.find(
      (account) =>
        account.rollNumber.toUpperCase() === normalized ||
        account.aliases?.some((alias) => alias.toUpperCase() === normalized),
    ) ?? null
  )
}

export function authenticateStudent(rollNumber: string, password: string): StudentAccount | null {
  const normalizedRollNumber = rollNumber.trim().toUpperCase()
  const normalizedPassword = password.trim()

  if (!normalizedRollNumber || !normalizedPassword) {
    return null
  }

  return (
    studentAccounts.find(
      (account) =>
        (account.rollNumber.toUpperCase() === normalizedRollNumber ||
          account.aliases?.some((alias) => alias.toUpperCase() === normalizedRollNumber)) &&
        account.password === normalizedPassword,
    ) ?? null
  )
}



