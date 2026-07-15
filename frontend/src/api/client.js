import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

function extractErrorMessage(data) {
  if (!data) return 'Request failed'
  if (data.error) return data.error
  if (Array.isArray(data.errors)) return data.errors.join(', ')
  if (data.errors && typeof data.errors === 'object') {
    return Object.values(data.errors).flat().join(', ')
  }
  if (data.msg) return data.msg
  return 'Request failed'
}

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      return Promise.reject(
        new Error(
          'Cannot reach the server. Start the backend with start-backend.bat or run: python run.py',
        ),
      )
    }
    const message = extractErrorMessage(error.response.data)
    return Promise.reject(new Error(message))
  },
)

export const api = {
  health: () => apiClient.get('/health'),

  register: (body) => apiClient.post('/auth/register', body),
  login: (body) => apiClient.post('/auth/login', body),

  getBooks: () => apiClient.get('/books'),
  getBook: (id) => apiClient.get(`/books/${id}`),
  createBook: (body) => apiClient.post('/books', body),
  updateBook: (id, body) => apiClient.put(`/books/${id}`, body),
  deleteBook: (id) => apiClient.delete(`/books/${id}`),

  getCategories: () => apiClient.get('/categories'),
  getCategory: (id) => apiClient.get(`/categories/${id}`),
  createCategory: (body) => apiClient.post('/categories', body),
  updateCategory: (id, body) => apiClient.put(`/categories/${id}`, body),
  deleteCategory: (id) => apiClient.delete(`/categories/${id}`),

  getUsers: () => apiClient.get('/users'),
  getUser: (id) => apiClient.get(`/users/${id}`),
  updateUser: (id, body) => apiClient.put(`/users/${id}`, body),
  deleteUser: (id) => apiClient.delete(`/users/${id}`),

  getOrders: () => apiClient.get('/orders'),
  getOrder: (id) => apiClient.get(`/orders/${id}`),
  createOrder: (body) => apiClient.post('/orders', body),
  updateOrder: (id, body) => apiClient.put(`/orders/${id}`, body),
  deleteOrder: (id) => apiClient.delete(`/orders/${id}`),
  acceptOrder: (id) => apiClient.post(`/orders/${id}/accept`),
  deliverOrder: (id) => apiClient.post(`/orders/${id}/deliver`),

  // Image upload (multipart/form-data). Returns { image_url, filename }.
  uploadImage: (file) => {
    const data = new FormData()
    data.append('file', file)
    return apiClient.post('/uploads', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // Reviews & ratings
  getReviews: (bookId) => apiClient.get(`/books/${bookId}/reviews`),
  createReview: (bookId, body) => apiClient.post(`/books/${bookId}/reviews`, body),
  deleteReview: (reviewId) => apiClient.delete(`/reviews/${reviewId}`),

  // Cart
  getCart: () => apiClient.get('/cart'),
  addToCart: (bookId) => apiClient.post('/cart', { book_id: bookId }),
  removeFromCart: (bookId) => apiClient.delete(`/cart/${bookId}`),
  checkoutCart: (body) => apiClient.post('/cart/checkout', body),

  // Wishlist
  getWishlist: () => apiClient.get('/wishlist'),
  addToWishlist: (bookId) => apiClient.post('/wishlist', { book_id: bookId }),
  removeFromWishlist: (bookId) => apiClient.delete(`/wishlist/${bookId}`),
}
