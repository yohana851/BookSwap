import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <Link to="/" className="brand footer-brand">
            <span className="brand-icon">📚</span>
            BookSwap
          </Link>
          <p className="muted">Your trusted marketplace for second-hand books.</p>
        </div>
        <div className="footer-links">
          <Link to="/login">Sign In</Link>
          <Link to="/register?role=buyer">Register as Buyer</Link>
          <Link to="/register?role=seller">Register as Seller</Link>
        </div>
      </div>
      <p className="footer-copy muted">© {new Date().getFullYear()} BookSwap. All rights reserved.</p>
    </footer>
  )
}
