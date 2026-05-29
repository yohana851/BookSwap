import { Link } from 'react-router-dom'

export default function BookCard({ book }) {
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
        <Link to={`/books/${book.book_id}`} className="btn btn-primary btn-block">
          View details
        </Link>
      </div>
    </article>
  )
}
