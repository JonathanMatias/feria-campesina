import api from './api'

export const login = (email, password) => api.post('/login', { email, password })
export const register = (data) => api.post('/register', data)
export const logout = () => api.post('/logout')
export const getUser = () => api.get('/user')

export const getProducts = (params) => api.get('/products', { params })
export const getProduct = (id) => api.get(`/products/${id}`)
export const createProduct = (data) => {
  if (data instanceof FormData) return api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } })
  return api.post('/products', data)
}
export const updateProduct = (id, data) => {
  if (data instanceof FormData) {
    data.append('_method', 'PUT')
    return api.post(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
  }
  return api.put(`/products/${id}`, data)
}
export const deleteProduct = (id) => api.delete(`/products/${id}`)
export const updateStock = (id, stock) => api.patch(`/products/${id}/stock`, { stock })

export const addToCart = (productId, quantity) => api.post('/cart/add', { product_id: productId, quantity })
export const getCart = () => api.get('/cart')
export const updateCartItem = (index, quantity) => api.patch(`/cart/${index}`, { quantity })
export const removeCartItem = (index) => api.delete(`/cart/${index}`)

export const createOrder = (data) => api.post('/orders', data)
export const getOrders = () => api.get('/orders')
export const getOrder = (id) => api.get(`/orders/${id}`)
export const getFarmerOrders = () => api.get('/orders/farmer')
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status })

export const getAdminUsers = () => api.get('/admin/users')
export const updateUserRole = (id, role) => api.patch(`/admin/users/${id}/role`, { role })
export const updateUser = (id, data) => {
  if (data instanceof FormData) {
    data.append('_method', 'PUT')
    return api.post(`/admin/users/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
  }
  return api.put(`/admin/users/${id}`, data)
}
export const deleteUser = (id) => api.delete(`/admin/users/${id}`)
export const getAdminOrders = () => api.get('/admin/orders')
export const updateAdminOrderStatus = (id, status) => api.patch(`/admin/orders/${id}/status`, { status })
export const getAdminStats = () => api.get('/admin/stats')
export const getAdminFarmers = () => api.get('/admin/farmers')
export const createFarmer = (data) => api.post('/admin/farmers', data)

export const getCategories = () => api.get('/categories')
export const getAllCategories = () => api.get('/admin/categories/all')
export const createCategory = (data) => api.post('/admin/categories', data)
export const updateCategory = (id, data) => api.put(`/admin/categories/${id}`, data)
export const deleteCategory = (id) => api.delete(`/admin/categories/${id}`)

export const getFarmerReviews = (farmerId) => api.get(`/farmers/${farmerId}/reviews`)
export const createReview = (data) => api.post('/reviews', data)
export const deleteReview = (id) => api.delete(`/reviews/${id}`)

export const getLogs = (params) => api.get('/admin/logs', { params })
export const getLogStats = () => api.get('/admin/logs/stats')
