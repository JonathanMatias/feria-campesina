import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { Trash2, ShoppingCart, ArrowRight, Leaf } from 'lucide-react'

export default function Cart() {
  const { items, total, update, remove, loading } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500 mb-4">Inicia sesión para ver tu carrito</p>
        <Link to="/login" className="text-green-600 hover:underline">Iniciar Sesión</Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-xl text-gray-500 mb-4">Tu carrito está vacío</p>
        <Link to="/" className="text-green-600 hover:underline font-medium flex items-center justify-center gap-1">
          <Leaf className="w-4 h-4" /> Ver productos
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <ShoppingCart className="w-6 h-6 text-green-600" />
        Mi Carrito
      </h1>

      <div className="bg-white rounded-lg shadow-md">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 border-b last:border-b-0">
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">{item.name}</h3>
              <p className="text-sm text-gray-500">{item.farmer_name} | ${Number(item.price).toLocaleString('es-CL')}/{item.unit}</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={item.quantity}
                onChange={(e) => update(index, Number(e.target.value))}
                className="w-20 px-2 py-1 border rounded text-center text-sm"
              />
              <span className="text-green-700 font-medium w-24 text-right">
                ${(item.price * item.quantity).toLocaleString('es-CL')}
              </span>
              <button
                onClick={() => remove(index)}
                className="text-red-400 hover:text-red-600 ml-2"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        <div className="p-4 bg-gray-50 rounded-b-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Total</span>
            <span className="text-xl font-bold text-green-700">${total.toLocaleString('es-CL')}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate('/checkout')}
        className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium text-lg flex items-center justify-center gap-2"
      >
        Ir a Checkout <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  )
}
