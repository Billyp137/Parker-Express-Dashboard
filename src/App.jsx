import { Routes, Route, Navigate } from 'react-router-dom'
import AdminPage from './pages/AdminPage'
import ClientDashboard from './pages/ClientDashboard'
import LoginPage from './pages/LoginPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/client/:token" element={<ClientDashboard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}
