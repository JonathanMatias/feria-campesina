import { useState, useEffect } from 'react'
import { getProducts, getCategories } from '../services/authService'
import { useAuth } from '../contexts/AuthContext'
import ProductCard from '../components/products/ProductCard'
import { Search, Leaf, Tag, Package } from 'lucide-react'

export default function Home() {
  const { user, isAgricultor } = useAuth()
  const [products, setProducts] = useState([])
  const [myProducts, setMyProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)

  useEffect(() => {
    getCategories().then(({ data }) => setCategories(data)).catch(() => {})
    if (isAgricultor && user) {
      getProducts({ farmer_id: user.id, show_all: 1 }).then(({ data }) => setMyProducts(data.data || [])).catch(() => {})
    }
  }, [user])

  const loadProducts = async (pageNum = 1) => {
    setLoading(true)
    try {
      const params = { page: pageNum, search }
      if (categoryId) params.category_id = categoryId
      const { data } = await getProducts(params)
      setProducts(data.data || [])
      setPage(data.current_page || 1)
      setLastPage(data.last_page || 1)
    } catch (e) {
      console.error('Error loading products:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [search, categoryId])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Leaf className="w-10 h-10 text-green-600" />
          <h1 className="text-3xl font-bold text-green-800 dark:text-green-400">Productos Frescos</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Del campo directamente a tu mesa — Entregas sábados y domingos</p>
      </div>

      <div className="max-w-md mx-auto mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setCategoryId('')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!categoryId ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
          >
            <Tag className="w-3.5 h-3.5 inline mr-1" />
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryId(categoryId === String(cat.id) ? '' : String(cat.id))}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${categoryId === String(cat.id) ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              {cat.icon && <span className="mr-1">{cat.icon}</span>}
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Separador */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      </div>

      {/* Mis Productos (solo agricultor logueado) */}
      {isAgricultor && myProducts.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Package className="w-6 h-6 text-green-600" />
            Mis Productos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myProducts.map((product) => (
              <ProductCard key={product.id} product={product} showStatus />
            ))}
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        {isAgricultor ? 'Catálogo General' : ''}
      </h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Search className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-xl">No se encontraron productos</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {lastPage > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => loadProducts(p)}
                  className={`px-3 py-1 rounded ${p === page ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
