import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PasswordInput from '../components/PasswordInput'
import { homePathForRole } from '../components/ProtectedRoute'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, loading, formResetKey } = useAuth()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setIdentifier('')
    setPassword('')
    setError('')
  }, [formResetKey])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const user = await login(identifier, password)
      navigate(homePathForRole(user.role))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page auth-page">
      <div className="auth-wrapper">
        <form key={formResetKey} className="auth-card" onSubmit={handleSubmit}>
          <h1>Sign In</h1>
          <p className="muted">Log in to your BookSwap account</p>

          {error && <p className="form-error">{error}</p>}

          <label>
            Username or Email
            <input
              type="text"
              name="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label>
            Password
            <PasswordInput
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="auth-footer">
            No account? <Link to="/register">Create one</Link>
          </p>
          <p className="auth-footer">
            <Link to="/">← Back to home</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
