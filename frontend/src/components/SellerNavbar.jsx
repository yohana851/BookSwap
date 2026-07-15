import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SellerNavbar() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const isListingsActive = pathname === '/seller/listings' || pathname.startsWith('/seller/edit/')

  return (
    <header className="navbar seller-navbar">
      <Link to="/seller" className="brand">
        <span className="brand-icon">📚</span>
        BookSwap Seller
      </Link>
      <nav>
        <NavLink to="/seller" end>
          Dashboard
        </NavLink>
        <NavLink
          to="/seller/listings"
          className={isListingsActive ? 'active' : undefined}
          aria-current={isListingsActive ? 'page' : undefined}
        >
          My Listings
        </NavLink>
        <NavLink to="/seller/orders">Orders</NavLink>
        <NavLink to="/sell">List a Book</NavLink>
        {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
      </nav>
      <div className="nav-actions">
        <span className="user-badge">Hi, {user?.username}</span>
        <button type="button" className="btn btn-secondary" onClick={logout}>
          Log out
        </button>
      </div>
    </header>
  )
}
