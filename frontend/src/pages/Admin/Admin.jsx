import { useState, useEffect } from 'react'
import { getAdminUsers, updateUserRole, deleteUser, updateUser, getAdminStats, getAdminOrders, updateAdminOrderStatus, getCategories, createCategory, updateCategory, deleteCategory, getAllCategories, getLogs } from '../../services/authService'
import { Users, TrendingUp, ShoppingBag, Package, DollarSign, UserCheck, UserPlus, BarChart3, Trash2, Circle, MapPin, Calendar, Edit, Tags, Plus, Upload, User, ScrollText, Eye, Banknote, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import KebabMenu from '../../components/common/KebabMenu'
import DataTable from '../../components/common/DataTable'
import Modal from '../../components/common/Modal'
import OrderTimeline from '../../components/orders/OrderTimeline'
import api from '../../services/api'

const roleConfig = {
  admin: { label: 'Admin', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
  agricultor: { label: 'Agricultor', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  cliente: { label: 'Cliente', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
}

const statusConfig = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300', icon: 'text-yellow-500' },
  confirmado: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300', icon: 'text-blue-500' },
  en_reparto: { label: 'En reparto', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300', icon: 'text-purple-500' },
  entregado: { label: 'Entregado', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300', icon: 'text-green-500' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300', icon: 'text-red-500' },
}

const logActionColors = {
  created: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  updated: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  deleted: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  login: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  logout: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
}

function extractIframeSrc(value) {
  if (!value) return ''
  const match = value.match(/src=["']([^"']+)["']/)
  return match ? match[1] : value
}

// ─── AdminUsuarios ────────────────────────────────────────────────

export function AdminUsuarios() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ id: null, name: '', email: '', password: '', role: 'cliente', phone: '', address: '', maps_url: '' })
  const [editAvatar, setEditAvatar] = useState(null)
  const [editAvatarPreview, setEditAvatarPreview] = useState(null)
  const [createModal, setCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'cliente', phone: '', address: '', maps_url: '' })
  const [createAvatar, setCreateAvatar] = useState(null)
  const [createAvatarPreview, setCreateAvatarPreview] = useState(null)

  useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    try {
      const { data } = await getAdminUsers()
      setUsers(Array.isArray(data) ? data : data.data || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const openEdit = (user) => {
    setEditForm({
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'cliente',
      phone: user.phone || '',
      address: user.address || '',
      maps_url: user.maps_url || '',
    })
    setEditAvatar(null)
    setEditAvatarPreview(user.avatar_url || null)
    setEditModal(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      const fd = new FormData()
      Object.entries(editForm).forEach(([k, v]) => {
        if (k === 'id' || k === 'maps_url') return
        if (v !== '' && v !== null) fd.append(k, v)
      })
      fd.append('maps_url', editForm.maps_url || '')
      if (editAvatar) fd.append('avatar', editAvatar)
      await updateUser(editForm.id, fd)
      toast.success('Usuario actualizado')
      setEditModal(false)
      loadUsers()
    } catch (e) { toast.error(e.response?.data?.message || 'Error al actualizar') }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return
    try {
      await deleteUser(id)
      toast.success('Usuario eliminado')
      loadUsers()
    } catch (e) { toast.error('Error al eliminar usuario') }
  }

  const handleMapsUrlChange = (value) => {
    setEditForm({ ...editForm, maps_url: extractIframeSrc(value) })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setEditAvatar(file)
    setEditAvatarPreview(URL.createObjectURL(file))
  }

  const openCreate = () => {
    setCreateForm({ name: '', email: '', password: '', role: 'cliente', phone: '', address: '', maps_url: '' })
    setCreateAvatar(null)
    setCreateAvatarPreview(null)
    setCreateModal(true)
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    try {
      const fd = new FormData()
      fd.append('name', createForm.name)
      fd.append('email', createForm.email)
      fd.append('password', createForm.password)
      fd.append('role', createForm.role)
      if (createForm.phone) fd.append('phone', createForm.phone)
      if (createForm.address) fd.append('address', createForm.address)
      if (createForm.maps_url) fd.append('maps_url', extractIframeSrc(createForm.maps_url))
      if (createAvatar) fd.append('avatar', createAvatar)
      await api.post('/register', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Usuario creado')
      setCreateModal(false)
      loadUsers()
    } catch (e) { toast.error(e.response?.data?.message || 'Error al crear usuario') }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div></div>

  const columns = [
    {
      key: 'name',
      header: <span className="flex items-center gap-1"><User className="w-4 h-4" /> Usuario</span>,
      accessor: (row) => row.name,
      cell: (row) => (
        <div className="flex items-center gap-3">
          {row.avatar_url ? (
            <img src={row.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-gray-200" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-green-700" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-800">{row.name}</p>
            <p className="text-xs text-gray-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Rol',
      accessor: (row) => row.role,
      cell: (row) => {
        const cfg = roleConfig[row.role] || { label: row.role, color: 'bg-gray-100 text-gray-600' }
        return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
      },
    },
    {
      key: 'phone',
      header: 'Teléfono',
      accessor: (row) => row.phone || '',
      cell: (row) => <span className="text-gray-600 text-sm">{row.phone || '—'}</span>,
    },
    {
      key: 'actions',
      header: '',
      sortable: false,
      cell: (row) => (
        <div className="text-right">
          <KebabMenu items={[
            { label: 'Editar', icon: Edit, onClick: () => openEdit(row) },
            { label: 'Eliminar', icon: Trash2, onClick: () => handleDelete(row.id), danger: true },
          ]} />
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-7 h-7 text-green-600" />
          Usuarios
        </h2>
        <button onClick={openCreate} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium">
          <UserPlus className="w-5 h-5" /> Nuevo Usuario
        </button>
      </div>

      <DataTable columns={columns} data={users} searchable pageSize={5} />

      <Modal open={editModal} onClose={() => setEditModal(false)} title="Editar Usuario">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="flex justify-center mb-2">
            <label className="relative cursor-pointer group">
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
              {editAvatarPreview ? (
                <img src={editAvatarPreview} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-green-200 group-hover:border-green-400 transition-colors" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200 group-hover:border-green-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-7 h-7 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
                <Upload className="w-3.5 h-3.5 text-white" />
              </span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña <span className="text-gray-400 font-normal">(dejar vacío para no cambiar)</span></label>
              <input type="password" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 bg-white">
                <option value="cliente">Cliente</option>
                <option value="agricultor">Agricultor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input type="text" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input type="text" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL de Google Maps</label>
            <textarea
              value={editForm.maps_url}
              onChange={(e) => handleMapsUrlChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              rows={2}
              placeholder="Pega el iframe o la URL de Google Maps"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2">
              <Edit className="w-4 h-4" /> Guardar Cambios
            </button>
            <button type="button" onClick={() => setEditModal(false)} className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancelar</button>
          </div>
        </form>
      </Modal>

      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Nuevo Usuario">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="flex justify-center mb-2">
            <label className="relative cursor-pointer group">
              <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setCreateAvatar(f); setCreateAvatarPreview(URL.createObjectURL(f)) } }} className="sr-only" />
              {createAvatarPreview ? (
                <img src={createAvatarPreview} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-green-200 group-hover:border-green-400 transition-colors" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200 group-hover:border-green-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input type="text" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
            <input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" required minLength={6} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 bg-white">
              <option value="cliente">Cliente</option>
              <option value="agricultor">Agricultor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input type="text" value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input type="text" value={createForm.address} onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL de Google Maps</label>
            <textarea value={createForm.maps_url} onChange={(e) => setCreateForm({ ...createForm, maps_url: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" rows={2} placeholder="Pega el iframe o URL de Google Maps" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4" /> Crear Usuario
            </button>
            <button type="button" onClick={() => setCreateModal(false)} className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

// ─── AdminEstadisticas ────────────────────────────────────────────

export function AdminEstadisticas() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadStats() }, [])

  const loadStats = async () => {
    try {
      const { data } = await getAdminStats()
      setStats(data)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div></div>
  if (!stats) return <p className="text-center text-gray-400 py-12">No hay estadísticas disponibles</p>

  const cards = [
    { label: 'Pedidos', value: stats.total_orders ?? 0, icon: ShoppingBag, color: 'bg-blue-500' },
    { label: 'Ingresos', value: `$${Number(stats.total_revenue ?? 0).toLocaleString('es-CL')}`, icon: DollarSign, color: 'bg-green-500' },
    { label: 'Productos', value: stats.total_products ?? 0, icon: Package, color: 'bg-orange-500' },
    { label: 'Agricultores', value: stats.total_farmers ?? 0, icon: UserCheck, color: 'bg-emerald-500' },
    { label: 'Clientes', value: stats.total_clients ?? 0, icon: UserPlus, color: 'bg-purple-500' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <BarChart3 className="w-7 h-7 text-green-600" />
        Estadísticas
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 font-medium">{card.label}</span>
              <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats.top_products && stats.top_products.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Productos más vendidos
            </h3>
            <div className="space-y-3">
              {stats.top_products.map((product, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="text-sm text-gray-700">{product.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{product.total_sold ?? product.sales_count} vendidos</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.orders_by_status && stats.orders_by_status.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-green-600" />
              Pedidos por estado
            </h3>
            <div className="space-y-3">
              {stats.orders_by_status.map((item) => {
                const cfg = statusConfig[item.status] || { label: item.status, color: 'bg-gray-100 text-gray-600' }
                const total = stats.orders_by_status.reduce((a, b) => a + (b.count || 0), 0)
                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
                return (
                  <div key={item.status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                      <span className="text-sm text-gray-600">{item.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${item.status === 'entregado' ? 'bg-green-500' : item.status === 'cancelado' ? 'bg-red-500' : item.status === 'pendiente' ? 'bg-yellow-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── AdminPedidosGlobales ─────────────────────────────────────────

export function AdminPedidosGlobales() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => { loadOrders() }, [])

  const loadOrders = async () => {
    try { const { data } = await getAdminOrders(); setOrders(Array.isArray(data) ? data : data.data || []) } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try { await updateAdminOrderStatus(orderId, newStatus); toast.success('Estado actualizado'); loadOrders(); setSelected(null) } catch (e) { toast.error('Error al actualizar estado') }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div></div>

  const columns = [
    { key: 'id', header: '#', cell: (row) => <span className="text-gray-400 text-sm">#{row.id}</span> },
    {
      key: 'status', header: 'Estado',
      cell: (row) => {
        const s = statusConfig[row.status] || { label: row.status, color: 'bg-gray-100 text-gray-600' }
        return <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${s.color}`}><Circle className={`w-1.5 h-1.5 fill-current`} />{s.label}</span>
      },
    },
    { key: 'customer', header: 'Cliente', cell: (row) => <span className="text-sm text-gray-600">{row.customer?.name || 'N/A'}</span> },
    { key: 'total', header: 'Total', accessor: (row) => Number(row.total), cell: (row) => <span className="font-semibold text-green-700">${Number(row.total).toLocaleString('es-CL')}</span> },
    { key: 'delivery_date', header: 'Entrega', cell: (row) => <span className="text-sm text-gray-500">{row.delivery_date ? new Date(row.delivery_date).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' }) : '—'}</span> },
    { key: 'address', header: 'Dirección', cell: (row) => <span className="text-sm text-gray-500 truncate max-w-[150px] block">{row.delivery_address || '—'}</span> },
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
        <ShoppingBag className="w-7 h-7 text-green-600" />
        Pedidos Globales
      </h2>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-xl text-gray-500">No hay pedidos registrados</p>
        </div>
      ) : (
        <DataTable columns={columns} data={orders} searchable pageSize={8} />
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Pedido #${selected?.id || ''}`} size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400">Estado</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(statusConfig[selected.status] || {}).color}`}>{selected.status}</span>
                <div className="mt-2">
                  <select value={selected.status} onChange={(e) => handleStatusChange(selected.id, e.target.value)} className="px-2 py-1 border rounded text-xs w-full bg-white dark:bg-gray-600 dark:text-white">
                    <option value={selected.status}>{selected.status}</option>
                    {(() => {
                      const next = { pendiente: ['confirmado', 'cancelado'], confirmado: ['en_reparto', 'cancelado'], en_reparto: ['entregado'], entregado: [], cancelado: [] }
                      return (next[selected.status] || []).map(s => <option key={s} value={s}>{s}</option>)
                    })()}
                  </select>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400">Cliente</p>
                <p className="text-sm font-medium"><User className="w-3.5 h-3.5 inline mr-1" />{selected.customer?.name || 'N/A'}</p>
                <p className="text-xs text-gray-400 mt-0.5">{selected.customer?.email}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400">Total</p>
                <p className="font-bold text-green-700">${Number(selected.total).toLocaleString('es-CL')}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400">Entrega</p>
                <p className="text-sm font-medium"><Calendar className="w-3.5 h-3.5 inline mr-1" />{selected.delivery_date ? new Date(selected.delivery_date).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }) : '—'}</p>
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
                <p className="text-sm font-semibold text-gray-700 mb-2">Productos ({selected.items.length})</p>
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

// ─── AdminCategorias ──────────────────────────────────────────────

export function AdminCategorias() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', icon: '' })

  useEffect(() => { loadCategories() }, [])

  const loadCategories = async () => {
    try {
      const { data } = await getAllCategories()
      setCategories(Array.isArray(data) ? data : data.data || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', icon: '' })
    setModalOpen(true)
  }

  const openEdit = (cat) => {
    setEditing(cat.id)
    setForm({ name: cat.name, icon: cat.icon || '' })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('icon', form.icon)
      if (editing) {
        await updateCategory(editing, fd)
        toast.success('Categoría actualizada')
      } else {
        await createCategory(fd)
        toast.success('Categoría creada')
      }
      setModalOpen(false)
      loadCategories()
    } catch (e) { toast.error(e.response?.data?.message || 'Error al guardar') }
  }

  const handleToggleActive = async (cat) => {
    try {
      await updateCategory(cat.id, { active: !cat.active })
      toast.success(cat.active ? 'Categoría desactivada' : 'Categoría activada')
      loadCategories()
    } catch (e) { toast.error('Error al cambiar estado') }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    try {
      await deleteCategory(id)
      toast.success('Categoría eliminada')
      loadCategories()
    } catch (e) { toast.error('Error al eliminar categoría') }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div></div>

  const columns = [
    {
      key: 'icon',
      header: 'Icono',
      sortable: false,
      cell: (row) => <span className="text-2xl">{row.icon || '🏷️'}</span>,
    },
    {
      key: 'name',
      header: <span className="flex items-center gap-1"><Tags className="w-4 h-4" /> Nombre</span>,
      accessor: (row) => row.name,
      cell: (row) => <span className="font-medium text-gray-800">{row.name}</span>,
    },
    {
      key: 'slug',
      header: 'Slug',
      accessor: (row) => row.slug,
      cell: (row) => <span className="text-gray-500 text-sm">{row.slug}</span>,
    },
    {
      key: 'active',
      header: 'Activo',
      sortable: false,
      cell: (row) => (
        <button onClick={() => handleToggleActive(row)} className={`relative w-10 h-5 rounded-full transition-colors ${row.active ? 'bg-green-500' : 'bg-gray-300'}`}>
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${row.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      ),
    },
    {
      key: 'actions',
      header: '',
      sortable: false,
      cell: (row) => (
        <div className="text-right">
          <KebabMenu items={[
            { label: 'Editar', icon: Edit, onClick: () => openEdit(row) },
            { label: 'Eliminar', icon: Trash2, onClick: () => handleDelete(row.id), danger: true },
          ]} />
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Tags className="w-7 h-7 text-green-600" />
          Categorías
        </h2>
        <button onClick={openCreate} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium">
          <Plus className="w-5 h-5" /> Nueva Categoría
        </button>
      </div>

      <DataTable columns={columns} data={categories} pageSize={5} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Categoría' : 'Nueva Categoría'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emoji / Icono</label>
            <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-2xl" placeholder="🏷️" maxLength={4} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2">
              {editing ? <><Edit className="w-4 h-4" /> Guardar Cambios</> : <><Plus className="w-4 h-4" /> Crear Categoría</>}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

// ─── AdminLogs ────────────────────────────────────────────────────

export function AdminLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [logModal, setLogModal] = useState(null)

  useEffect(() => { loadLogs() }, [])

  const loadLogs = async () => {
    try {
      const { data } = await getLogs({ per_page: 100 })
      setLogs(Array.isArray(data) ? data : data.data || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const getActionBadge = (action) => {
    const lower = (action || '').toLowerCase()
    let color = logActionColors.default
    if (lower.includes('creat') || lower.includes('created')) color = logActionColors.created
    else if (lower.includes('updat') || lower.includes('edit')) color = logActionColors.updated
    else if (lower.includes('delet') || lower.includes('elimin')) color = logActionColors.deleted
    else if (lower.includes('login') || lower.includes('inició')) color = logActionColors.login
    else if (lower.includes('logout') || lower.includes('cerró')) color = logActionColors.logout
    return { label: action || '—', color }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div></div>

  const columns = [
    {
      key: 'level',
      header: '',
      sortable: false,
      cell: (row) => {
        const level = row.level || 'info'
        const colors = { info: 'bg-blue-400', warning: 'bg-yellow-400', error: 'bg-red-500' }
        return <span className={`inline-block w-2 h-2 rounded-full ${colors[level] || 'bg-gray-300'}`} title={level} />
      },
    },
    {
      key: 'action',
      header: <span className="flex items-center gap-1"><ScrollText className="w-4 h-4" /> Acción</span>,
      accessor: (row) => row.action || row.event,
      cell: (row) => {
        const action = row.action || row.event || ''
        const badge = getActionBadge(action)
        return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span>
      },
    },
    {
      key: 'description',
      header: 'Descripción',
      accessor: (row) => row.description || row.details || '',
      cell: (row) => {
        const text = row.description || row.details || ''
        return <span className="text-gray-700 text-sm max-w-xs truncate block" title={text}>{text.length > 60 ? text.slice(0, 60) + '...' : text}</span>
      },
    },
    {
      key: 'user',
      header: <span className="flex items-center gap-1"><User className="w-4 h-4" /> Usuario</span>,
      accessor: (row) => row.user?.name || row.user_name || '',
      cell: (row) => <span className="text-gray-700 text-sm">{row.user?.name || row.user_name || 'Sistema'}</span>,
    },
    {
      key: 'date',
      header: <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Fecha</span>,
      accessor: (row) => row.created_at || row.date || '',
      cell: (row) => <span className="text-gray-500 text-sm whitespace-nowrap">{formatDate(row.created_at || row.date)}</span>,
    },
    {
      key: 'actions',
      header: '',
      sortable: false,
      cell: (row) => (
        <div className="text-right">
          <KebabMenu items={[
            { label: 'Ver detalle', icon: Eye, onClick: () => setLogModal(row) },
          ]} />
        </div>
      ),
    },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <ScrollText className="w-7 h-7 text-green-600" />
        Registro de Actividad
      </h2>

      <DataTable columns={columns} data={logs} searchable pageSize={5} />

      <Modal open={!!logModal} onClose={() => setLogModal(null)} title="Detalle del Log">
        {logModal && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Acción</label>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getActionBadge(logModal.action || logModal.event).color}`}>
                {logModal.action || logModal.event || '—'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Descripción</label>
              <p className="text-gray-800 text-sm bg-gray-50 rounded-lg p-3">{logModal.description || logModal.details || 'Sin descripción'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Usuario</label>
                <p className="text-gray-800 text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  {logModal.user?.name || logModal.user_name || 'Sistema'}
                  {logModal.user?.email && <span className="text-gray-400">({logModal.user.email})</span>}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Fecha</label>
                <p className="text-gray-800 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {formatDate(logModal.created_at || logModal.date)}
                </p>
              </div>
            </div>

            {logModal.metadata && Object.keys(logModal.metadata).length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Metadatos</label>
                <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {Object.entries(logModal.metadata).map(([key, value]) => (
                      <div key={key} className="flex gap-3 text-sm">
                        <span className="text-gray-500 font-medium min-w-[120px]">{key}:</span>
                        <span className="text-gray-800 break-all">
                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {logModal.loggable_type && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tipo de recurso</label>
                  <p className="text-gray-800 text-sm">{logModal.loggable_type}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">ID de recurso</label>
                  <p className="text-gray-800 text-sm">{logModal.loggable_id ?? '—'}</p>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => setLogModal(null)}
                className="w-full py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
