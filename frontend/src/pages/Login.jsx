import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const roleConfig = {
  user: {
    title: 'User Sign In',
    subtitle: 'Log in to browse and buy used books',
    registerPath: '/register/user',
    redirectPath: '/user',
    expectedRoles: ['buyer', 'admin'],
    wrongRoleMessage: 'This login is for users (buyers). Sellers should use seller sign in.',
  },
  seller: {
    title: 'Seller Sign In',
    subtitle: 'Log in to list and manage your books',
    registerPath: '/register/seller',
    redirectPath: '/sell',
    expectedRoles: ['seller', 'admin'],
    wrongRoleMessage: 'This login is for sellers. Users should use user sign in.',
  },
}

export default function Login() {
  const { role = 'user' } = useParams()
  const config = roleConfig[role] || roleConfig.user
  const { login, logout, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const user = await login(email, password)
      if (!config.expectedRoles.includes(user.role)) {
        logout()
        setError(config.wrongRoleMessage)
        return
      }
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
            to="/login/user"
            className={`auth-tab ${role === 'user' ? 'active' : ''}`}
          >
            User
          </Link>
          <Link
            to="/login/seller"
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
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="auth-footer">
            No account? <Link to={config.registerPath}>Create one</Link>
          </p>
          <p className="auth-footer">
            <Link to="/">← Back to home</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
