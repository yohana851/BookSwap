import { useEffect, useState } from 'react'
import { api } from '../../api/client'

const categoryIcons = {
  fiction: '📚',
  science: '🔬',
  history: '🏛️',
  biography: '👤',
  children: '🧸',
  default: '📖',
}

function getCategoryIcon(name) {
  const key = name.toLowerCase()
  return categoryIcons[key] || categoryIcons.default
}

export default function CategoriesSection({ onSelectCategory }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="categories" className="section categories-section">
      <div className="section-header">
        <span className="section-label">Categories</span>
        <h2>Explore by genre</h2>
        <p className="section-desc">
          Browse books organized by category. Click a category to filter the book listings
          below.
        </p>
      </div>

      {loading ? (
        <p className="page-message">Loading categories...</p>
      ) : categories.length === 0 ? (
        <div className="categories-grid">
          {['Fiction', 'Science', 'History', 'Biography', 'Children', 'Business'].map(
            (name) => (
              <div key={name} className="category-card category-card-static">
                <span className="category-icon">{getCategoryIcon(name)}</span>
                <h3>{name}</h3>
                <p className="muted">Coming soon</p>
              </div>
            ),
          )}
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map((cat) => (
            <button
              key={cat.category_id}
              type="button"
              className="category-card"
              onClick={() => onSelectCategory?.(String(cat.category_id))}
            >
              <span className="category-icon">{getCategoryIcon(cat.name)}</span>
              <h3>{cat.name}</h3>
              <p className="muted">View books</p>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
