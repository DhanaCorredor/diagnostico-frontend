import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'
import AppLayout from './layouts/AppLayout'
import LoginPage from './pages/LoginPage'
import PanelPage from './pages/PanelPage'
import AgendaPage from './pages/AgendaPage'
import PatientsPage from './pages/PatientsPage'
import PatientFilePage from './pages/PatientFilePage'
import DoctorsPage from './pages/DoctorsPage'
import NewAppointmentPage from './pages/NewAppointmentPage'
import UsersPage from './pages/UsersPage'
import ConfigPage from './pages/ConfigPage'

const RECEP = ['ADMIN', 'RECEPCION']

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<PanelPage />} />
        <Route path="/agenda" element={<AgendaPage />} />

        <Route
          path="/pacientes"
          element={
            <ProtectedRoute roles={RECEP}>
              <PatientsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pacientes/:id"
          element={
            <ProtectedRoute roles={RECEP}>
              <PatientFilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medicos"
          element={
            <ProtectedRoute roles={RECEP}>
              <DoctorsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citas/nueva"
          element={
            <ProtectedRoute roles={RECEP}>
              <NewAppointmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/config"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <ConfigPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
