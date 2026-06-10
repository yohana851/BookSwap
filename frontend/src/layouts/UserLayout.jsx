import { Outlet } from 'react-router-dom'
import UserNavbar from '../components/UserNavbar'

export default function UserLayout() {
  return (
    <div className="app user-app">
      <UserNavbar />
      <main className="user-main">
        <Outlet />
      </main>
    </div>
  )
}
