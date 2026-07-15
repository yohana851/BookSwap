import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner'
import { api } from '../../api/client'

export default function AdminBooks() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState({})
  const [users, setUsers] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const statusFilter = searchParams.get('status') || 'all'

  useEffect(() => {
    setLoading(true)
    Promise.all([api.getBooks(), api.getCategories(), api.getUsers()])
      .then(([booksData, categoriesData, usersData]) => {
        setBooks(booksData)
        setCategories(Object.fromEntries(categoriesData.map((c) => [c.category_id, c.name])))
        setUsers(Object.fromEntries(usersData.map((u) => [u.user_id, u.username])))
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filteredBooks = useMemo(() => {
    const term = search.toLowerCase()
    return books
      .filter((book) => statusFilter === 'all' || book.status === statusFilter)
      .filter((book) => {
        if (!term) return true
        const seller = users[book.seller_id] || ''
        return (
          book.title.toLowerCase().includes(term) ||
          (book.author || '').toLowerCase().includes(term) ||
          seller.toLowerCase().includes(term)
        )
      })
  }, [books, users, search, statusFilter])

  if (loading) return <LoadingSpinner label="Loading books..." />
  if (error) return <p className="page-message error">{error}</p>

  return (
    <div className="page">
      <div className="page-header">
        <h1>Books</h1>
        <p className="muted">All listings across the marketplace.</p>
      </div>

      <div className="filters">
        <input
          type="search"
          placeholder="Search by title, author, or seller..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            const value = e.target.value
            if (value === 'all') {
              setSearchParams({})
            } else {
              setSearchParams({ status: value })
            }
          }}
        >
          <option value="all">All statuses</option>
          <option value="Available">Available</option>
          <option value="Sold">Sold</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {filteredBooks.length === 0 ? (
        <p className="page-message">No books match your filters.</p>
      ) : (
        <div className="admin-table">
          <div className="admin-table-row admin-table-head admin-books-row">
            <span>Book</span>
            <span>Seller</span>
            <span>Category</span>
            <span>Price</span>
            <span>Actions</span>
          </div>
          {filteredBooks.map((book) => (
            <div key={book.book_id} className="admin-table-row admin-books-row">
              <span>
                <span className="admin-table-label">{book.title}</span>
                {book.author && <span className="muted">{book.author}</span>}
                <span className={`status status-${book.status.toLowerCase()}`}>
                  {book.status}
                </span>
              </span>
              <span className="muted">{users[book.seller_id] || `User #${book.seller_id}`}</span>
              <span className="muted">{categories[book.category_id] || 'Uncategorized'}</span>
              <span className="muted">NPR {Number(book.price).toFixed(2)}</span>
              <Link to={`/books/${book.book_id}`} className="btn btn-secondary">
                View
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
