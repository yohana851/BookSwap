import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const roleConfig = {
  user: {
    title: 'Create User Account',
    subtitle: 'Join as a buyer to discover and purchase books',
    loginPath: '/login/user',
    redirectPath: '/user',
    role: 'buyer',
  },
  seller: {
    title: 'Create Seller Account',
    subtitle: 'Join as a seller to list and sell your books',
    loginPath: '/login/seller',
    redirectPath: '/sell',
    role: 'seller',
  },
}

export default function Register() {
  const { role = 'user' } = useParams()
  const config = roleConfig[role] || roleConfig.user
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await register({ ...form, role: config.role })
      navigate(config.redirectPath)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page auth-page">
      <div className="auth-wrapper">
        <div className="auth-role-tabs">
          <Link
            to="/register/user"
            className={`auth-tab ${role === 'user' ? 'active' : ''}`}
          >
            User
          </Link>
          <Link
            to="/register/seller"
            className={`auth-tab ${role === 'seller' ? 'active' : ''}`}
          >
            Seller
          </Link>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <h1>{config.title}</h1>
          <p className="muted">{config.subtitle}</p>

          {error && <p className="form-error">{error}</p>}

          <label>
            Username
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </label>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>

          <p className="auth-footer">
            Already have an account? <Link to={config.loginPath}>Sign in</Link>
          </p>
          <p className="auth-footer">
            <Link to="/">← Back to home</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
