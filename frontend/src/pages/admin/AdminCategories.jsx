import { useCallback, useEffect, useState } from 'react'
import LoadingSpinner from '../../components/LoadingSpinner'
import { api } from '../../api/client'
import { useToast } from '../../context/ToastContext'

export default function AdminCategories() {
  const toast = useToast()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [busyId, setBusyId] = useState(null)

  const loadCategories = useCallback(() => {
    setLoading(true)
    api
      .getCategories()
      .then(setCategories)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setError('')
    try {
      const category = await api.createCategory({ name: newName.trim() })
      setCategories((prev) => [...prev, category])
      setNewName('')
      toast.success('Category created')
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    }
  }

  const startEdit = (category) => {
    setEditingId(category.category_id)
    setEditName(category.name)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
  }

  const handleUpdate = async (categoryId) => {
    if (!editName.trim()) return
    setBusyId(categoryId)
    setError('')
    try {
      const updated = await api.updateCategory(categoryId, { name: editName.trim() })
      setCategories((prev) =>
        prev.map((cat) => (cat.category_id === categoryId ? updated : cat)),
      )
      cancelEdit()
      toast.success('Category updated')
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (category) => {
    if (category.book_count > 0) {
      toast.error('Move or delete books in this category first')
      return
    }
    if (!window.confirm(`Delete category "${category.name}"?`)) return
    setBusyId(category.category_id)
    setError('')
    try {
      await api.deleteCategory(category.category_id)
      setCategories((prev) => prev.filter((c) => c.category_id !== category.category_id))
      toast.success('Category deleted')
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <LoadingSpinner label="Loading categories..." />

  return (
    <div className="page">
      <div className="page-header">
        <h1>Categories</h1>
        <p className="muted">Organize books into browsable categories.</p>
      </div>

      {error && <p className="form-error">{error}</p>}

      <form className="form-card inline-form" onSubmit={handleCreate}>
        <label>
          New category
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Fiction"
            minLength={2}
            required
          />
        </label>
        <button type="submit" className="btn btn-primary">
          Add category
        </button>
      </form>

      {categories.length === 0 ? (
        <p className="page-message">No categories yet. Add one above.</p>
      ) : (
        <div className="admin-table">
          {categories.map((category) => (
            <div key={category.category_id} className="admin-table-row">
              {editingId === category.category_id ? (
                <>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="inline-edit-input"
                  />
                  <div className="listing-buttons">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleUpdate(category.category_id)}
                      disabled={busyId === category.category_id}
                    >
                      Save
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span>
                    <span className="admin-table-label">{category.name}</span>
                    <span className="muted category-count">
                      {category.book_count || 0} {(category.book_count || 0) === 1 ? 'book' : 'books'}
                    </span>
                  </span>
                  <div className="listing-buttons">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => startEdit(category)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleDelete(category)}
                      disabled={busyId === category.category_id || category.book_count > 0}
                      title={
                        category.book_count > 0
                          ? 'Move or delete books in this category first'
                          : 'Delete category'
                      }
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
