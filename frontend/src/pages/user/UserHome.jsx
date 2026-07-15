import BooksSection from '../../components/sections/BooksSection'

export default function UserHome() {
  return (
    <div className="user-home-page">
      <BooksSection isAuthenticated showBuy />
    </div>
  )
}
