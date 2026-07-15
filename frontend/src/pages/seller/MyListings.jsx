import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner'
import { api } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function MyListings() {
  const { user } = useAuth()
  const toast = useToast()
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const loadListings = useCallback(() => {
    setLoading(true)
    setError('')
    Promise.all([api.getBooks(), api.getCategories()])
      .then(([booksData, categoriesData]) => {
        const categoryMap = Object.fromEntries(
          categoriesData.map((c) => [c.category_id, c.name]),
        )
        setCategories(categoryMap)
        const mine = booksData.filter((book) => book.seller_id === user.user_id)
        setBooks(mine.reverse())
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [user.user_id])

  useEffect(() => {
    loadListings()
  }, [loadListings])

  const handleDelete = async (book) => {
    if (!window.confirm(`Remove "${book.title}" from the marketplace?`)) return
    setDeletingId(book.book_id)
    setError('')
    try {
      await api.deleteBook(book.book_id)
      setBooks((prev) => prev.filter((b) => b.book_id !== book.book_id))
      toast.success('Listing removed')
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <LoadingSpinner label="Loading your listings..." />

  return (
    <div className="page">
      <div className="page-header listings-header">
        <div>
          <h1>My listings</h1>
          <p className="muted">Books you have listed for sale.</p>
        </div>
        <Link to="/sell" className="btn btn-primary">
          + List a book
        </Link>
      </div>

      {error && <p className="form-error">{error}</p>}

      {books.length === 0 ? (
        <p className="page-message">
          No listings yet. <Link to="/sell">List your first book</Link>
        </p>
      ) : (
        <div className="listings-list">
          {books.map((book) => (
            <article key={book.book_id} className="listing-card">
              <div className="listing-cover">
                {book.image_url ? (
                  <img src={book.image_url} alt={book.title} />
                ) : (
                  <div className="book-placeholder">{book.title.charAt(0)}</div>
                )}
              </div>
              <div className="listing-info">
                <span className={`status status-${book.status.toLowerCase()}`}>
                  {book.status}
                </span>
                <h3>{book.title}</h3>
                {book.author && <p className="muted">{book.author}</p>}
                <p className="listing-meta">
                  {categories[book.category_id] || 'Uncategorized'} · {book.condition || '—'}
                </p>
              </div>
              <div className="listing-actions">
                <span className="price">NPR {Number(book.price).toFixed(2)}</span>
                <div className="listing-buttons">
                  <Link to={`/books/${book.book_id}`} className="btn btn-secondary">
                    View
                  </Link>
                  <Link to={`/seller/edit/${book.book_id}`} className="btn btn-secondary">
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleDelete(book)}
                    disabled={deletingId === book.book_id}
                  >
                    {deletingId === book.book_id ? 'Removing...' : 'Delete'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
