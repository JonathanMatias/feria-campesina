export default function WhatsAppButton({ farmerPhone, orderId, customerName, deliveryDate, items }) {
  const generateMessage = () => {
    const itemList = items.map((item) =>
      `- ${item.product?.name}: ${item.quantity} x $${Number(item.unit_price).toLocaleString('es-CL')}`
    ).join('\n')

    const message = `*Feria Campesina - Pedido #${orderId}*\n\nHola! Tienes un nuevo pedido:\n\n*Cliente:* ${customerName}\n*Entrega:* ${new Date(deliveryDate).toLocaleDateString('es-CL')}\n\n*Productos:*\n${itemList}\n\n*Total: $${items.reduce((sum, i) => sum + Number(i.subtotal), 0).toLocaleString('es-CL')}*\n\nPor favor confirma la recepción.`

    return encodeURIComponent(message)
  }

  const phone = farmerPhone || '56912345678'

  return (
    <a
      href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${generateMessage()}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
    >
      WhatsApp
    </a>
  )
}
