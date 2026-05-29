import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [book, setBook] = useState(null)
  const [categoryName, setCategoryName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [buying, setBuying] = useState(false)

  useEffect(() => {
    Promise.all([api.getBook(id), api.getCategories()])
      .then(([bookData, categories]) => {
        setBook(bookData)
        const category = categories.find((c) => c.category_id === bookData.category_id)
        setCategoryName(category?.name || 'Unknown')
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const canBuy =
    isAuthenticated &&
    (user?.role === 'buyer' || user?.role === 'admin') &&
    book?.status === 'Available'

  const handleBuy = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setActionError('')
    setBuying(true)
    try {
      await api.createOrder({
        book_id: book.book_id,
        buyer_id: user.user_id,
        total_amount: book.price,
        payment_status: 'Paid',
      })
      navigate('/orders')
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBuying(false)
    }
  }

  if (loading) return <p className="page-message">Loading book...</p>
  if (error) return <p className="page-message error">{error}</p>
  if (!book) return null

  return (
    <div className="page">
      <Link to="/" className="back-link">
        ← Back to browse
      </Link>

      <div className="book-detail">
        <div className="book-detail-cover">
          {book.image_url ? (
            <img src={book.image_url} alt={book.title} />
          ) : (
            <div className="book-placeholder large">{book.title.charAt(0)}</div>
          )}
        </div>

        <div className="book-detail-info">
          <span className={`status status-${book.status.toLowerCase()}`}>
            {book.status}
          </span>
          <h1>{book.title}</h1>
          {book.author && <p className="author">{book.author}</p>}
          <p className="price large">${book.price.toFixed(2)}</p>

          <dl className="detail-list">
            <div>
              <dt>Category</dt>
              <dd>{categoryName}</dd>
            </div>
            {book.condition && (
              <div>
                <dt>Condition</dt>
                <dd>{book.condition}</dd>
              </div>
            )}
            {book.isbn && (
              <div>
                <dt>ISBN</dt>
                <dd>{book.isbn}</dd>
              </div>
            )}
          </dl>

          {book.description && (
            <div className="description">
              <h2>Description</h2>
              <p>{book.description}</p>
            </div>
          )}

          {actionError && <p className="form-error">{actionError}</p>}

          {book.status === 'Available' && (
            <>
              {canBuy ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleBuy}
                  disabled={buying}
                >
                  {buying ? 'Processing...' : 'Buy now'}
                </button>
              ) : !isAuthenticated ? (
                <Link to="/login" className="btn btn-primary">
                  Log in to buy
                </Link>
              ) : (
                <p className="muted">Only buyers can purchase books.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
