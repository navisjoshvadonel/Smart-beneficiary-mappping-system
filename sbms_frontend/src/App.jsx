import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import './styles/futuristic.css'
import { Moon, Sun } from 'lucide-react'
import { DashboardLayout } from './layouts/DashboardLayout'
import { UserDashboard } from './pages/UserDashboard'
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminGrievances } from './pages/AdminGrievances'
import { AuthPage } from './pages/AuthPage'
import { MyApplications } from './pages/MyApplications'
import { MyGrievances } from './pages/MyGrievances'
import { SchemeSearch } from './pages/SchemeSearch'
import { UserProfile } from './pages/UserProfile'
import { GoogleOAuthProvider } from '@react-oauth/google'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";

function App() {
  return (
    <ThemeProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/dashboard" element={
              <DashboardLayout>
                <UserDashboard />
              </DashboardLayout>
            } />
            <Route path="/applications" element={
              <DashboardLayout>
                <MyApplications />
              </DashboardLayout>
            } />
            <Route path="/search" element={
              <DashboardLayout>
                <SchemeSearch />
              </DashboardLayout>
            } />
            <Route path="/profile" element={
              <DashboardLayout>
                <UserProfile />
              </DashboardLayout>
            } />
            <Route path="/grievances" element={
              <DashboardLayout>
                <MyGrievances />
              </DashboardLayout>
            } />
            <Route path="/analytics" element={
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            } />
            <Route path="/admin-grievances" element={
              <DashboardLayout>
                <AdminGrievances />
              </DashboardLayout>
            } />
            {/* Fallback routes for demo */}
            <Route path="*" element={
              <DashboardLayout>
                <div className="flex items-center justify-center min-h-[50vh]">
                  <h1 className="text-2xl text-textMuted">Module Inactive</h1>
                </div>
              </DashboardLayout>
            } />
          </Routes>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ThemeProvider>
  )
}

export default App
