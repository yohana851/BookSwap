import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner'
import { api } from '../../api/client'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.getUsers(), api.getBooks(), api.getOrders(), api.getCategories()])
      .then(([users, books, orders, categories]) => {
        setStats({
          users: users.length,
          books: books.length,
          orders: orders.length,
          categories: categories.length,
          available: books.filter((b) => b.status === 'Available').length,
        })
      })
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <p className="page-message error">{error}</p>
  if (!stats) return <LoadingSpinner label="Loading dashboard..." />

  return (
    <div className="page">
      <div className="page-header">
        <h1>Admin dashboard</h1>
        <p className="muted">Overview of marketplace activity.</p>
      </div>

      <div className="stats-grid">
        <Link to="/admin/users" className="stat-card stat-card-link">
          <span className="stat-label">Users</span>
          <strong>{stats.users}</strong>
        </Link>
        <Link to="/admin/books" className="stat-card stat-card-link">
          <span className="stat-label">Books listed</span>
          <strong>{stats.books}</strong>
        </Link>
        <Link to="/admin/books?status=Available" className="stat-card stat-card-link">
          <span className="stat-label">Available books</span>
          <strong>{stats.available}</strong>
        </Link>
        <Link to="/admin/orders" className="stat-card stat-card-link">
          <span className="stat-label">Orders</span>
          <strong>{stats.orders}</strong>
        </Link>
        <Link to="/admin/categories" className="stat-card stat-card-link">
          <span className="stat-label">Categories</span>
          <strong>{stats.categories}</strong>
        </Link>
      </div>

      <div className="dashboard-cards">
        <article className="dashboard-card">
          <h2>Manage categories</h2>
          <p className="muted">Add, rename, or remove book categories.</p>
          <Link to="/admin/categories" className="btn btn-primary">
            Open categories
          </Link>
        </article>
        <article className="dashboard-card">
          <h2>View users</h2>
          <p className="muted">See registered buyers, sellers, and admins.</p>
          <Link to="/admin/users" className="btn btn-secondary">
            View users
          </Link>
        </article>
      </div>
    </div>
  )
}
