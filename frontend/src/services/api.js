import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      const publicPages = ['/', '/login', '/registro']
      const currentPath = window.location.pathname
      if (!publicPages.includes(currentPath) && !currentPath.startsWith('/productos/') && !currentPath.startsWith('/agricultor/')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
