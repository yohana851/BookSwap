export default function AboutSection() {
  return (
    <section id="about" className="section about-section">
      <div className="section-header">
        <span className="section-label">About Us</span>
        <h2>Why BookSwap?</h2>
        <p className="section-desc">
          We built BookSwap to make reading more affordable and sustainable. Every book
          deserves another reader.
        </p>
      </div>
      <div className="about-grid">
        <article className="about-card">
          <div className="about-icon">🌱</div>
          <h3>Sustainable Reading</h3>
          <p>
            Reuse books instead of buying new. Reduce waste and keep stories circulating
            in your community.
          </p>
        </article>
        <article className="about-card">
          <div className="about-icon">💰</div>
          <h3>Affordable Prices</h3>
          <p>
            Pre-owned books cost a fraction of retail. Great reads without stretching your
            budget.
          </p>
        </article>
        <article className="about-card">
          <div className="about-icon">🤝</div>
          <h3>Trusted Community</h3>
          <p>
            Verified users, clear book conditions, and secure orders so you can buy with
            confidence.
          </p>
        </article>
      </div>
    </section>
  )
}
