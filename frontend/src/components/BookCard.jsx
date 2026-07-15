import { Link } from 'react-router-dom'
import RatingStars from './RatingStars'
import { useShop } from '../context/ShopContext'
import { useToast } from '../context/ToastContext'

export default function BookCard({ book, showBuy = false, isAuthenticated = false }) {
  const shop = useShop()
  const toast = useToast()
  const inCart = shop.isInCart(book.book_id)
  const inWishlist = shop.isInWishlist(book.book_id)

  const handleCart = async () => {
    try {
      if (inCart) {
        await shop.removeFromCart(book.book_id)
        toast.info('Removed from cart')
      } else {
        await shop.addToCart(book.book_id)
        toast.success('Added to cart')
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleWishlist = async () => {
    try {
      if (inWishlist) {
        await shop.removeFromWishlist(book.book_id)
        toast.info('Removed from wishlist')
      } else {
        await shop.addToWishlist(book.book_id)
        toast.success('Added to wishlist')
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <article className="book-card">
      <div className="book-cover">
        {book.image_url ? (
          <img src={book.image_url} alt={book.title} />
        ) : (
          <div className="book-placeholder">{book.title.charAt(0)}</div>
        )}
        {shop.canShop && (
          <button
            type="button"
            className={`wishlist-toggle ${inWishlist ? 'active' : ''}`}
            onClick={handleWishlist}
            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-label="Toggle wishlist"
          >
            {inWishlist ? '♥' : '♡'}
          </button>
        )}
      </div>
      <div className="book-body">
        <h3>{book.title}</h3>
        {book.author && <p className="muted">{book.author}</p>}
        {book.review_count > 0 ? (
          <div className="card-rating">
            <RatingStars value={book.average_rating} size="sm" />
            <span className="muted">({book.review_count})</span>
          </div>
        ) : (
          <div className="card-rating muted">No reviews yet</div>
        )}
        <div className="book-meta">
          <span className="price">NPR {book.price.toFixed(2)}</span>
          <span className={`status status-${book.status.toLowerCase()}`}>
            {book.status === 'Sold' ? 'Sold out' : book.status}
          </span>
        </div>
        <div className="book-actions">
          <Link to={`/books/${book.book_id}`} className="btn btn-secondary btn-block">
            View details
          </Link>
          {showBuy && shop.canShop && book.status === 'Available' && (
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={handleCart}
            >
              {inCart ? '✓ In cart' : 'Add to cart'}
            </button>
          )}
          {!isAuthenticated && book.status === 'Available' && (
            <Link to="/login" className="btn btn-primary btn-block">
              Sign in to buy
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
