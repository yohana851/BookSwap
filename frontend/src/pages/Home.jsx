import { useEffect, useState } from 'react'
import { api } from '../api/client'
import BookCard from '../components/BookCard'

export default function Home() {
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    Promise.all([api.getBooks(), api.getCategories()])
      .then(([booksData, categoriesData]) => {
        setBooks(booksData)
        setCategories(categoriesData)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      (book.author || '').toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      categoryFilter === 'all' || String(book.category_id) === categoryFilter
    return matchesSearch && matchesCategory
  })

  if (loading) return <p className="page-message">Loading books...</p>
  if (error) return <p className="page-message error">{error}</p>

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Used books marketplace</h1>
          <p className="muted">Browse second-hand books from sellers near you.</p>
        </div>
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
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat.category_id} value={cat.category_id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {filteredBooks.length === 0 ? (
        <p className="page-message">No books found.</p>
      ) : (
        <div className="book-grid">
          {filteredBooks.map((book) => (
            <BookCard key={book.book_id} book={book} />
          ))}
        </div>
      )}
    </div>
  )
}
