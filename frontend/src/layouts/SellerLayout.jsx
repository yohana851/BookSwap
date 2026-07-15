import { Outlet } from 'react-router-dom'
import SellerNavbar from '../components/SellerNavbar'

export default function SellerLayout() {
  return (
    <div className="app seller-app">
      <SellerNavbar />
      <main className="seller-main">
        <Outlet />
      </main>
    </div>
  )
}
