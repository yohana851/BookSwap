const API_BASE = import.meta.env.VITE_API_URL || '/api'

function getToken() {
  return localStorage.getItem('access_token')
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      data.error ||
      data.errors?.join?.(', ') ||
      Object.values(data.errors || {}).flat().join(', ') ||
      'Request failed'
    throw new Error(message)
  }

  return data
}

export const api = {
  health: () => request('/health'),

  register: (body) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  getBooks: () => request('/books'),
  getBook: (id) => request(`/books/${id}`),
  createBook: (body) =>
    request('/books', { method: 'POST', body: JSON.stringify(body) }),
  updateBook: (id, body) =>
    request(`/books/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteBook: (id) => request(`/books/${id}`, { method: 'DELETE' }),

  getCategories: () => request('/categories'),

  getOrders: () => request('/orders'),
  createOrder: (body) =>
    request('/orders', { method: 'POST', body: JSON.stringify(body) }),
}
