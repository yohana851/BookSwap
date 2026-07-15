import { useState } from 'react'
export default function PasswordInput({
  id,
  name,
  value,
  onChange,
  required = false,
  minLength,
  autoComplete = 'current-password',
}) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="password-field">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className="password-field-input"
      />
      <button
        type="button"
        className="password-field-toggle"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}