import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const sectionLinks = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#categories', label: 'Categories' },
  { href: '#how-it-works', label: 'How It Works' },
]

export default function UserNavbar() {
  const { user, logout } = useAuth()

  return (
    <header className="navbar user-navbar">
      <Link to="/user" className="brand">
        <span className="brand-icon">📚</span>
        BookSwap
      </Link>
      <nav>
        {sectionLinks.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
        <Link to="/user#books">Buy Books</Link>
        <NavLink to="/orders">My Orders</NavLink>
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
