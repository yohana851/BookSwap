export default function ServicesSection() {
  const services = [
    {
      title: 'Browse & Buy',
      desc: 'Search thousands of used books by title, author, or category. Filter by price and condition.',
      icon: '🛒',
    },
    {
      title: 'Sell Your Books',
      desc: 'List books you no longer need. Set your price and reach buyers looking for your titles.',
      icon: '📤',
    },
    {
      title: 'Secure Orders',
      desc: 'Place orders safely with tracked payment status. Your purchases are recorded in one place.',
      icon: '🔒',
    },
    {
      title: 'Category Discovery',
      desc: 'Explore Fiction, Science, History, and more. Find exactly what you want to read next.',
      icon: '🏷️',
    },
  ]

  return (
    <section id="services" className="section services-section">
      <div className="section-header">
        <span className="section-label">Services</span>
        <h2>Everything you need in one place</h2>
        <p className="section-desc">
          Whether you are buying your next favorite book or clearing your shelf, BookSwap
          has you covered.
        </p>
      </div>
      <div className="services-grid">
        {services.map((service) => (
          <article key={service.title} className="service-card">
            <div className="service-icon">{service.icon}</div>
            <h3>{service.title}</h3>
            <p>{service.desc}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
