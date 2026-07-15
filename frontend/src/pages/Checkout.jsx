import { useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useShop } from '../context/ShopContext'

const DELIVERY_CHARGES = { 'Inside Valley': 100, 'Outside Valley': 150 }
const emptyDelivery = { name: '', phone: '', address: '', location: 'Inside Valley' }

export default function Checkout() {
  const { user } = useAuth()
  const { cart, cartTotal, checkout } = useShop()
  const location = useLocation()
  const navigate = useNavigate()

  const singleBook = location.state?.book || null
  const isSingleBook = Boolean(singleBook)

  const cartItems = useMemo(() => cart.filter((item) => item.book), [cart])
  const orderCount = isSingleBook ? 1 : cartItems.length

  const items = isSingleBook
    ? [
        { label: 'Book', value: singleBook.title },
        ...(singleBook.author ? [{ label: 'Author', value: singleBook.author }] : []),
      ]
    : cartItems.map((item) => ({
        label: item.book.title,
        value: `NPR ${item.book.price.toFixed(2)}`,
      }))

  const subtotal = isSingleBook ? singleBook.price : cartTotal

  const [delivery, setDelivery] = useState(emptyDelivery)
  const [fieldErrors, setFieldErrors] = useState({})
  const [status, setStatus] = useState('confirm')
  const [error, setError] = useState('')
  const [placedCount, setPlacedCount] = useState(0)

  const deliveryCharge = DELIVERY_CHARGES[delivery.location] * orderCount
  const total = subtotal + deliveryCharge

  if (!isSingleBook && cartItems.length === 0 && status !== 'success') {
    return <Navigate to="/cart" replace />
  }

  const handleDeliveryChange = (field) => (e) => {
    setDelivery((prev) => ({ ...prev, [field]: e.target.value }))
    setFieldErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10)
    setDelivery((prev) => ({ ...prev, phone: digitsOnly }))
    setFieldErrors((prev) => ({ ...prev, phone: '' }))
  }

  const validateDelivery = () => {
    const errors = {}
    if (delivery.name.trim().length < 2) {
      errors.name = 'Enter your full name'
    }
    if (delivery.phone.length !== 10) {
      errors.phone = 'Enter a valid 10-digit phone number'
    }
    if (delivery.address.trim().length < 5) {
      errors.address = 'Enter your delivery address'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleConfirm = async (e) => {
    e.preventDefault()
    setError('')
    if (!validateDelivery()) return

    setStatus('processing')
    const deliveryDetails = {
      delivery_name: delivery.name.trim(),
      delivery_phone: delivery.phone.trim(),
      delivery_address: delivery.address.trim(),
      delivery_location: delivery.location,
      payment_method: 'COD',
    }
    try {
      if (isSingleBook) {
        await api.createOrder({
          book_id: singleBook.book_id,
          buyer_id: user.user_id,
          total_amount: singleBook.price,
          ...deliveryDetails,
        })
        setPlacedCount(1)
      } else {
        const result = await checkout(deliveryDetails)
        setPlacedCount(result.orders.length)
      }
      setStatus('success')
    } catch (err) {
      setError(err.message)
      setStatus('confirm')
    }
  }

  if (status === 'success') {
    return (
      <div className="page checkout-page">
        <div className="checkout-success form-card">
          <div className="payment-success-icon">✓</div>
          <h2>Order placed</h2>
          <p className="muted">
            {isSingleBook
              ? `Your order for "${singleBook.title}" has been placed.`
              : `Order placed for ${placedCount} book(s)!`}
          </p>
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => navigate('/orders')}
          >
            View orders
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page checkout-page">
      <div className="page-header">
        <h1>Confirm your purchase</h1>
        <p className="muted">Enter where this order should be delivered.</p>
      </div>

      <form className="form-card" onSubmit={handleConfirm}>
        <label>
          Full name
          <input
            value={delivery.name}
            onChange={handleDeliveryChange('name')}
            disabled={status === 'processing'}
          />
          {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
        </label>

        <label>
          Phone number
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={delivery.phone}
            onChange={handlePhoneChange}
            disabled={status === 'processing'}
          />
          {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
        </label>

        <label>
          Delivery address
          <textarea
            rows={2}
            value={delivery.address}
            onChange={handleDeliveryChange('address')}
            disabled={status === 'processing'}
          />
          {fieldErrors.address && <span className="field-error">{fieldErrors.address}</span>}
        </label>

        <div className="form-field">
          <span className="form-field-label">Delivery location</span>
          <div className="payment-method-option">
            <label className="delivery-location-option">
              <input
                type="radio"
                name="delivery-location"
                checked={delivery.location === 'Inside Valley'}
                onChange={() => setDelivery((prev) => ({ ...prev, location: 'Inside Valley' }))}
                disabled={status === 'processing'}
              />
              <span>Inside Valley (NPR 100)</span>
            </label>
            <label className="delivery-location-option">
              <input
                type="radio"
                name="delivery-location"
                checked={delivery.location === 'Outside Valley'}
                onChange={() => setDelivery((prev) => ({ ...prev, location: 'Outside Valley' }))}
                disabled={status === 'processing'}
              />
              <span>Outside Valley (NPR 150)</span>
            </label>
          </div>
        </div>

        <div className="payment-method-option selected">
          <input type="radio" checked readOnly />
          <span>Cash on Delivery (COD)</span>
        </div>

        <div className="payment-summary">
          {items.map((item, index) => (
            <div key={`${item.label}-${index}`} className="payment-summary-row">
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
          ))}
          <div className="payment-summary-row">
            <span>Delivery charge</span>
            <span>NPR {deliveryCharge.toFixed(2)}</span>
          </div>
          <div className="payment-summary-row payment-summary-total">
            <span>Total</span>
            <span>NPR {total.toFixed(2)}</span>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="checkout-actions">
          <Link
            to={isSingleBook ? `/books/${singleBook.book_id}` : '/cart'}
            className="btn btn-ghost"
          >
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={status === 'processing'}>
            {status === 'processing' ? 'Placing order...' : 'Place order'}
          </button>
        </div>
      </form>
    </div>
  )
}
