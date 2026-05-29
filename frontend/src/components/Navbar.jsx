import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        BookSwap
      </Link>
      <nav>
        <NavLink to="/" end>
          Browse
        </NavLink>
        {isAuthenticated && (user?.role === 'seller' || user?.role === 'admin') && (
          <NavLink to="/sell">Sell a Book</NavLink>
        )}
        {isAuthenticated && (user?.role === 'buyer' || user?.role === 'admin') && (
          <NavLink to="/orders">My Orders</NavLink>
        )}
      </nav>
      <div className="nav-actions">
        {isAuthenticated ? (
          <>
            <span className="user-badge">
              {user.username} ({user.role})
            </span>
            <button type="button" className="btn btn-secondary" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary">
              Log in
            </Link>
            <Link to="/register" className="btn btn-primary">
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
