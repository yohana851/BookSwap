import { Link } from 'react-router-dom'

export default function BookCard({ book, showBuy = false, isAuthenticated = false }) {
  return (
    <article className="book-card">
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
        <div className="book-meta">
          <span className="price">${book.price.toFixed(2)}</span>
          <span className={`status status-${book.status.toLowerCase()}`}>
            {book.status}
          </span>
        </div>
        <div className="book-actions">
          <Link to={`/books/${book.book_id}`} className="btn btn-secondary btn-block">
            View details
          </Link>
          {showBuy && isAuthenticated && book.status === 'Available' && (
            <Link to={`/books/${book.book_id}`} className="btn btn-primary btn-block">
              Buy now
            </Link>
          )}
          {!isAuthenticated && book.status === 'Available' && (
            <Link to="/login/user" className="btn btn-primary btn-block">
              Sign in to buy
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
