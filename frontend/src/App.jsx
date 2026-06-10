import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import PublicLayout from './layouts/PublicLayout'
import UserLayout from './layouts/UserLayout'
import BookDetail from './pages/BookDetail'
import CreateBook from './pages/CreateBook'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Orders from './pages/Orders'
import Register from './pages/Register'
import UserHome from './pages/user/UserHome'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login/:role" element={<Login />} />
            <Route path="/register/:role" element={<Register />} />
            <Route path="/books/:id" element={<BookDetail />} />
          </Route>

          <Route
            element={
              <ProtectedRoute roles={['buyer', 'admin']}>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/user" element={<UserHome />} />
            <Route path="/orders" element={<Orders />} />
          </Route>

          <Route
            path="/sell"
            element={
              <ProtectedRoute roles={['seller', 'admin']}>
                <CreateBook />
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<Navigate to="/login/user" replace />} />
          <Route path="/register" element={<Navigate to="/register/user" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
