// Displays a star rating. When `onRate` is provided, stars become clickable.
export default function RatingStars({ value = 0, onRate, size = 'md' }) {
  const interactive = typeof onRate === 'function'
  return (
    <span className={`rating-stars rating-stars-${size}`} role={interactive ? 'radiogroup' : 'img'} aria-label={`Rating: ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(value)
        const Star = interactive ? 'button' : 'span'
        return (
          <Star
            key={star}
            type={interactive ? 'button' : undefined}
            className={`star ${filled ? 'filled' : ''} ${interactive ? 'clickable' : ''}`}
            onClick={interactive ? () => onRate(star) : undefined}
            aria-label={interactive ? `${star} star${star > 1 ? 's' : ''}` : undefined}
          >
            ★
          </Star>
        )
      })}
    </span>
  )
}
