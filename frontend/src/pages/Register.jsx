import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import PasswordInput from '../components/PasswordInput'
import { homePathForRole } from '../components/ProtectedRoute'
import { useAuth } from '../context/AuthContext'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const roleCards = [
  {
    value: 'buyer',
    title: 'Buyer',
    description: 'Discover and purchase used books from sellers.',
  },
  {
    value: 'seller',
    title: 'Seller',
    description: 'List and sell your own used books to buyers.',
  },
]

const stepLabels = ['Account type', 'Personal details', 'Set password']

export default function Register() {
  const [searchParams] = useSearchParams()
  const { register, loading, formResetKey } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [role, setRole] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const paramRole = searchParams.get('role')
    setStep(1)
    setRole(['buyer', 'seller'].includes(paramRole) ? paramRole : '')
    setUsername('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setEmailError('')
    setError('')
  }, [searchParams, formResetKey])

  const handleEmailBlur = () => {
    setEmailError(
      email && !emailPattern.test(email) ? 'Enter a valid email address' : '',
    )
  }

  const goToDetails = () => {
    if (!role) return
    setError('')
    setStep(2)
  }

  const goToPassword = (e) => {
    e.preventDefault()
    setError('')
    if (!emailPattern.test(email)) {
      setEmailError('Enter a valid email address')
      return
    }
    setStep(3)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    try {
      const user = await register({ username, email, password, role })
      navigate(homePathForRole(user.role))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page auth-page">
      <div className="auth-wrapper">
        <div className="signup-steps">
          {stepLabels.map((label, index) => {
            const stepNumber = index + 1
            return (
              <div
                key={label}
                className={`signup-step ${step === stepNumber ? 'active' : ''} ${
                  step > stepNumber ? 'done' : ''
                }`}
              >
                <span className="signup-step-number">{stepNumber}</span>
                {label}
              </div>
            )
          })}
        </div>

        <div className="auth-card">
          <h1>Create your account</h1>
          <p className="muted">Join BookSwap to buy or sell used books.</p>

          {error && <p className="form-error">{error}</p>}

          {step === 1 && (
            <>
              <div className="role-cards">
                {roleCards.map((card) => (
                  <button
                    key={card.value}
                    type="button"
                    className={`role-card ${role === card.value ? 'selected' : ''}`}
                    onClick={() => setRole(card.value)}
                  >
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={goToDetails}
                disabled={!role}
              >
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <form onSubmit={goToPassword}>
              <label>
                Username
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (emailError) setEmailError('')
                  }}
                  onBlur={handleEmailBlur}
                  autoComplete="username"
                  required
                />
                {emailError && <span className="field-error">{emailError}</span>}
              </label>

              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
                  Back
                </button>
                <button type="submit" className="btn btn-primary">
                  Continue
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <label>
                Password
                <PasswordInput
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  autoComplete="new-password"
                  required
                />
              </label>

              <label>
                Confirm Password
                <PasswordInput
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  autoComplete="new-password"
                  required
                />
              </label>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setStep(2)}
                  disabled={loading}
                >
                  Back
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </form>
          )}

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
          <p className="auth-footer">
            <Link to="/">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
