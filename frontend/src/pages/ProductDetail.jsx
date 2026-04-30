import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProduct } from '../services/authService'
import { useCart } from '../contexts/CartContext'
import { Leaf, Package, User, Phone, ShoppingCart, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [imgIndex, setImgIndex] = useState(0)
  const { add } = useCart()

  useEffect(() => { loadProduct() }, [id])

  const loadProduct = async () => {
    try { const { data } = await getProduct(id); setProduct(data) } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const handleAdd = async () => {
    try { await add(product.id, quantity); setMessage('Producto agregado al carrito!'); setTimeout(() => setMessage(''), 3000) } catch (e) { setMessage(e.response?.data?.message || 'Error') }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div></div>
  if (!product) return <div className="text-center py-12 text-gray-500">Producto no encontrado</div>

  const images = product.images || []
  const hasImages = images.length > 0

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/" className="text-green-600 hover:underline text-sm flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver al catálogo
      </Link>
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="h-64 rounded-lg mb-6 relative bg-gradient-to-br from-green-100 to-green-50 overflow-hidden">
          {hasImages ? (
            <>
              <img src={images[imgIndex]?.url} alt={product.name} className="w-full h-full object-cover" />
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIndex((p) => (p === 0 ? images.length - 1 : p - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center shadow"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={() => setImgIndex((p) => (p === images.length - 1 ? 0 : p + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center shadow"><ChevronRight className="w-5 h-5" /></button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (<span key={i} className={`w-2 h-2 rounded-full ${i === imgIndex ? 'bg-white' : 'bg-white/50'}`} />))}
                  </div>
                </>
              )}
            </>
          ) : (
            <Leaf className="w-20 h-20 text-green-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
        {product.category && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
            {product.category.icon && <span className="mr-1">{product.category.icon}</span>}{product.category.name}
          </span>
        )}
        <p className="text-gray-500 mt-2">{product.description}</p>
        <div className="mt-4">
          <span className="text-3xl font-bold text-green-700">${Number(product.price).toLocaleString('es-CL')}</span>
          <span className="text-gray-400 ml-2">/ {product.unit}</span>
        </div>
        <div className="mt-4 space-y-2 text-sm text-gray-500">
          <p className="flex items-center gap-2"><Package className="w-4 h-4" /> Stock disponible: <strong>{product.stock}</strong></p>
          <p className="flex items-center gap-2">
            {product.farmer?.avatar_url ? (
              <img src={product.farmer.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <User className="w-4 h-4" />
            )}
            Agricultor:{' '}
            <Link to={`/agricultor/${product.farmer?.id}`} className="hover:text-green-600 hover:underline">
              <strong>{product.farmer?.name}</strong>
            </Link>
          </p>
          {product.farmer?.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {product.farmer.phone}</p>}
        </div>
        <div className="mt-6 flex items-center gap-3">
          <input type="number" min="0.5" step="0.5" max={product.stock} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-20 px-3 py-2 border rounded" />
          <button onClick={handleAdd} disabled={product.stock === 0} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50 font-medium flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> Agregar al Carrito
          </button>
        </div>
        {message && <p className="mt-3 text-green-600 font-medium">{message}</p>}
      </div>
    </div>
  )
}
