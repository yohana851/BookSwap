import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import bookswapLogo from '../assets/bookswap-logo.svg'

export default function AdminNavbar() {
  const { user, logout } = useAuth()

  return (
    <header className="navbar admin-navbar">
      <Link to="/admin" className="brand">
        <img src={bookswapLogo} alt="" className="brand-logo" aria-hidden="true" />
        BookSwap Admin
      </Link>
      <nav>
        <NavLink to="/admin" end>
          Dashboard
        </NavLink>
        <NavLink to="/admin/users">Users</NavLink>
        <NavLink to="/admin/books">Books</NavLink>
        <NavLink to="/admin/orders">Orders</NavLink>
        <NavLink to="/admin/categories">Categories</NavLink>
      </nav>
      <div className="nav-actions">
        <Link to="/user" className="btn btn-ghost">
          Buyer view
        </Link>
        <Link to="/seller" className="btn btn-ghost">
          Seller view
        </Link>
        <span className="user-badge">{user?.username}</span>
        <button type="button" className="btn btn-secondary" onClick={logout}>
          Log out
        </button>
      </div>
    </header>
  )
}
