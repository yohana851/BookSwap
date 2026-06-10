import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

const initialForm = {
  title: '',
  author: '',
  isbn: '',
  price: '',
  condition: 'Good',
  description: '',
  image_url: '',
  category_id: '',
  status: 'Available',
}

export default function CreateBook() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.getCategories().then(setCategories).catch((err) => setError(err.message))
  }, [])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const book = await api.createBook({
        ...form,
        seller_id: user.user_id,
        category_id: Number(form.category_id),
        price: Number(form.price),
      })
      navigate(`/books/${book.book_id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>List a book for sale</h1>
        <p className="muted">Add a used book to the marketplace.</p>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}

        <label>
          Title *
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>

        <label>
          Author
          <input name="author" value={form.author} onChange={handleChange} />
        </label>

        <div className="form-row">
          <label>
            Price ($) *
            <input
              type="number"
              step="0.01"
              min="0"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Category *
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="form-row">
          <label>
            Condition
            <select name="condition" value={form.condition} onChange={handleChange}>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </label>

          <label>
            ISBN
            <input name="isbn" value={form.isbn} onChange={handleChange} />
          </label>
        </div>

        <label>
          Image URL
          <input
            type="url"
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            placeholder="https://example.com/cover.jpg"
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
          />
        </label>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Publishing...' : 'Publish book'}
        </button>
      </form>
    </div>
  )
}
