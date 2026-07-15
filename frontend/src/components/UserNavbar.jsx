import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useShop } from '../context/ShopContext'

export default function UserNavbar() {
  const { user, logout } = useAuth()
  const { cartCount, wishlistCount } = useShop()

  return (
    <header className="navbar user-navbar">
      <Link to="/user" className="brand">
        <span className="brand-icon">📚</span>
        BookSwap
      </Link>
      <nav>
        <NavLink to="/user" end>
          Buy Books
        </NavLink>
        <NavLink to="/orders">My Orders</NavLink>
        {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
      </nav>
      <div className="nav-actions">
        <NavLink to="/wishlist" className="nav-icon-link" title="Wishlist">
          ♥{wishlistCount > 0 && <span className="nav-badge">{wishlistCount}</span>}
        </NavLink>
        <NavLink to="/cart" className="nav-icon-link" title="Cart">
          🛒{cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
        </NavLink>
        <span className="user-badge">Hi, {user?.username}</span>
        <button type="button" className="btn btn-secondary" onClick={logout}>
          Log out
        </button>
      </div>
    </header>
  )
}
