import { Link, useLocation } from 'react-router-dom'

const links = [
  { hash: '#home', label: 'Home' },
  { hash: '#about', label: 'About' },
  { hash: '#services', label: 'Services' },
  { hash: '#categories', label: 'Categories' },
  { hash: '#how-it-works', label: 'How It Works' },
]

export default function PublicNavbar() {
  const { pathname, hash } = useLocation()
  const isLandingPage = pathname === '/'
  const isSectionActive = (sectionHash) => isLandingPage && (hash || '#home') === sectionHash
  const currentPageLabel = pathname.startsWith('/books/') ? 'Book Details' : null

  return (
    <header className="navbar public-navbar">
      <Link to="/" className="brand">
        <span className="brand-icon">📚</span>
        BookSwap
      </Link>
      <nav>
        {links.map((link) => (
          <Link
            key={link.hash}
            to={`/${link.hash}`}
            className={isSectionActive(link.hash) ? 'active' : undefined}
            aria-current={isSectionActive(link.hash) ? 'page' : undefined}
          >
            {link.label}
          </Link>
        ))}
        {currentPageLabel && (
          <span className="nav-current" aria-current="page">
            {currentPageLabel}
          </span>
        )}
      </nav>
      <div className="nav-actions">
        <Link to="/login" className="btn btn-ghost">
          Sign In
        </Link>
        <Link to="/register" className="btn btn-primary">
          Get Started
        </Link>
      </div>
    </header>
  )
}
