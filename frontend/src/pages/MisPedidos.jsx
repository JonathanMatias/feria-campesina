import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getOrders } from '../services/authService'
import { Package, Calendar, MapPin, CreditCard, Banknote, ShoppingBag, Circle, Eye, Clock } from 'lucide-react'
import OrderTimeline from '../components/orders/OrderTimeline'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'

const statusConfig = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300', icon: 'text-yellow-500' },
  confirmado: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300', icon: 'text-blue-500' },
  en_reparto: { label: 'En reparto', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300', icon: 'text-purple-500' },
  entregado: { label: 'Entregado', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300', icon: 'text-green-500' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300', icon: 'text-red-500' },
}

export default function MisPedidos() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => { loadOrders() }, [])

  const loadOrders = async () => {
    try { const { data } = await getOrders(); setOrders(data) } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div></div>
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-xl text-gray-500 mb-4">No tienes pedidos aún</p>
        <Link to="/" className="text-green-600 hover:underline font-medium">Ver productos</Link>
      </div>
    )
  }

  const columns = [
    {
      key: 'id',
      header: '#',
      cell: (row) => <span className="text-gray-400 text-sm">#{row.id}</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      cell: (row) => {
        const s = statusConfig[row.status] || { label: row.status, color: 'bg-gray-100 text-gray-600' }
        return <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${s.color}`}><Circle className={`w-1.5 h-1.5 fill-current ${s.icon}`} />{s.label}</span>
      },
    },
    {
      key: 'total',
      header: 'Total',
      accessor: (row) => Number(row.total),
      cell: (row) => <span className="font-semibold text-green-700">${Number(row.total).toLocaleString('es-CL')}</span>,
    },
    {
      key: 'delivery_date',
      header: 'Entrega',
      accessor: (row) => row.delivery_date,
      cell: (row) => <span className="text-sm text-gray-600">{new Date(row.delivery_date).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}</span>,
    },
    {
      key: 'payment_method',
      header: 'Pago',
      cell: (row) => (
        <span className="text-sm text-gray-500 flex items-center gap-1">
          {row.payment_method === 'contra_entrega' ? <Banknote className="w-3.5 h-3.5" /> : <CreditCard className="w-3.5 h-3.5" />}
          {row.payment_method === 'contra_entrega' ? 'Efectivo' : 'Transf.'}
        </span>
      ),
    },
    {
      key: 'items_count',
      header: 'Items',
      sortable: false,
      cell: (row) => <span className="text-sm text-gray-500">{row.items?.length || 0} prod.</span>,
    },
    {
      key: 'actions',
      header: '',
      sortable: false,
      cell: (row) => (
        <button onClick={() => setSelected(row)} className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
          <Eye className="w-4 h-4" /> Ver
        </button>
      ),
    },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Package className="w-6 h-6 text-green-600" />
        Mis Pedidos
      </h1>

      <DataTable columns={columns} data={orders} searchable pageSize={8} />

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Pedido #${selected?.id || ''}`} size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400">Estado</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(statusConfig[selected.status] || {}).color}`}>{selected.status}</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400">Total</p>
                <p className="font-bold text-green-700">${Number(selected.total).toLocaleString('es-CL')}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400">Fecha</p>
                <p className="text-sm font-medium">{new Date(selected.delivery_date).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400">Pago</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  {selected.payment_method === 'contra_entrega' ? <><Banknote className="w-4 h-4" /> Efectivo</> : <><CreditCard className="w-4 h-4" /> Transferencia</>}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400">Dirección</p>
                <p className="text-sm font-medium"><MapPin className="w-3.5 h-3.5 inline mr-1" />{selected.delivery_address}</p>
              </div>
              {selected.customer_phone && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Teléfono</p>
                  <p className="text-sm font-medium">{selected.customer_phone}</p>
                </div>
              )}
            </div>

            {selected.items && selected.items.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Productos</p>
                <div className="space-y-1">
                  {selected.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-200">{item.product?.name} <span className="text-gray-400">x{item.quantity}</span></span>
                      <span className="text-gray-600 dark:text-gray-300">${Number(item.subtotal).toLocaleString('es-CL')}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                  <span>Total</span>
                  <span className="text-green-700">${Number(selected.total).toLocaleString('es-CL')}</span>
                </div>
              </div>
            )}

            <OrderTimeline logs={selected.status_logs} />
          </div>
        )}
      </Modal>
    </div>
  )
}
