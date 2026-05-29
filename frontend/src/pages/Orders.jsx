import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Orders() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [books, setBooks] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (user?.role !== 'buyer' && user?.role !== 'admin') {
      navigate('/')
      return
    }

    Promise.all([api.getOrders(), api.getBooks()])
      .then(([ordersData, booksData]) => {
        const bookMap = Object.fromEntries(booksData.map((b) => [b.book_id, b]))
        setBooks(bookMap)
        const myOrders =
          user.role === 'admin'
            ? ordersData
            : ordersData.filter((o) => o.buyer_id === user.user_id)
        setOrders(myOrders.reverse())
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [isAuthenticated, user, navigate])

  if (loading) return <p className="page-message">Loading orders...</p>
  if (error) return <p className="page-message error">{error}</p>

  return (
    <div className="page">
      <div className="page-header">
        <h1>My orders</h1>
        <p className="muted">Books you have purchased.</p>
      </div>

      {orders.length === 0 ? (
        <p className="page-message">
          No orders yet. <Link to="/">Browse books</Link>
        </p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const book = books[order.book_id]
            return (
              <article key={order.order_id} className="order-card">
                <div>
                  <h3>{book?.title || `Book #${order.book_id}`}</h3>
                  {book?.author && <p className="muted">{book.author}</p>}
                  <p className="order-date">
                    Ordered {new Date(order.order_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="order-meta">
                  <span className="price">${order.total_amount.toFixed(2)}</span>
                  <span className="payment-status">{order.payment_status}</span>
                  {book && (
                    <Link to={`/books/${book.book_id}`} className="btn btn-secondary">
                      View book
                    </Link>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
