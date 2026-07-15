import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner'
import HowItWorksSection from '../../components/sections/HowItWorksSection'
import { api } from '../../api/client'
import { useAuth } from '../../context/AuthContext'

export default function SellerHome() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.getBooks().then((books) => {
      const mine = books.filter((book) => book.seller_id === user.user_id)
      setStats({
        total: mine.length,
        available: mine.filter((b) => b.status === 'Available').length,
        sold: mine.filter((b) => b.status === 'Sold').length,
      })
    })
  }, [user.user_id])

  return (
    <div className="page seller-home-page">
      <div className="page-header">
        <h1>Seller dashboard</h1>
        <p className="muted">
          Manage your listings and reach readers looking for pre-loved books.
        </p>
      </div>

      {!stats ? (
        <LoadingSpinner label="Loading your stats..." />
      ) : (
        <div className="stats-grid stats-grid-compact">
          <article className="stat-card">
            <span className="stat-label">Total listings</span>
            <strong>{stats.total}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Available</span>
            <strong>{stats.available}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Sold</span>
            <strong>{stats.sold}</strong>
          </article>
        </div>
      )}

      <div className="dashboard-cards">
        <article className="dashboard-card">
          <h2>List a book</h2>
          <p className="muted">Add a new title to the marketplace.</p>
          <Link to="/sell" className="btn btn-primary">
            Create listing
          </Link>
        </article>
        <article className="dashboard-card">
          <h2>My listings</h2>
          <p className="muted">View, edit, or remove books you have listed.</p>
          <Link to="/seller/listings" className="btn btn-secondary">
            View listings
          </Link>
        </article>
      </div>

      <HowItWorksSection role="seller" />
    </div>
  )
}
