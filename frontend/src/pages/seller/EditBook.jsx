import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner'
import { api } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function EditBook() {
  const { id } = useParams()
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    Promise.all([api.getBook(id), api.getCategories()])
      .then(([book, categoriesData]) => {
        if (user.role !== 'admin' && book.seller_id !== user.user_id) {
          throw new Error('You can only edit your own listings.')
        }
        setCategories(categoriesData)
        setForm({
          title: book.title,
          author: book.author || '',
          isbn: book.isbn || '',
          price: String(book.price),
          condition: book.condition || 'Good',
          description: book.description || '',
          image_url: book.image_url || '',
          category_id: String(book.category_id),
          status: book.status || 'Available',
        })
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, user])

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
    setSaving(true)
    try {
      await api.updateBook(id, {
        title: form.title,
        author: form.author || null,
        isbn: form.isbn || null,
        price: Number(form.price),
        condition: form.condition,
        description: form.description || null,
        image_url: form.image_url || null,
        category_id: Number(form.category_id),
        status: form.status,
      })
      toast.success('Listing updated')
      navigate('/seller/listings')
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Remove "${form.title}" from the marketplace?`)) return
    setError('')
    setDeleting(true)
    try {
      await api.deleteBook(id)
      toast.success('Listing deleted')
      navigate('/seller/listings')
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
      setDeleting(false)
    }
  }

  if (loading) return <LoadingSpinner label="Loading book..." />
  if (!form && error) return <p className="page-message error">{error}</p>
  if (!form) return null

  return (
    <div className="page">
      <div className="page-header">
        <Link to="/seller/listings" className="back-link">
          ← Back to listings
        </Link>
        <h1>Edit book</h1>
        <p className="muted">Update your listing details.</p>
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
            Status
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="Available">Available</option>
              <option value="Pending">Pending</option>
              <option value="Sold">Sold</option>
            </select>
          </label>
        </div>

        <label>
          ISBN
          <input name="isbn" value={form.isbn} onChange={handleChange} maxLength={16} />
        </label>

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

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving || deleting}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={saving || deleting}
          >
            {deleting ? 'Removing...' : 'Delete listing'}
          </button>
        </div>
      </form>
    </div>
  )
}
