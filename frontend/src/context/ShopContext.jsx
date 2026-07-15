import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { api } from '../api/client'
import { useAuth } from './AuthContext'

const ShopContext = createContext(null)

export function ShopProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const [cart, setCart] = useState([])
  const [cartTotal, setCartTotal] = useState(0)
  const [wishlist, setWishlist] = useState([])

  const canShop =
    isAuthenticated && (user?.role === 'buyer' || user?.role === 'admin')

  const refresh = useCallback(async () => {
    if (!canShop) {
      setCart([])
      setCartTotal(0)
      setWishlist([])
      return
    }
    try {
      const [cartData, wishlistData] = await Promise.all([
        api.getCart(),
        api.getWishlist(),
      ])
      setCart(cartData.items || [])
      setCartTotal(cartData.total || 0)
      setWishlist(wishlistData.items || [])
    } catch {
      // Silently ignore — keep whatever we already have.
    }
  }, [canShop])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addToCart = useCallback(
    async (bookId) => {
      await api.addToCart(bookId)
      await refresh()
    },
    [refresh],
  )

  const removeFromCart = useCallback(
    async (bookId) => {
      await api.removeFromCart(bookId)
      await refresh()
    },
    [refresh],
  )

  const checkout = useCallback(
    async (deliveryDetails) => {
      const result = await api.checkoutCart(deliveryDetails)
      await refresh()
      return result
    },
    [refresh],
  )

  const addToWishlist = useCallback(
    async (bookId) => {
      await api.addToWishlist(bookId)
      await refresh()
    },
    [refresh],
  )

  const removeFromWishlist = useCallback(
    async (bookId) => {
      await api.removeFromWishlist(bookId)
      await refresh()
    },
    [refresh],
  )

  const value = useMemo(
    () => ({
      cart,
      cartTotal,
      cartCount: cart.length,
      wishlist,
      wishlistCount: wishlist.length,
      canShop,
      isInCart: (bookId) => cart.some((item) => item.book_id === bookId),
      isInWishlist: (bookId) => wishlist.some((item) => item.book_id === bookId),
      addToCart,
      removeFromCart,
      checkout,
      addToWishlist,
      removeFromWishlist,
      refresh,
    }),
    [
      cart,
      cartTotal,
      wishlist,
      canShop,
      addToCart,
      removeFromCart,
      checkout,
      addToWishlist,
      removeFromWishlist,
      refresh,
    ],
  )

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  const context = useContext(ShopContext)
  if (!context) {
    throw new Error('useShop must be used within ShopProvider')
  }
  return context
}
