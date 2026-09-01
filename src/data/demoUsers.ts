import type { UserProfile } from '../types'

export const demoUsers: Array<Pick<UserProfile, 'rollNo' | 'password' | 'role' | 'name'>> = [
  { rollNo: '26YASHAI', password: '12345678', role: 'student', name: 'Yash' },
  { rollNo: '26BHOCS', password: '12345678', role: 'student', name: 'Bhoomi' },
  { rollNo: '26VARCS', password: '12345678', role: 'student', name: 'Varun' },
  { rollNo: '26JOECS', password: '12345678', role: 'student', name: 'Joe' },
]

export const officialDemoUsers: UserProfile[] = [
  {
    id: 'official-class-coordinator',
    rollNo: 'CC-001',
    name: 'Class Coordinator',
    role: 'classCoordinator',
    branch: 'CSE-1',
    password: 'demo',
    phone: '0000000000',
    photo: 'https://ui-avatars.com/api/?name=Class+Coordinator&background=8b5cf6&color=fff&size=160',
    firstLogin: false,
  },
  {
    id: 'official-deputy-hod',
    rollNo: 'DH-001',
    name: 'Deputy HOD',
    role: 'deputyHOD',
    branch: 'Administration',
    password: 'demo',
    phone: '0000000000',
    photo: 'https://ui-avatars.com/api/?name=Deputy+HOD&background=8b5cf6&color=fff&size=160',
    firstLogin: false,
  },
  {
    id: 'official-hod',
    rollNo: 'HOD-001',
    name: 'HOD',
    role: 'HOD',
    branch: 'Academic Office',
    password: 'demo',
    phone: '0000000000',
    photo: 'https://ui-avatars.com/api/?name=HOD&background=8b5cf6&color=fff&size=160',
    firstLogin: false,
  },
  {
    id: 'official-admin',
    rollNo: 'ADMIN-001',
    name: 'Admin',
    role: 'admin',
    branch: 'Operations',
    password: 'demo',
    phone: '0000000000',
    photo: 'https://ui-avatars.com/api/?name=Admin&background=8b5cf6&color=fff&size=160',
    firstLogin: false,
  },
]

export const allDemoUsers = [
  ...demoUsers.map((person, index) => ({
    id: `student-${index + 1}`,
    rollNo: person.rollNo,
    name: person.name,
    role: person.role,
    branch: 'CSE',
    password: person.password,
    phone: '9000000000',
    photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=8b5cf6&color=fff&size=160`,
    firstLogin: false,
  } as UserProfile)),
  ...officialDemoUsers,
]
