import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import { AuthProvider } from './context/AuthContext'
import { ShopProvider } from './context/ShopContext'
import { ToastProvider } from './context/ToastContext'
import AdminLayout from './layouts/AdminLayout'
import PublicLayout from './layouts/PublicLayout'
import SellerLayout from './layouts/SellerLayout'
import UserLayout from './layouts/UserLayout'
import AdminBooks from './pages/admin/AdminBooks'
import AdminCategories from './pages/admin/AdminCategories'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrders from './pages/admin/AdminOrders'
import AdminUsers from './pages/admin/AdminUsers'
import BookDetail from './pages/BookDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import CreateBook from './pages/CreateBook'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Orders from './pages/Orders'
import Register from './pages/Register'
import Wishlist from './pages/Wishlist'
import EditBook from './pages/seller/EditBook'
import MyListings from './pages/seller/MyListings'
import SellerHome from './pages/seller/SellerHome'
import SellerOrders from './pages/seller/SellerOrders'
import UserHome from './pages/user/UserHome'

export default function App() {
  return (
    <AuthProvider>
      <ShopProvider>
      <ToastProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/books/:id" element={<BookDetail />} />
            </Route>

            {/* Buyer routes */}
            <Route
              element={
                <ProtectedRoute roles={['buyer', 'admin']}>
                  <UserLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/user" element={<UserHome />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/wishlist" element={<Wishlist />} />
            </Route>

            {/* Seller routes */}
            <Route
              element={
                <ProtectedRoute roles={['seller', 'admin']}>
                  <SellerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/seller" element={<SellerHome />} />
              <Route path="/seller/listings" element={<MyListings />} />
              <Route path="/seller/orders" element={<SellerOrders />} />
              <Route path="/seller/edit/:id" element={<EditBook />} />
              <Route path="/sell" element={<CreateBook />} />
            </Route>

            {/* Admin routes */}
            <Route
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/books" element={<AdminBooks />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
      </ShopProvider>
    </AuthProvider>
  )
}
