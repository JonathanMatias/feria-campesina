import { Circle, CheckCircle2, Clock, Truck, PackageCheck, XCircle } from 'lucide-react'

const statusIcons = {
  pendiente: Clock,
  confirmado: CheckCircle2,
  en_reparto: Truck,
  entregado: PackageCheck,
  cancelado: XCircle,
}

const statusLabels = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  en_reparto: 'En reparto',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const statusColors = {
  pendiente: 'bg-yellow-100 text-yellow-600 border-yellow-300',
  confirmado: 'bg-blue-100 text-blue-600 border-blue-300',
  en_reparto: 'bg-purple-100 text-purple-600 border-purple-300',
  entregado: 'bg-green-100 text-green-600 border-green-300',
  cancelado: 'bg-red-100 text-red-600 border-red-300',
}

export default function OrderTimeline({ logs = [] }) {
  if (!logs || logs.length === 0) return null

  return (
    <div className="mt-3 pt-3 border-t">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Historial</p>
      <div className="flex items-start justify-center gap-0 overflow-x-auto pb-2">
        {logs.map((log, i) => {
          const Icon = statusIcons[log.new_status] || Circle
          const isLast = i === logs.length - 1
          return (
            <div key={log.id || i} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${statusColors[log.new_status] || 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium mt-1 text-center capitalize leading-tight">{statusLabels[log.new_status] || log.new_status}</span>
                <span className="text-[9px] text-gray-400 mt-0.5 text-center leading-tight">
                  {log.user?.name?.split(' ')[0] || 'Sistema'}
                </span>
                <span className="text-[9px] text-gray-300 text-center">
                  {new Date(log.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {!isLast && (
                <div className="w-16 sm:w-20 h-0.5 bg-gray-200 mx-2 mt-5" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
