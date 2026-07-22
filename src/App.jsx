// Mapa de rutas de la app + guardas por rol.
//
// Estructura:
//   /login                     -> pública (LoginPage)
//   todo lo demás              -> dentro de <AppLayout> y protegido por sesión
//   algunas rutas              -> además restringidas por rol (roles=[...])

import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'
import AppLayout from './layouts/AppLayout'
import LoginPage from './pages/LoginPage'
import PanelPage from './pages/PanelPage'
import PacientesPage from './pages/PacientesPage'
import FichaPacientePage from './pages/FichaPacientePage'
import EnConstruccion from './pages/EnConstruccion'

// Roles con acceso a la gestión de recepción (pacientes, agendar…).
const RECEP = ['ADMIN', 'RECEPCION']

export default function App() {
  return (
    <Routes>
      {/* Pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Privadas: exigen sesión y comparten el layout (sidebar + topbar) */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<PanelPage />} />
        <Route path="/agenda" element={<EnConstruccion titulo="Agenda" />} />

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
              <EnConstruccion titulo="Médicos" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citas/nueva"
          element={
            <ProtectedRoute roles={RECEP}>
              <EnConstruccion titulo="Nueva cita" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <EnConstruccion titulo="Usuarios" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/config"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <EnConstruccion titulo="Configuración" />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Cualquier otra ruta -> al panel */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
