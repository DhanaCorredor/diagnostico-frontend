import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'
import AppLayout from './layouts/AppLayout'
import LoginPage from './pages/LoginPage'
import PanelPage from './pages/PanelPage'
import AgendaPage from './pages/AgendaPage'
import PacientesPage from './pages/PacientesPage'
import FichaPacientePage from './pages/FichaPacientePage'
import MedicosPage from './pages/MedicosPage'
import NuevaCitaPage from './pages/NuevaCitaPage'
import UsuariosPage from './pages/UsuariosPage'
import ConfigPage from './pages/ConfigPage'

const RECEP = ['ADMIN', 'RECEPCION']

export default function App() {
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
              <PacientesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pacientes/:id"
          element={
            <ProtectedRoute roles={RECEP}>
              <FichaPacientePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medicos"
          element={
            <ProtectedRoute roles={RECEP}>
              <MedicosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citas/nueva"
          element={
            <ProtectedRoute roles={RECEP}>
              <NuevaCitaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <UsuariosPage />
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
