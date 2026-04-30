import { useState } from 'react'

export default function PackingSlip({ order }) {
  const [show, setShow] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  return (
    <div>
      <button
        onClick={() => setShow(!show)}
        className="text-green-600 hover:underline text-sm"
      >
        {show ? 'Ocultar Packing Slip' : 'Ver Packing Slip'}
      </button>

      {show && (
        <div className="mt-4 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-white print:border-none">
          <div className="text-center mb-4 print:mb-2">
            <h2 className="text-xl font-bold text-green-700">Feria Campesina</h2>
            <p className="text-sm text-gray-500">Packing Slip - Pedido #{order.id}</p>
          </div>

          <div className="text-sm space-y-1 mb-4 print:text-xs">
            <p><strong>Cliente:</strong> {order.customer?.name || 'N/A'}</p>
            <p><strong>Dirección:</strong> {order.delivery_address}</p>
            <p><strong>Teléfono:</strong> {order.customer_phone || order.customer?.phone || 'N/A'}</p>
            <p><strong>Entrega:</strong> {new Date(order.delivery_date).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <p><strong>Pago:</strong> {order.payment_method === 'contra_entrega' ? 'Efectivo contra entrega' : 'Transferencia'}</p>
          </div>

          {order.items && order.items.length > 0 && (
            <table className="w-full text-sm print:text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1">Producto</th>
                  <th className="text-right py-1">Cant.</th>
                  <th className="text-right py-1">Precio</th>
                  <th className="text-right py-1">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-1">{item.product?.name}</td>
                    <td className="text-right py-1">{item.quantity}</td>
                    <td className="text-right py-1">${Number(item.unit_price).toLocaleString('es-CL')}</td>
                    <td className="text-right py-1">${Number(item.subtotal).toLocaleString('es-CL')}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td colSpan={3} className="text-right py-1">Total:</td>
                  <td className="text-right py-1">${Number(order.total).toLocaleString('es-CL')}</td>
                </tr>
              </tfoot>
            </table>
          )}

          <div className="mt-4 text-center print:hidden">
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Imprimir
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
