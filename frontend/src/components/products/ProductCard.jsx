import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { ShoppingCart, Package, User, Leaf, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ProductCard({ product, showStatus }) {
  const { add } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState('')
  const [imgIndex, setImgIndex] = useState(0)

  const images = Array.isArray(product.images) ? product.images : []
  const hasImages = images.length > 0
  const isOwner = user && product.farmer_id === user.id

  const prevImage = () => setImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  const nextImage = () => setImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))

  const handleAdd = async () => {
    if (!user) { navigate('/login'); return }
    setAdding(true)
    setMessage('')
    try {
      await add(product.id, quantity)
      setMessage('Agregado!')
      setTimeout(() => setMessage(''), 2000)
    } catch (e) {
      setMessage(e.response?.data?.message || 'Error al agregar')
    } finally { setAdding(false) }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 group border border-gray-200 dark:border-gray-600">
      <div className="h-48 relative bg-gradient-to-br from-green-100 to-green-50">
        {showStatus && isOwner && (
          <span className={`absolute top-2 left-2 z-10 px-2.5 py-1 rounded-full text-xs font-semibold shadow ${product.active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {product.active ? 'Visible' : 'Oculto'}
          </span>
        )}
        {hasImages ? (
          <>
            <img
              src={images[imgIndex]?.url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <div
                  className="absolute inset-0 z-10 cursor-pointer"
                  onClick={(e) => {
                    const x = e.clientX - e.currentTarget.getBoundingClientRect().left
                    x < e.currentTarget.offsetWidth / 2 ? prevImage() : nextImage()
                  }}
                >
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow transition-colors">
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </span>
                  <span className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow transition-colors">
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </span>
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1 pointer-events-none">
                  {images.map((_, i) => (
                    <span key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIndex ? 'bg-white shadow' : 'bg-white/50'}`} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <Leaf className="w-16 h-16 text-green-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{product.name}</h3>
        {product.category && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs rounded-full">
            {product.category.icon && <span className="mr-1">{product.category.icon}</span>}
            {product.category.name}
          </span>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-green-700 font-bold text-xl">
            ${Number(product.price).toLocaleString('es-CL')}
          </span>
          <span className="text-sm text-gray-400 dark:text-gray-500">/{product.unit}</span>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Package className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Stock: {product.stock}</span>
          <span className="text-xs text-gray-400 dark:text-gray-600">|</span>
          <Link to={`/agricultor/${product.farmer?.id}`} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:underline">
            {product.farmer?.avatar_url ? (
              <img src={product.farmer.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            )}
            {product.farmer?.name}
          </Link>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input type="number" min="0.5" step="0.5" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded text-sm" />
          <button onClick={handleAdd} disabled={adding || product.stock === 0} className="flex-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-1">
            <ShoppingCart className="w-4 h-4" />
            {adding ? '...' : 'Agregar'}
          </button>
        </div>
        {message && (
          <p className={`text-xs mt-1 ${message === 'Agregado!' ? 'text-green-600' : 'text-red-500'}`}>{message}</p>
        )}
      </div>
    </div>
  )
}
