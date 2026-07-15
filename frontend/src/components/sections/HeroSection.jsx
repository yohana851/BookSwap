import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'

export default function HeroSection({ isAuthenticated = false }) {
  const [stats, setStats] = useState({ books: 0, orders: 0, categories: 0 })

  useEffect(() => {
    Promise.all([api.getBooks(), api.getOrders(), api.getCategories()])
      .then(([books, orders, categories]) => {
        setStats({
          books: books.length,
          orders: orders.length,
          categories: categories.length,
        })
      })
      .catch(() => {})
  }, [])

  return (
    <section id="home" className="hero-section">
      <div className="hero-content">
        <span className="hero-badge">Used books, new stories</span>
        <h1>
          Swap, buy &amp; discover
          <br />
          <span className="text-gradient">pre-loved books</span>
        </h1>
        <p className="hero-subtitle">
          BookSwap connects readers and sellers in one simple marketplace. Find affordable
          titles, support sustainable reading, and give your books a second life.
        </p>
        <div className="hero-actions">
          {isAuthenticated ? (
            <a href="#books" className="btn btn-primary btn-lg">
              Browse &amp; Buy Books
            </a>
          ) : (
            <>
              <Link to="/register?role=buyer" className="btn btn-primary btn-lg">
                Start as Buyer
              </Link>
              <Link to="/register?role=seller" className="btn btn-outline btn-lg">
                Sell Your Books
              </Link>
            </>
          )}
        </div>
        <div className="hero-stats">
          <div>
            <strong>{stats.books}</strong>
            <span>Books listed</span>
          </div>
          <div>
            <strong>{stats.orders}</strong>
            <span>Orders placed</span>
          </div>
          <div>
            <strong>{stats.categories}</strong>
            <span>Categories</span>
          </div>
        </div>
      </div>
      <div className="hero-visual">
        <div className="hero-book-stack">
          <div className="stack-book stack-book-1">📖</div>
          <div className="stack-book stack-book-2">📕</div>
          <div className="stack-book stack-book-3">📗</div>
        </div>
      </div>
    </section>
  )
}
