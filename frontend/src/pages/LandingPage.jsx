import { useState } from 'react'
import AboutSection from '../components/sections/AboutSection'
import BooksSection from '../components/sections/BooksSection'
import CategoriesSection from '../components/sections/CategoriesSection'
import HeroSection from '../components/sections/HeroSection'
import HowItWorksSection from '../components/sections/HowItWorksSection'
import ServicesSection from '../components/sections/ServicesSection'

export default function LandingPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId)
    document.getElementById('books')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="landing-page">
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <CategoriesSection onSelectCategory={handleCategorySelect} />
      <HowItWorksSection role="user" />
      <BooksSection
        isAuthenticated={false}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        showBuy={false}
      />
    </div>
  )
}
