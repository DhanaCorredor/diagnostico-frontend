import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/organisms/Sidebar'
import Topbar from '../components/organisms/Topbar'

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      {menuOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      <main className="md:ml-60">
        <Topbar onOpenMenu={() => setMenuOpen(true)} />
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
