import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { createOrder } from '../services/authService'
import { CalendarDays, Banknote, CreditCard, MapPin, Phone, ShoppingBag, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

function getNextWeekend() {
  const today = new Date()
  const day = today.getDay()
  let daysUntilSaturday = 6 - day
  if (daysUntilSaturday <= 0) daysUntilSaturday = 0
  const saturday = new Date(today)
  saturday.setDate(today.getDate() + daysUntilSaturday + 1)
  const sunday = new Date(saturday)
  sunday.setDate(saturday.getDate() + 1)
  return { saturday, sunday }
}

const STEPS = [
  { key: 'address', icon: MapPin, label: 'Dirección', color: 'text-green-600', bg: 'bg-green-100', ring: 'ring-green-200' },
  { key: 'date', icon: CalendarDays, label: 'Fecha', color: 'text-blue-600', bg: 'bg-blue-100', ring: 'ring-blue-200' },
  { key: 'payment', icon: CreditCard, label: 'Pago', color: 'text-purple-600', bg: 'bg-purple-100', ring: 'ring-purple-200' },
  { key: 'phone', icon: Phone, label: 'Contacto', color: 'text-orange-600', bg: 'bg-orange-100', ring: 'ring-orange-200' },
]

export default function Checkout() {
  const { items, total, clear } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('contra_entrega')
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '')
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState(0)

  const missing = [
    !deliveryAddress.trim() && 'Dirección de entrega',
    !customerPhone.trim() && 'Teléfono de contacto',
  ].filter(Boolean)

  const isComplete = missing.length === 0

  const { saturday, sunday } = getNextWeekend()
  const [deliveryDate, setDeliveryDate] = useState(saturday.toISOString().split('T')[0])

  const formatDate = (date) => date.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!deliveryAddress.trim()) {
      setError('Ingresa la dirección de entrega')
      return
    }
    if (!customerPhone.trim()) {
      setError('Ingresa un teléfono de contacto')
      return
    }

    setError('')
    setLoading(true)
    const cartItems = items.map((item) => ({ product_id: item.product_id, quantity: item.quantity }))
    try {
      await createOrder({ payment_method: paymentMethod, delivery_date: deliveryDate, delivery_address: deliveryAddress, customer_phone: customerPhone, cart_items: cartItems })
      clear()
      toast.success('Pedido creado exitosamente.')
      navigate('/mis-pedidos')
    } catch (err) { setError(err.response?.data?.message || 'Error al crear el pedido') } finally { setLoading(false) }
  }

  if (items.length === 0) {
    return <div className="text-center py-12"><ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" /><p className="text-gray-500">No hay productos en tu carrito</p></div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2">
        <ShoppingBag className="w-6 h-6 text-green-600" />
        Finalizar Pedido
      </h1>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6 text-sm">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timeline izquierda */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Proceso</h3>
              <div className="relative pl-8">
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-200" />
                {STEPS.map((step, i) => {
                  const Icon = step.icon
                  const done = (i === 0 && deliveryAddress) || (i === 1 && deliveryDate) || (i === 2 && paymentMethod) || (i === 3 && customerPhone)
                  const isActive = i === currentStep
                  return (
                    <div key={step.key} className={`relative pb-8 last:pb-0 transition-opacity ${done || isActive ? 'opacity-100' : 'opacity-50'}`}>
                      <div
                        className={`absolute -left-[31px] w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all ${done ? 'bg-green-500 text-white' : isActive ? step.bg + ' ring-2 ring-offset-2 ' + step.ring : 'bg-gray-100'}`}
                        onClick={() => setCurrentStep(i)}
                      >
                        {done ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Icon className={`w-4 h-4 ${isActive ? step.color : 'text-gray-400'}`} />
                        )}
                      </div>
                      <p className={`font-medium text-sm ${done ? 'text-green-700' : isActive ? 'text-gray-800' : 'text-gray-500'}`}>{step.label}</p>
                      {isActive && !done && <p className="text-xs text-gray-400 mt-0.5">{i === 0 ? '¿Dónde entregamos?' : i === 1 ? '¿Cuándo?' : i === 2 ? '¿Cómo pagas?' : 'Tu número'}</p>}
                      {done && <p className="text-xs text-green-500 mt-0.5">Completado</p>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Formulario derecha */}
          <div className="lg:col-span-2 space-y-5">
            {/* Dirección */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" onClick={() => setCurrentStep(0)}>
              <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${deliveryAddress ? 'bg-green-500' : 'bg-green-100 text-green-700'}`}>{deliveryAddress ? <CheckCircle2 className="w-3.5 h-3.5" /> : '1'}</span>
                Dirección de entrega
              </h2>
              <textarea value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 resize-none" rows={2} required />
            </div>

            {/* Fecha */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" onClick={() => setCurrentStep(1)}>
              <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${deliveryDate ? 'bg-green-500' : 'bg-blue-100 text-blue-700'}`}>{deliveryDate ? <CheckCircle2 className="w-3.5 h-3.5" /> : '2'}</span>
                Fecha de entrega
              </h2>
              <div className="flex gap-3">
                {[{ d: saturday, label: 'Sábado' }, { d: sunday, label: 'Domingo' }].map(({ d, label }) => (
                  <label key={label} className={`flex-1 p-3 border-2 rounded-xl cursor-pointer text-center transition ${deliveryDate === d.toISOString().split('T')[0] ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="deliveryDate" value={d.toISOString().split('T')[0]} checked={deliveryDate === d.toISOString().split('T')[0]} onChange={(e) => setDeliveryDate(e.target.value)} className="sr-only" />
                    <CalendarDays className="w-6 h-6 mx-auto mb-1 text-green-600" />
                    <span className="block font-medium">{label}</span>
                    <span className="block text-xs text-gray-500">{formatDate(d)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Pago */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" onClick={() => setCurrentStep(2)}>
              <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${paymentMethod ? 'bg-green-500' : 'bg-purple-100 text-purple-700'}`}>{paymentMethod ? <CheckCircle2 className="w-3.5 h-3.5" /> : '3'}</span>
                Método de pago
              </h2>
              <div className="flex gap-3">
                <label className={`flex-1 p-3 border-2 rounded-xl cursor-pointer text-center transition ${paymentMethod === 'contra_entrega' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="paymentMethod" value="contra_entrega" checked={paymentMethod === 'contra_entrega'} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                  <Banknote className="w-6 h-6 mx-auto mb-1 text-green-600" />
                  <span className="block font-medium text-sm">Efectivo</span>
                  <span className="block text-xs text-gray-400">Contra entrega</span>
                </label>
                <label className={`flex-1 p-3 border-2 rounded-xl cursor-pointer text-center transition ${paymentMethod === 'transferencia' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="paymentMethod" value="transferencia" checked={paymentMethod === 'transferencia'} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                  <CreditCard className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                  <span className="block font-medium text-sm">Transferencia</span>
                  <span className="block text-xs text-gray-400">Bancaria</span>
                </label>
              </div>
            </div>

            {/* Teléfono */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" onClick={() => setCurrentStep(3)}>
              <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${customerPhone ? 'bg-green-500' : 'bg-orange-100 text-orange-700'}`}>{customerPhone ? <CheckCircle2 className="w-3.5 h-3.5" /> : '4'}</span>
                Teléfono de contacto
              </h2>
              <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500" placeholder="+56 9..." />
            </div>

            {/* Resumen final */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 border-l-4 border-l-green-500">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-green-600" />
                Resumen del pedido
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-400 text-xs">Dirección</p>
                    <p className="text-gray-700">{deliveryAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-400 text-xs">Entrega</p>
                    <p className="text-gray-700">{deliveryDate === saturday.toISOString().split('T')[0] ? 'Sábado' : 'Domingo'} — {deliveryDate === saturday.toISOString().split('T')[0] ? formatDate(saturday) : formatDate(sunday)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  {paymentMethod === 'contra_entrega' ? <Banknote className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" /> : <CreditCard className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />}
                  <div>
                    <p className="text-gray-400 text-xs">Pago</p>
                    <p className="text-gray-700">{paymentMethod === 'contra_entrega' ? 'Efectivo contra entrega' : 'Transferencia bancaria'}</p>
                  </div>
                </div>
                {customerPhone && (
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-400 text-xs">Teléfono</p>
                      <p className="text-gray-700">{customerPhone}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-0.5">
                    <span className="text-gray-600">{item.name} x{item.quantity} {item.unit}</span>
                    <span className="text-gray-700">${(item.price * item.quantity).toLocaleString('es-CL')}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t">
                <span>Total</span>
                <span className="text-green-700">${total.toLocaleString('es-CL')}</span>
              </div>
            </div>

            {!isComplete && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Completa: {missing.join(', ')}</span>
              </div>
            )}

            <button type="submit" disabled={loading || !isComplete} className="w-full bg-green-600 text-white py-3.5 rounded-xl hover:bg-green-700 disabled:opacity-50 font-medium text-lg flex items-center justify-center gap-2 shadow-md shadow-green-200">
              {loading ? 'Creando pedido...' : isComplete ? `Confirmar Pedido — $${total.toLocaleString('es-CL')}` : 'Completa los datos para confirmar'}
              <ArrowRight className="w-5 h-5" />
            </button>

            <Link to="/carrito" className="block text-center mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Cancelar y volver al carrito
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
