import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer'
import PublicNavbar from '../components/PublicNavbar'

export default function PublicLayout() {
  return (
    <div className="app public-app">
      <PublicNavbar />
      <main className="public-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
