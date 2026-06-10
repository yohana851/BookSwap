export default function HowItWorksSection({ role = 'user' }) {
  const userSteps = [
    { step: '1', title: 'Create your account', desc: 'Sign up as a user in under a minute with email and password.' },
    { step: '2', title: 'Browse categories', desc: 'Explore books by genre, search by title or author, and compare prices.' },
    { step: '3', title: 'Buy securely', desc: 'Select a book, place your order, and track it in My Orders.' },
    { step: '4', title: 'Enjoy your read', desc: 'Receive your book and discover your next story on BookSwap.' },
  ]

  const sellerSteps = [
    { step: '1', title: 'Register as seller', desc: 'Create a seller account to list your used books.' },
    { step: '2', title: 'List your books', desc: 'Add title, price, condition, and category for each book.' },
    { step: '3', title: 'Get orders', desc: 'Buyers purchase your listings and books are marked as sold.' },
    { step: '4', title: 'Earn & declutter', desc: 'Turn unused books into income while helping other readers.' },
  ]

  const steps = role === 'seller' ? sellerSteps : userSteps

  return (
    <section id="how-it-works" className="section how-section">
      <div className="section-header">
        <span className="section-label">How It Works</span>
        <h2>Simple steps to get started</h2>
        <p className="section-desc">
          {role === 'seller'
            ? 'Start selling your books in four easy steps.'
            : 'From sign-up to your next great read in four easy steps.'}
        </p>
      </div>
      <div className="steps-grid">
        {steps.map((item) => (
          <article key={item.step} className="step-card">
            <span className="step-number">{item.step}</span>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
