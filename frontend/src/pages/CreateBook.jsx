import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

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
  const toast = useToast()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    api.getCategories().then(setCategories).catch((err) => setError(err.message))
  }, [])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const { image_url } = await api.uploadImage(file)
      setForm((prev) => ({ ...prev, image_url }))
      toast.success('Image uploaded')
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.createBook({
        title: form.title,
        author: form.author || null,
        isbn: form.isbn || null,
        price: Number(form.price),
        condition: form.condition,
        description: form.description || null,
        image_url: form.image_url || null,
        status: form.status,
        seller_id: user.user_id,
        category_id: Number(form.category_id),
      })
      toast.success('Book listed successfully!')
      navigate('/seller/listings')
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
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
            Price (NPR) *
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
            <input name="isbn" value={form.isbn} onChange={handleChange} maxLength={16} />
          </label>
        </div>

        <label>
          Cover image
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <span className="field-hint">
            {uploading ? 'Uploading...' : 'Upload from your device (max 5 MB)'}
          </span>
        </label>

        <label>
          ...or paste an image URL
          <input
            type="url"
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            placeholder="https://example.com/cover.jpg"
          />
        </label>

        {form.image_url && (
          <div className="image-preview">
            <img src={form.image_url} alt="Cover preview" />
          </div>
        )}

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
