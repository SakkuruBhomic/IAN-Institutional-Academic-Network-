import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  KeyRound,
  Lock,
  Save,
  Trash2,
  Upload,
  User,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/ui/AppShell'
import { useAppContext } from '../contexts/AppContext'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { currentUser, updateUserProfile } = useAppContext()

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile')

  // Form state initialized with currentUser
  const [name, setName] = useState(currentUser?.name ?? '')
  const [email, setEmail] = useState(currentUser?.email ?? '')
  const [phone, setPhone] = useState(currentUser?.phone ?? '')
  const [department, setDepartment] = useState(currentUser?.department ?? '')
  const [photoPreview, setPhotoPreview] = useState<string | null>(currentUser?.photo ?? null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  if (!currentUser) {
    return (
      <AppShell>
        <div className="rounded-2xl border border-white/8 bg-[#12151b] p-8 text-center text-zinc-300">
          Please log in to manage your settings.
        </div>
      </AppShell>
    )
  }

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, JPEG, WEBP).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size must be less than 5MB.')
      return
    }

    setErrorMessage('')
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPhotoPreview(result)
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const handleRemovePhoto = () => {
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=8b5cf6&color=fff&size=200`
    setPhotoPreview(defaultAvatar)
    updateUserProfile({ photo: defaultAvatar })
    setSuccessMessage('Profile photo removed.')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setErrorMessage('Name cannot be empty.')
      return
    }

    updateUserProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      department: department.trim(),
      photo: photoPreview ?? currentUser.photo,
    })

    setErrorMessage('')
    setSuccessMessage('Profile updated successfully!')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword) {
      setErrorMessage('Please enter your current password.')
      return
    }
    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match.')
      return
    }

    updateUserProfile({ password: newPassword })
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setErrorMessage('')
    setSuccessMessage('Password changed successfully!')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(currentUser.role === 'student' ? '/dashboard' : '/official')}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-[#12151b] text-zinc-300 hover:bg-[#181c24] transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400">Settings</p>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-white md:text-3xl">
              Account & Profile
            </h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('profile')
              setErrorMessage('')
            }}
            className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-semibold transition ${
              activeTab === 'profile'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                : 'border border-white/8 bg-[#12151b] text-zinc-400 hover:text-white'
            }`}
          >
            <User className="h-4 w-4" /> Profile & Identity
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('security')
              setErrorMessage('')
            }}
            className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-semibold transition ${
              activeTab === 'security'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                : 'border border-white/8 bg-[#12151b] text-zinc-400 hover:text-white'
            }`}
          >
            <Lock className="h-4 w-4" /> Security & Password
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {successMessage && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-medium text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-200">
              {errorMessage}
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Photo Upload Card */}
              <div className="rounded-2xl border border-white/8 bg-[#12151b] p-6 shadow-sm">
                <h2 className="text-base font-bold text-white mb-4">Profile Photo</h2>
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative group">
                    <img
                      src={photoPreview ?? currentUser.photo}
                      alt={currentUser.name}
                      className="h-24 w-24 rounded-2xl border-2 border-violet-500/40 object-cover shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-semibold"
                    >
                      <Camera className="h-5 w-5 mb-1 text-violet-300" /> Change
                    </button>
                  </div>

                  <div className="space-y-2 text-center sm:text-left">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0d1015] px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:bg-[#181c24] hover:text-white transition"
                      >
                        <Upload className="h-3.5 w-3.5" /> Upload New Photo
                      </button>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Recommended: Square JPG or PNG, under 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="rounded-2xl border border-white/8 bg-[#12151b] p-6 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-white">Personal Information</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-white/8 bg-[#0d1015] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-violet-500 transition"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Roll / Identifier
                    </label>
                    <input
                      type="text"
                      value={currentUser.rollNo}
                      disabled
                      className="w-full rounded-xl border border-white/6 bg-[#0d1015]/60 px-3.5 py-2.5 text-xs text-zinc-400 cursor-not-allowed font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/8 bg-[#0d1015] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-violet-500 transition"
                      placeholder="e.g. name@college.edu"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-white/8 bg-[#0d1015] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-violet-500 transition"
                      placeholder="e.g. +91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Department / Section
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full rounded-xl border border-white/8 bg-[#0d1015] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-violet-500 transition"
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 transition"
                  >
                    <Save className="h-3.5 w-3.5" /> Save Profile Changes
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleSavePassword} className="rounded-2xl border border-white/8 bg-[#12151b] p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-white">Change Password</h2>
              <p className="text-xs text-zinc-400">
                Default password for all accounts is <span className="font-mono text-violet-300">12345678</span>.
              </p>

              <div className="space-y-3 max-w-md">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/8 bg-[#0d1015] px-3.5 py-2.5 text-xs text-white outline-none focus:border-violet-500 transition"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/8 bg-[#0d1015] px-3.5 py-2.5 text-xs text-white outline-none focus:border-violet-500 transition"
                    placeholder="At least 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/8 bg-[#0d1015] px-3.5 py-2.5 text-xs text-white outline-none focus:border-violet-500 transition"
                    placeholder="Re-enter new password"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 transition"
                  >
                    <KeyRound className="h-3.5 w-3.5" /> Update Password
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </AppShell>
  )
}

