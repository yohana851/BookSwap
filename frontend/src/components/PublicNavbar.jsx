import { Link } from 'react-router-dom'

const links = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#categories', label: 'Categories' },
  { href: '#how-it-works', label: 'How It Works' },
]

export default function PublicNavbar() {
  return (
    <header className="navbar public-navbar">
      <Link to="/" className="brand">
        <span className="brand-icon">📚</span>
        BookSwap
      </Link>
      <nav>
        {links.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <div className="nav-actions">
        <Link to="/login/user" className="btn btn-ghost">
          Sign In
        </Link>
        <Link to="/register/user" className="btn btn-primary">
          Get Started
        </Link>
      </div>
    </header>
  )
}
