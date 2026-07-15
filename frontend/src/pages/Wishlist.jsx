import { Link } from 'react-router-dom'
import RatingStars from '../components/RatingStars'
import { useShop } from '../context/ShopContext'
import { useToast } from '../context/ToastContext'

export default function Wishlist() {
  const { wishlist, removeFromWishlist, addToCart, isInCart } = useShop()
  const toast = useToast()

  const handleRemove = async (bookId) => {
    try {
      await removeFromWishlist(bookId)
      toast.info('Removed from wishlist')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleMoveToCart = async (bookId) => {
    try {
      await addToCart(bookId)
      await removeFromWishlist(bookId)
      toast.success('Moved to cart')
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Your wishlist</h1>
        <p className="muted">Books you saved for later.</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="empty-state">
          <p>Your wishlist is empty.</p>
          <Link to="/user" className="btn btn-primary">
            Browse books
          </Link>
        </div>
      ) : (
        <div className="book-grid">
          {wishlist.map((item) => {
            const book = item.book
            if (!book) return null
            return (
              <article key={item.wishlist_item_id} className="book-card">
                <div className="book-cover">
                  {book.image_url ? (
                    <img src={book.image_url} alt={book.title} />
                  ) : (
                    <div className="book-placeholder">{book.title.charAt(0)}</div>
                  )}
                </div>
                <div className="book-body">
                  <h3>{book.title}</h3>
                  {book.author && <p className="muted">{book.author}</p>}
                  <RatingStars value={book.average_rating} size="sm" />
                  <div className="book-meta">
                    <span className="price">NPR {book.price.toFixed(2)}</span>
                    <span className={`status status-${book.status.toLowerCase()}`}>
                      {book.status}
                    </span>
                  </div>
                  <div className="book-actions">
                    <Link
                      to={`/books/${book.book_id}`}
                      className="btn btn-secondary btn-block"
                    >
                      View details
                    </Link>
                    {book.status === 'Available' && (
                      <button
                        type="button"
                        className="btn btn-primary btn-block"
                        onClick={() => handleMoveToCart(book.book_id)}
                        disabled={isInCart(book.book_id)}
                      >
                        {isInCart(book.book_id) ? 'In cart' : 'Move to cart'}
                      </button>
                    )}
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => handleRemove(book.book_id)}
                    >
                      Remove
                    </button>
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
