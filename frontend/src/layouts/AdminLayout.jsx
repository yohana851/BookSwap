import { Outlet } from 'react-router-dom'
import AdminNavbar from '../components/AdminNavbar'

export default function AdminLayout() {
  return (
    <div className="app admin-app">
      <AdminNavbar />
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
