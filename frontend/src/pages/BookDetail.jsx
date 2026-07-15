import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'
import RatingStars from '../components/RatingStars'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useShop } from '../context/ShopContext'
import { useToast } from '../context/ToastContext'

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const shop = useShop()
  const [book, setBook] = useState(null)
  const [categoryName, setCategoryName] = useState('')
  const [reviews, setReviews] = useState([])
  const [ratingSummary, setRatingSummary] = useState({ average_rating: 0, review_count: 0 })
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const toast = useToast()

  const loadReviews = () => {
    api
      .getReviews(id)
      .then((data) => {
        setReviews(data.reviews || [])
        setRatingSummary({
          average_rating: data.average_rating || 0,
          review_count: data.review_count || 0,
        })
      })
      .catch(() => {})
  }

  useEffect(() => {
    Promise.all([api.getBook(id), api.getCategories()])
      .then(([bookData, categories]) => {
        setBook(bookData)
        const category = categories.find((c) => c.category_id === bookData.category_id)
        setCategoryName(category?.name || 'Unknown')
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
    loadReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const bookId = book?.book_id
  const canBuy = shop.canShop && book?.status === 'Available'
  const inCart = bookId ? shop.isInCart(bookId) : false
  const inWishlist = bookId ? shop.isInWishlist(bookId) : false
  const existingReview = reviews.find((r) => r.user_id === user?.user_id)

  const handleBuyClick = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    navigate('/checkout', { state: { book } })
  }

  const handleToggleCart = async () => {
    try {
      if (inCart) {
        await shop.removeFromCart(bookId)
        toast.info('Removed from cart')
      } else {
        await shop.addToCart(bookId)
        toast.success('Added to cart')
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleToggleWishlist = async () => {
    try {
      if (inWishlist) {
        await shop.removeFromWishlist(bookId)
        toast.info('Removed from wishlist')
      } else {
        await shop.addToWishlist(bookId)
        toast.success('Added to wishlist')
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!reviewForm.rating) {
      toast.error('Please select a star rating')
      return
    }
    setSubmittingReview(true)
    try {
      await api.createReview(book.book_id, {
        rating: reviewForm.rating,
        comment: reviewForm.comment || null,
      })
      toast.success(existingReview ? 'Review updated' : 'Review submitted')
      setReviewForm({ rating: 0, comment: '' })
      loadReviews()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    try {
      await api.deleteReview(reviewId)
      toast.info('Review deleted')
      loadReviews()
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (loading) return <LoadingSpinner label="Loading book..." />
  if (error) return <p className="page-message error">{error}</p>
  if (!book) return null

  return (
    <div className="page book-detail-page">
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

          <div className="rating-summary">
            <RatingStars value={ratingSummary.average_rating} />
            <span className="muted">
              {ratingSummary.review_count > 0
                ? `${ratingSummary.average_rating} (${ratingSummary.review_count} review${ratingSummary.review_count > 1 ? 's' : ''})`
                : 'No reviews yet'}
            </span>
          </div>

          <p className="price large">NPR {book.price.toFixed(2)}</p>

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

          <div className="book-detail-actions">
            {book.status === 'Available' && (
              <>
                {canBuy ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleBuyClick}
                  >
                    Buy now
                  </button>
                ) : !isAuthenticated ? (
                  <Link to="/login" className="btn btn-primary">
                    Sign in to buy
                  </Link>
                ) : (
                  <p className="muted">Only buyers can purchase books.</p>
                )}

                {canBuy && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleToggleCart}
                  >
                    {inCart ? '✓ In cart' : 'Add to cart'}
                  </button>
                )}
              </>
            )}

            {shop.canShop && (
              <button
                type="button"
                className={`btn btn-ghost ${inWishlist ? 'active' : ''}`}
                onClick={handleToggleWishlist}
              >
                {inWishlist ? '♥ Wishlisted' : '♡ Wishlist'}
              </button>
            )}
          </div>
        </div>
      </div>

      <section className="reviews-section">
        <h2>Reviews &amp; ratings</h2>

        {shop.canShop && (
          <form className="review-form form-card" onSubmit={handleSubmitReview}>
            <h3>{existingReview ? 'Update your review' : 'Write a review'}</h3>
            <RatingStars
              value={reviewForm.rating}
              onRate={(rating) => setReviewForm((prev) => ({ ...prev, rating }))}
              size="lg"
            />
            <textarea
              rows={3}
              placeholder="Share your thoughts about this book (optional)"
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm((prev) => ({ ...prev, comment: e.target.value }))
              }
            />
            <button type="submit" className="btn btn-primary" disabled={submittingReview}>
              {submittingReview ? 'Submitting...' : existingReview ? 'Update review' : 'Submit review'}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="muted">Be the first to review this book.</p>
        ) : (
          <ul className="review-list">
            {reviews.map((review) => (
              <li key={review.review_id} className="review-item">
                <div className="review-head">
                  <strong>{review.username || 'User'}</strong>
                  <RatingStars value={review.rating} size="sm" />
                </div>
                {review.comment && <p>{review.comment}</p>}
                {(review.user_id === user?.user_id || user?.role === 'admin') && (
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => handleDeleteReview(review.review_id)}
                  >
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
