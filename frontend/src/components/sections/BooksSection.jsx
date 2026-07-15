import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../LoadingSpinner'
import { api } from '../../api/client'
import BookCard from '../BookCard'

export default function BooksSection({
  isAuthenticated = false,
  selectedCategory = 'all',
  onCategoryChange,
  showBuy = false,
}) {
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(selectedCategory)
  const [sortBy, setSortBy] = useState('latest')

  useEffect(() => {
    setCategoryFilter(selectedCategory)
  }, [selectedCategory])

  useEffect(() => {
    Promise.all([api.getBooks(), api.getCategories()])
      .then(([booksData, categoriesData]) => {
        setBooks(booksData)
        setCategories(categoriesData)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleCategoryChange = (value) => {
    setCategoryFilter(value)
    onCategoryChange?.(value)
  }

  const filteredBooks = books
    .filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        (book.author || '').toLowerCase().includes(search.toLowerCase())
      const matchesCategory =
        categoryFilter === 'all' || String(book.category_id) === categoryFilter
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (a.status === 'Available' && b.status !== 'Available') return -1
      if (a.status !== 'Available' && b.status === 'Available') return 1
      if (sortBy === 'rating') {
        return b.average_rating - a.average_rating || b.review_count - a.review_count
      }
      if (sortBy === 'reviews') {
        return b.review_count - a.review_count
      }
      return new Date(b.created_at) - new Date(a.created_at)
    })

  return (
    <section id="books" className="section books-section">
      <div className="section-header">
        <span className="section-label">Shop</span>
        <h2>{showBuy ? 'Buy books now' : 'Featured books'}</h2>
        <p className="section-desc">
          {showBuy
            ? 'Find your next read and purchase directly from verified sellers.'
            : 'Preview popular listings. Sign in to purchase.'}
        </p>
      </div>

      <div className="filters">
        <input
          type="search"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={categoryFilter}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat.category_id} value={cat.category_id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="latest">Latest</option>
          <option value="reviews">Most reviewed</option>
          <option value="rating">Top rated</option>
        </select>
      </div>

      {loading && <LoadingSpinner label="Loading books..." />}
      {error && <p className="page-message error">{error}</p>}

      {!loading && !error && filteredBooks.length === 0 && (
        <p className="page-message">No books available right now. Check back soon!</p>
      )}

      {!loading && !error && filteredBooks.length > 0 && (
        <div className="book-grid">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.book_id}
              book={book}
              showBuy={showBuy}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}

      {!isAuthenticated && !showBuy && (
        <div className="books-cta">
          <p>Ready to buy? Create a free account to place orders.</p>
          <Link to="/register?role=buyer" className="btn btn-primary">
            Sign up to buy
          </Link>
        </div>
      )}
    </section>
  )
}
