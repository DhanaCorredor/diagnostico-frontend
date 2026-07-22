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
