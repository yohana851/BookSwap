import { useEffect, useMemo, useState } from 'react'
import LoadingSpinner from '../../components/LoadingSpinner'
import { api } from '../../api/client'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [books, setBooks] = useState({})
  const [users, setUsers] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([api.getOrders(), api.getBooks(), api.getUsers()])
      .then(([ordersData, booksData, usersData]) => {
        setOrders(ordersData.slice().reverse())
        setBooks(Object.fromEntries(booksData.map((b) => [b.book_id, b])))
        setUsers(Object.fromEntries(usersData.map((u) => [u.user_id, u])))
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filteredOrders = useMemo(() => {
    const term = search.toLowerCase()
    if (!term) return orders
    return orders.filter((order) => {
      const book = books[order.book_id]
      const buyer = users[order.buyer_id]
      return (
        book?.title.toLowerCase().includes(term) ||
        buyer?.username.toLowerCase().includes(term) ||
        buyer?.email.toLowerCase().includes(term)
      )
    })
  }, [orders, books, users, search])

  if (loading) return <LoadingSpinner label="Loading orders..." />
  if (error) return <p className="page-message error">{error}</p>

  return (
    <div className="page">
      <div className="page-header">
        <h1>Orders</h1>
        <p className="muted">Every order placed across the marketplace.</p>
      </div>

      <div className="filters filters-single">
        <input
          type="search"
          placeholder="Search by book, buyer username, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredOrders.length === 0 ? (
        <p className="page-message">No orders match your search.</p>
      ) : (
        <div className="admin-table">
          <div className="admin-table-row admin-table-head admin-orders-row">
            <span>Order</span>
            <span>Buyer</span>
            <span>Delivery</span>
            <span>Total</span>
            <span>Status</span>
          </div>
          {filteredOrders.map((order) => {
            const book = books[order.book_id]
            const buyer = users[order.buyer_id]
            return (
              <div key={order.order_id} className="admin-table-row admin-orders-row">
                <span>
                  <span className="admin-table-label">
                    {book?.title || `Book #${order.book_id}`}
                  </span>
                  <span className="muted category-count">
                    Ordered {new Date(order.order_date).toLocaleDateString()}
                  </span>
                </span>
                <span className="muted">
                  {buyer ? `${buyer.username} (${buyer.email})` : `User #${order.buyer_id}`}
                </span>
                <span className="muted">
                  {order.delivery_location || '—'}
                  {order.delivery_charge != null && ` · NPR ${order.delivery_charge.toFixed(2)}`}
                </span>
                <span className="muted">NPR {order.total_amount.toFixed(2)}</span>
                <span className={`status status-order-${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
