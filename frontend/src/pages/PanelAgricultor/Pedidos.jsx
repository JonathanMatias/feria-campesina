import { useState, useEffect } from 'react'
import { getFarmerOrders, updateOrderStatus } from '../../services/authService'
import PackingSlip from '../../components/farmer/PackingSlip'
import WhatsAppButton from '../../components/farmer/WhatsAppButton'
import { ShoppingCart, Calendar, MapPin, CreditCard, Banknote, User, Circle, CheckCircle, Truck, PackageCheck, XCircle, Eye } from 'lucide-react'
import { toast } from 'sonner'
import DataTable from '../../components/common/DataTable'
import Modal from '../../components/common/Modal'
import OrderTimeline from '../../components/orders/OrderTimeline'

const statusConfig = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300', icon: 'text-yellow-500' },
  confirmado: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300', icon: 'text-blue-500' },
  en_reparto: { label: 'En reparto', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300', icon: 'text-purple-500' },
  entregado: { label: 'Entregado', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300', icon: 'text-green-500' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300', icon: 'text-red-500' },
}

export default function AgricultorPedidos() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => { loadOrders() }, [])

  const loadOrders = async () => {
    try { const { data } = await getFarmerOrders(); setOrders(data) } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try { await updateOrderStatus(orderId, newStatus); loadOrders(); setSelected(null) } catch (e) { toast.error('No se pudo actualizar el estado') }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div></div>

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-xl">No tienes pedidos pendientes</p>
      </div>
    )
  }

  const columns = [
    {
      key: 'id', header: '#',
      cell: (row) => <span className="text-gray-400 text-sm">#{row.id}</span>,
    },
    {
      key: 'status', header: 'Estado',
      cell: (row) => {
        const s = statusConfig[row.status] || { label: row.status, color: 'bg-gray-100 text-gray-600' }
        return <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${s.color}`}><Circle className={`w-1.5 h-1.5 fill-current ${s.icon}`} />{s.label}</span>
      },
    },
    {
      key: 'customer', header: 'Cliente',
      cell: (row) => <span className="text-sm text-gray-600">{row.customer?.name || 'N/A'}</span>,
    },
    {
      key: 'total', header: 'Total',
      accessor: (row) => Number(row.total),
      cell: (row) => <span className="font-semibold text-green-700">${Number(row.total).toLocaleString('es-CL')}</span>,
    },
    {
      key: 'delivery_date', header: 'Entrega',
      accessor: (row) => row.delivery_date,
      cell: (row) => <span className="text-sm text-gray-500">{new Date(row.delivery_date).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}</span>,
    },
    {
      key: 'items_count', header: 'Items', sortable: false,
      cell: (row) => <span className="text-sm text-gray-500">{row.items?.length || 0} prod.</span>,
    },
    {
      key: 'actions', header: '', sortable: false,
      cell: (row) => (
        <button onClick={() => setSelected(row)} className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
          <Eye className="w-4 h-4" /> Ver
        </button>
      ),
    },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <ShoppingCart className="w-7 h-7 text-green-600" />
        Pedidos Recibidos
      </h2>

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
                <p className="text-xs text-gray-400">Cliente</p>
                <p className="text-sm font-medium"><User className="w-3.5 h-3.5 inline mr-1" />{selected.customer?.name || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400">Total</p>
                <p className="font-bold text-green-700">${Number(selected.total).toLocaleString('es-CL')}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400">Entrega</p>
                <p className="text-sm font-medium"><Calendar className="w-3.5 h-3.5 inline mr-1" />{new Date(selected.delivery_date).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400">Pago</p>
                <p className="text-sm font-medium flex items-center gap-1">{selected.payment_method === 'contra_entrega' ? <><Banknote className="w-4 h-4" /> Efectivo</> : <><CreditCard className="w-4 h-4" /> Transferencia</>}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400">Dirección</p>
                <p className="text-sm font-medium"><MapPin className="w-3.5 h-3.5 inline mr-1" />{selected.delivery_address}</p>
              </div>
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

            <div className="flex gap-2 flex-wrap pt-2 border-t">
              {selected.status === 'pendiente' && (
                <button onClick={() => handleStatusUpdate(selected.id, 'confirmado')} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Confirmar</button>
              )}
              {selected.status === 'confirmado' && (
                <button onClick={() => handleStatusUpdate(selected.id, 'en_reparto')} className="bg-purple-600 text-white px-3 py-1.5 rounded text-sm hover:bg-purple-700 flex items-center gap-1"><Truck className="w-4 h-4" /> En reparto</button>
              )}
              {selected.status === 'en_reparto' && (
                <button onClick={() => handleStatusUpdate(selected.id, 'entregado')} className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 flex items-center gap-1"><PackageCheck className="w-4 h-4" /> Entregado</button>
              )}
              {(selected.status === 'pendiente' || selected.status === 'confirmado') && (
                <button onClick={() => handleStatusUpdate(selected.id, 'cancelado')} className="bg-red-500 text-white px-3 py-1.5 rounded text-sm hover:bg-red-600 flex items-center gap-1"><XCircle className="w-4 h-4" /> Cancelar</button>
              )}
              <WhatsAppButton farmerPhone={selected.customer?.phone} orderId={selected.id} customerName={selected.customer?.name || 'N/A'} deliveryDate={selected.delivery_date} items={selected.items || []} />
            </div>

            <PackingSlip order={selected} />
          </div>
        )}
      </Modal>
    </div>
  )
}
