import { Link, useNavigate } from 'react-router-dom'
import { useShop } from '../context/ShopContext'
import { useToast } from '../context/ToastContext'

export default function Cart() {
  const { cart, cartTotal, removeFromCart } = useShop()
  const toast = useToast()
  const navigate = useNavigate()

  const handleRemove = async (bookId) => {
    try {
      await removeFromCart(bookId)
      toast.info('Removed from cart')
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Your cart</h1>
        <p className="muted">Review the books you want to buy.</p>
      </div>

      {cart.length === 0 ? (
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <Link to="/user" className="btn btn-primary">
            Browse books
          </Link>
        </div>
      ) : (
        <>
          <ul className="cart-list">
            {cart.map((item) => {
              const book = item.book
              if (!book) return null
              return (
                <li key={item.cart_item_id} className="cart-item">
                  <div className="cart-item-cover">
                    {book.image_url ? (
                      <img src={book.image_url} alt={book.title} />
                    ) : (
                      <div className="book-placeholder">{book.title.charAt(0)}</div>
                    )}
                  </div>
                  <div className="cart-item-info">
                    <Link to={`/books/${book.book_id}`}>
                      <h3>{book.title}</h3>
                    </Link>
                    {book.author && <p className="muted">{book.author}</p>}
                    <span className={`status status-${book.status.toLowerCase()}`}>
                      {book.status}
                    </span>
                  </div>
                  <div className="cart-item-actions">
                    <span className="price">NPR {book.price.toFixed(2)}</span>
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => handleRemove(book.book_id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="cart-summary">
            <span>Total</span>
            <strong>NPR {cartTotal.toFixed(2)}</strong>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => navigate('/checkout')}
          >
            Checkout
          </button>
        </>
      )}
    </div>
  )
}
