import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      (book.author || '').toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      categoryFilter === 'all' || String(book.category_id) === categoryFilter
    return matchesSearch && matchesCategory && book.status === 'Available'
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
      </div>

      {loading && <p className="page-message">Loading books...</p>}
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
          <Link to="/register/user" className="btn btn-primary">
            Sign up to buy
          </Link>
        </div>
      )}
    </section>
  )
}
