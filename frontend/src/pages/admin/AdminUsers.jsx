import { useEffect, useMemo, useState } from 'react'
import LoadingSpinner from '../../components/LoadingSpinner'
import { api } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

const roleLabels = {
  buyer: 'Buyer',
  seller: 'Seller',
  admin: 'Admin',
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [books, setBooks] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState(null)

  const loadData = () => {
    setLoading(true)
    Promise.all([api.getUsers(), api.getBooks(), api.getOrders()])
      .then(([usersData, booksData, ordersData]) => {
        setUsers(usersData)
        setBooks(booksData)
        setOrders(ordersData)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const listingsCountByUser = useMemo(() => {
    const counts = {}
    books.forEach((book) => {
      counts[book.seller_id] = (counts[book.seller_id] || 0) + 1
    })
    return counts
  }, [books])

  const ordersCountByUser = useMemo(() => {
    const counts = {}
    orders.forEach((order) => {
      counts[order.buyer_id] = (counts[order.buyer_id] || 0) + 1
    })
    return counts
  }, [orders])

  const filteredUsers = users.filter((user) => {
    const term = search.toLowerCase()
    return (
      user.username.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    )
  })

  const handleRoleChange = async (user, role) => {
    if (role === user.role) return
    setBusyId(user.user_id)
    try {
      const updated = await api.updateUser(user.user_id, { role })
      setUsers((prev) => prev.map((u) => (u.user_id === updated.user_id ? updated : u)))
      toast.success(`${updated.username} is now ${roleLabels[updated.role]}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete account "${user.username}"? This cannot be undone.`)) return
    setBusyId(user.user_id)
    try {
      await api.deleteUser(user.user_id)
      setUsers((prev) => prev.filter((u) => u.user_id !== user.user_id))
      toast.success(`${user.username} was deleted`)
    } catch (err) {
      toast.error(err.message)
      setBusyId(null)
    }
  }

  const handleToggleActive = async (user) => {
    const nextActive = !user.is_active
    setBusyId(user.user_id)
    try {
      const updated = await api.updateUser(user.user_id, { is_active: nextActive })
      setUsers((prev) => prev.map((u) => (u.user_id === updated.user_id ? updated : u)))
      toast.success(`${updated.username} ${nextActive ? 'activated' : 'deactivated'}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleResetPassword = async (user) => {
    const newPassword = window.prompt(
      `Enter a new password for "${user.username}" (min 6 characters):`,
    )
    if (!newPassword) return
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setBusyId(user.user_id)
    try {
      await api.updateUser(user.user_id, { password: newPassword })
      toast.success(`Password reset for ${user.username}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <LoadingSpinner label="Loading users..." />
  if (error) return <p className="page-message error">{error}</p>

  return (
    <div className="page">
      <div className="page-header">
        <h1>Users</h1>
        <p className="muted">
          Monitor every account: change roles, reset passwords, activate/deactivate, or
          delete when needed.
        </p>
      </div>

      <div className="filters filters-single">
        <input
          type="search"
          placeholder="Search by username or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredUsers.length === 0 ? (
        <p className="page-message">No users match your search.</p>
      ) : (
        <div className="admin-table">
          <div className="admin-table-row admin-table-head admin-users-row">
            <span>User</span>
            <span>Activity</span>
            <span>Role</span>
            <span>Actions</span>
          </div>
          {filteredUsers.map((user) => {
            const isSelf = user.user_id === currentUser.user_id
            const busy = busyId === user.user_id
            return (
              <div key={user.user_id} className="admin-table-row admin-users-row">
                <span>
                  <span className="admin-table-label">
                    {user.username} {isSelf && <span className="muted">(you)</span>}
                  </span>
                  <span className="muted">{user.email}</span>
                  <span className="muted category-count">ID: {user.user_id}</span>
                  <span className="muted category-count">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </span>
                  <span className={`status ${user.is_active ? 'status-available' : 'status-sold'}`}>
                    {user.is_active ? 'Active' : 'Deactivated'}
                  </span>
                </span>
                <span className="muted">
                  {user.role === 'seller' && `${listingsCountByUser[user.user_id] || 0} listing(s)`}
                  {user.role === 'buyer' && `${ordersCountByUser[user.user_id] || 0} order(s)`}
                  {user.role === 'admin' && '—'}
                </span>
                <span>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user, e.target.value)}
                    disabled={isSelf || busy}
                    className="inline-edit-input"
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                </span>
                <div className="listing-buttons">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleResetPassword(user)}
                    disabled={busy}
                  >
                    Reset password
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => handleToggleActive(user)}
                    disabled={isSelf || busy}
                    title={isSelf ? 'You cannot deactivate your own account' : undefined}
                  >
                    {user.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleDelete(user)}
                    disabled={isSelf || busy}
                    title={isSelf ? 'You cannot delete your own account' : 'Delete account'}
                  >
                    {busy ? 'Working...' : 'Delete'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
