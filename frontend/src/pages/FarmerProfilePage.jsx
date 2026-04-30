import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProducts, getFarmerReviews, createReview, deleteReview } from '../services/authService'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Phone, MapPin, Leaf, ArrowLeft, Package, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import ProductCard from '../components/products/ProductCard'

function StarRating({ rating, onRate, interactive = false }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(i)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <Star className={`w-5 h-5 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
        </button>
      ))}
    </div>
  )
}

export default function FarmerProfilePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [farmer, setFarmer] = useState(null)
  const [reviews, setReviews] = useState([])
  const [avgRating, setAvgRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(5)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const [prodRes, revRes] = await Promise.all([
        getProducts({ farmer_id: id }),
        getFarmerReviews(id),
      ])
      setProducts(prodRes.data.data || [])
      if (prodRes.data.data?.length > 0) setFarmer(prodRes.data.data[0].farmer)
      setReviews(revRes.data.reviews || [])
      setAvgRating(revRes.data.average || 0)
      setReviewCount(revRes.data.count || 0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!user) return toast.error('Debes iniciar sesión para comentar')
    if (!comment.trim()) return
    setSubmitting(true)
    try {
      await createReview({ farmer_id: Number(id), rating, comment })
      toast.success('Reseña publicada')
      setComment('')
      setRating(5)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al publicar')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (confirm('Eliminar tu reseña?')) {
      await deleteReview(reviewId)
      loadData()
      toast.success('Reseña eliminada')
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div></div>

  if (!farmer) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <User className="w-20 h-20 mx-auto text-gray-300 mb-4" />
        <p className="text-xl text-gray-500">Agricultor no encontrado</p>
        <Link to="/" className="text-green-600 hover:underline mt-2 inline-block">Volver al catálogo</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-gradient-to-br from-green-700 to-green-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <Link to="/" className="text-green-200 hover:text-white text-sm flex items-center gap-1 mb-6">
            <ArrowLeft className="w-4 h-4" /> Volver al catálogo
          </Link>
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center ring-4 ring-white/30 overflow-hidden">
              {farmer.avatar_url ? (
                <img src={farmer.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{farmer.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-0.5 bg-green-600 rounded-full text-sm font-medium">Agricultor</span>
                {reviewCount > 0 && (
                  <div className="flex items-center gap-1 text-yellow-300 text-sm">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium">{avgRating}</span>
                    <span className="text-green-200">({reviewCount})</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {farmer.email && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><Mail className="w-5 h-5 text-green-600" /></div>
              <div><p className="text-xs text-gray-400">Email</p><p className="text-sm font-medium text-gray-700">{farmer.email}</p></div>
            </div>
          )}
          {farmer.phone && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><Phone className="w-5 h-5 text-blue-600" /></div>
              <div><p className="text-xs text-gray-400">Teléfono</p><p className="text-sm font-medium text-gray-700">{farmer.phone}</p></div>
            </div>
          )}
          {farmer.address && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><MapPin className="w-5 h-5 text-orange-600" /></div>
              <div><p className="text-xs text-gray-400">Dirección</p><p className="text-sm font-medium text-gray-700">{farmer.address}</p></div>
            </div>
          )}
        </div>

        {/* Products */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Leaf className="w-6 h-6 text-green-600" />
            Productos de {farmer.name}
            <span className="text-sm font-normal text-gray-400">({products.length})</span>
          </h2>
          {products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
              <Package className="w-16 h-16 mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400">Sin productos disponibles por ahora</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (<ProductCard key={product.id} product={product} showStatus />))}
            </div>
          )}
        </div>

        {/* Separador */}
        <div className="flex items-center gap-4 my-10">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
        </div>

        {/* Reviews + Map */}
        <div className="mb-12 max-w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                Reseñas
                <span className="text-sm font-normal text-gray-400">({reviewCount})</span>
              </h2>

          {user && user.id !== Number(id) && (
            <form onSubmit={handleSubmitReview} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 max-w-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Deja tu reseña</h3>
              <div className="mb-3">
                <StarRating rating={rating} onRate={setRating} interactive />
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Cuéntanos tu experiencia..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
                rows={3}
                required
              />
              <button type="submit" disabled={submitting} className="mt-3 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium">
                {submitting ? 'Publicando...' : 'Publicar reseña'}
              </button>
            </form>
          )}

          {reviews.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Sin reseñas aún. ¡Sé el primero en comentar!</p>
          ) : (
            <>
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                      {rev.user?.avatar_url ? (
                        <img src={rev.user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"><User className="w-5 h-5 text-gray-400" /></div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{rev.user?.name}</p>
                        <StarRating rating={rev.rating} />
                        <span className="text-xs text-gray-400">{new Date(rev.created_at).toLocaleDateString('es-CL')}</span>
                      </div>
                      {(user?.id === rev.user_id || user?.role === 'admin') && (
                        <button onClick={() => handleDeleteReview(rev.id)} className="ml-auto text-gray-300 hover:text-red-500 flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="mt-3 text-gray-600 text-sm line-clamp-3">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </>
          )}
            </div>

            {/* Separador vertical */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-px h-full min-h-[200px] bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
            </div>

            {/* Mapa */}
            {farmer.maps_url && (
              <div className="lg:col-span-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-red-500" />
                  Ubicación
                </h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <iframe
                    src={farmer.maps_url}
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Ubicación"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 text-center">
                  <a href={farmer.maps_url} target="_blank" rel="noopener noreferrer" className="hover:underline">Ver en Google Maps</a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
