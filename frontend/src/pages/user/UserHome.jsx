import { useEffect, useState } from 'react'
import AboutSection from '../../components/sections/AboutSection'
import BooksSection from '../../components/sections/BooksSection'
import CategoriesSection from '../../components/sections/CategoriesSection'
import HeroSection from '../../components/sections/HeroSection'
import HowItWorksSection from '../../components/sections/HowItWorksSection'
import ServicesSection from '../../components/sections/ServicesSection'

export default function UserHome() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId)
    document.getElementById('books')?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash)
      el?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  return (
    <div className="user-home-page">
      <HeroSection isAuthenticated />
      <AboutSection />
      <ServicesSection />
      <CategoriesSection onSelectCategory={handleCategorySelect} />
      <HowItWorksSection role="user" />
      <BooksSection
        isAuthenticated
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        showBuy
      />
    </div>
  )
}
