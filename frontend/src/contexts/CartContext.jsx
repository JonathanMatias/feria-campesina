import { createContext, useContext, useState, useEffect } from 'react'
import { getCart as fetchCart, addToCart, updateCartItem, removeCartItem } from '../services/authService'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const loadCart = async () => {
    if (!user) {
      setItems([])
      setTotal(0)
      return
    }
    try {
      setLoading(true)
      const { data } = await fetchCart()
      setItems(data.items || [])
      setTotal(data.total || 0)
    } catch (e) {
      console.error('Error loading cart:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCart()
  }, [user])

  const add = async (productId, quantity) => {
    const { data } = await addToCart(productId, quantity)
    setItems(data.cart || [])
    return data
  }

  const update = async (index, quantity) => {
    const { data } = await updateCartItem(index, quantity)
    setItems(data.cart || [])
    return data
  }

  const remove = async (index) => {
    const { data } = await removeCartItem(index)
    setItems(data.cart || [])
  }

  const clear = () => {
    setItems([])
    setTotal(0)
  }

  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const value = {
    items,
    total: cartTotal,
    loading,
    add,
    update,
    remove,
    clear,
    loadCart,
    itemCount: items.length,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
