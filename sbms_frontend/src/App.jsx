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
import { LandingPage } from './pages/LandingPage'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const storedUser = localStorage.getItem('sbms_user');
  if (!storedUser) return <Navigate to="/auth" />;

  const user = JSON.parse(storedUser);
  if (requireAdmin && user.role !== 'Admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";

import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <ThemeProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <UserDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/applications" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MyApplications />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/search" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SchemeSearch />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <UserProfile />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/grievances" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MyGrievances />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute requireAdmin={true}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin-grievances" element={
              <ProtectedRoute requireAdmin={true}>
                <DashboardLayout>
                  <AdminGrievances />
                </DashboardLayout>
              </ProtectedRoute>
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
