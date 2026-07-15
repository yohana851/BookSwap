import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner'
import { api } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function SellerOrders() {
  const { user } = useAuth()
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [books, setBooks] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const loadOrders = useCallback(() => {
    setLoading(true)
    setError('')
    Promise.all([api.getOrders(), api.getBooks()])
      .then(([ordersData, booksData]) => {
        const bookMap = Object.fromEntries(booksData.map((b) => [b.book_id, b]))
        setBooks(bookMap)
        const mine =
          user.role === 'admin'
            ? ordersData
            : ordersData.filter((o) => bookMap[o.book_id]?.seller_id === user.user_id)
        setOrders(mine.reverse())
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [user])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const handleAccept = async (order) => {
    setBusyId(order.order_id)
    try {
      const updated = await api.acceptOrder(order.order_id)
      setOrders((prev) => prev.map((o) => (o.order_id === updated.order_id ? updated : o)))
      toast.success('Order accepted — now delivering')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleDeliver = async (order) => {
    setBusyId(order.order_id)
    try {
      const updated = await api.deliverOrder(order.order_id)
      setOrders((prev) => prev.map((o) => (o.order_id === updated.order_id ? updated : o)))
      toast.success('Order marked as delivered')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <LoadingSpinner label="Loading orders..." />

  return (
    <div className="page">
      <div className="page-header">
        <h1>Orders</h1>
        <p className="muted">Orders placed for your listings — accept and track delivery.</p>
      </div>

      {error && <p className="form-error">{error}</p>}

      {orders.length === 0 ? (
        <p className="page-message">No orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const book = books[order.book_id]
            const busy = busyId === order.order_id
            return (
              <article key={order.order_id} className="order-card">
                <div>
                  <h3>{book?.title || `Book #${order.book_id}`}</h3>
                  <p className="order-date">
                    Ordered {new Date(order.order_date).toLocaleDateString()}
                  </p>
                  <p className="muted order-delivery">
                    Deliver to: {order.delivery_name} · {order.delivery_phone}
                    <br />
                    {order.delivery_address}
                    {order.delivery_location && ` (${order.delivery_location})`}
                  </p>
                </div>
                <div className="order-meta">
                  <span className={`status status-order-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                  <span className="price">NPR {order.total_amount.toFixed(2)}</span>
                  <span className="payment-status">
                    {order.payment_method} · {order.payment_status}
                  </span>
                  <div className="listing-buttons">
                    {book && (
                      <Link to={`/books/${book.book_id}`} className="btn btn-secondary">
                        View book
                      </Link>
                    )}
                    {order.status === 'Processing' && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleAccept(order)}
                        disabled={busy}
                      >
                        {busy ? 'Working...' : 'Accept order'}
                      </button>
                    )}
                    {order.status === 'Delivering' && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleDeliver(order)}
                        disabled={busy}
                      >
                        {busy ? 'Working...' : 'Mark delivered'}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
