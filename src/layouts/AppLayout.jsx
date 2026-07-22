// Plantilla de la app tras el login: Sidebar + Topbar + área de contenido.
// El <Outlet /> es el hueco donde React Router pinta la página de cada ruta.

import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

export default function AppLayout() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="ml-60">
        <Topbar />
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
