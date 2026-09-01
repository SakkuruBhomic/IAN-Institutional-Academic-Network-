import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider, useAppContext } from './contexts/AppContext'
import AdminDashboard from './pages/AdminDashboard'
import AdminWorkflowPage from './pages/AdminWorkflowPage'
import FeaturesPage from './pages/FeaturesPage'
import HowItWorksPage from './pages/HowItWorksPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import MyRequestsPage from './pages/MyRequestsPage'
import NewRequestPage from './pages/NewRequestPage'
import NotificationsPage from './pages/NotificationsPage'
import OfficialDashboard from './pages/OfficialDashboard'
import OfficialReviewPage from './pages/OfficialReviewPage'
import ProductPage from './pages/ProductPage'
import RequestDetailsPage from './pages/RequestDetailsPage'
import SettingsPage from './pages/SettingsPage'
import StudentDashboard from './pages/StudentDashboard'
import { useAppStore } from './store/useAppStore'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAppContext()

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function RequireStudentAuth({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAppContext()

  if (!currentUser || currentUser.role !== 'student') {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function RequireOfficialAuth({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAppContext()

  if (!currentUser || !['classCoordinator', 'deputyHOD', 'HOD', 'admin'].includes(currentUser.role)) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  const theme = useAppStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('ian-theme-v1', theme)
  }, [theme])

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/product" element={<ProductPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/dashboard" element={<RequireStudentAuth><StudentDashboard /></RequireStudentAuth>} />
      <Route path="/requests/new" element={<RequireStudentAuth><NewRequestPage /></RequireStudentAuth>} />
      <Route path="/requests" element={<RequireStudentAuth><MyRequestsPage /></RequireStudentAuth>} />
      <Route path="/requests/:id" element={<RequireAuth><RequestDetailsPage /></RequireAuth>} />
      <Route path="/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />

      <Route path="/official" element={<RequireOfficialAuth><OfficialDashboard /></RequireOfficialAuth>} />
      <Route path="/official/requests/:id" element={<RequireOfficialAuth><OfficialReviewPage /></RequireOfficialAuth>} />
      <Route path="/admin" element={<RequireOfficialAuth><AdminDashboard /></RequireOfficialAuth>} />
      <Route path="/admin/workflows" element={<RequireOfficialAuth><AdminWorkflowPage /></RequireOfficialAuth>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  )
}

