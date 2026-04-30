import { useState, useEffect } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct, updateStock, getCategories } from '../../services/authService'
import { useAuth } from '../../contexts/AuthContext'
import { Package, Plus, Edit, Trash2, RefreshCw, DollarSign, Hash, Tags } from 'lucide-react'
import { toast } from 'sonner'
import Modal from '../../components/common/Modal'
import KebabMenu from '../../components/common/KebabMenu'
import DataTable from '../../components/common/DataTable'
import ImageUploader from '../../components/products/ImageUploader'
import api from '../../services/api'

export default function AgricultorProductos() {
  const { user, isAdmin } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', price: 0, stock: 0, unit: 'kg', category_id: '', active: true })
  const [newImages, setNewImages] = useState([])
  const [deleteImages, setDeleteImages] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [stockModal, setStockModal] = useState({ open: false, product: null, value: '' })
  const [categories, setCategories] = useState([])

  useEffect(() => { loadProducts(); loadCategories() }, [])

  const loadCategories = async () => {
    try { const { data } = await getCategories(); setCategories(data) } catch (e) {}
  }

  const loadProducts = async () => {
    try {
      const params = isAdmin ? { show_all: 1 } : { show_all: 1, farmer_id: user?.id }
      const { data } = await getProducts(params)
      setProducts(data.data || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const openCreate = () => {
    setEditing(null)
    setEditingProduct(null)
    setForm({ name: '', description: '', price: 0, stock: 0, unit: 'kg', category_id: '', active: true })
    setNewImages([])
    setDeleteImages([])
    setModalOpen(true)
  }

  const openEdit = (product) => {
    setEditing(product.id)
    setEditingProduct(product)
    setForm({ name: product.name, description: product.description || '', price: product.price, stock: product.stock, unit: product.unit, category_id: product.category_id || '', active: !!product.active })
    setNewImages([])
    setDeleteImages([])
    setModalOpen(true)
  }

  const handleToggleActive = async (product) => {
    try {
      await updateProduct(product.id, { active: !product.active })
      loadProducts()
    } catch (e) { toast.error('Error al cambiar estado') }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null) {
          fd.append(k, typeof v === 'boolean' ? (v ? '1' : '0') : v)
        }
      })
      newImages.forEach((f) => fd.append('images[]', f))
      deleteImages.forEach((id) => fd.append('delete_images[]', id))

      if (editing) {
        await updateProduct(editing, fd)
        toast.success('Producto actualizado')
      } else {
        await createProduct(fd)
        toast.success('Producto creado')
      }
      setModalOpen(false); loadProducts()
    } catch (e) { toast.error(e.response?.data?.message || 'Error') }
  }

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este producto?')) { await deleteProduct(id); loadProducts(); toast.success('Producto eliminado') }
  }

  const openStockModal = (product) => {
    setStockModal({ open: true, product, value: '' })
  }

  const handleStockUpdate = async () => {
    const val = Number(stockModal.value)
    if (!val && val !== 0) return toast.error('Ingresa un valor válido')
    try {
      await updateStock(stockModal.product.id, val)
      setStockModal({ open: false, product: null, value: '' })
      loadProducts()
      toast.success('Stock actualizado')
    } catch (e) { toast.error('No se pudo actualizar el stock') }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div></div>

  const columns = [
    {
      key: 'name',
      header: <span className="flex items-center gap-1"><Package className="w-4 h-4" /> Producto</span>,
      accessor: (row) => row.name,
      cell: (row) => (
        <div>
          <span className="font-medium text-gray-800">{row.name}</span>
          <span className="text-gray-400 text-sm ml-2">/{row.unit}</span>
        </div>
      ),
    },
    {
      key: 'price',
      header: <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> Precio</span>,
      accessor: (row) => Number(row.price),
      cell: (row) => <span className="text-green-700 font-medium">${Number(row.price).toLocaleString('es-CL')}</span>,
    },
    {
      key: 'category',
      header: <span className="flex items-center gap-1"><Tags className="w-4 h-4" /> Categoría</span>,
      accessor: (row) => row.category?.name || '',
      cell: (row) => row.category ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
          {row.category.icon && <span>{row.category.icon}</span>}
          {row.category.name}
        </span>
      ) : <span className="text-gray-300 text-xs">—</span>,
    },
    {
      key: 'stock',
      header: <span className="flex items-center gap-1"><Hash className="w-4 h-4" /> Stock</span>,
      accessor: (row) => Number(row.stock),
      cell: (row) => (
        <button onClick={() => openStockModal(row)} className="font-medium text-blue-600 hover:text-blue-800 hover:underline">
          {row.stock}
        </button>
      ),
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
          <Package className="w-7 h-7 text-green-600" />
          Mis Productos
        </h2>
        <button onClick={openCreate} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium">
          <Plus className="w-5 h-5" /> Nuevo Producto
        </button>
      </div>

      <DataTable columns={columns} data={products} searchable pageSize={8} />

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Producto' : 'Nuevo Producto'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 bg-white">
                <option value="">Sin categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
              <input type="text" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" placeholder="kg, unidad, atado..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" min="0" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock inicial</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" min="0" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" rows={3} />
          </div>
          <ImageUploader
            images={newImages}
            existingImages={editingProduct?.images || []}
            onChange={setNewImages}
            onDelete={(img) => setDeleteImages([...deleteImages, img.id])}
          />
          <div className="flex items-center gap-3 pt-1">
            <label className="relative w-10 h-5 rounded-full transition-colors cursor-pointer" style={{ backgroundColor: form.active ? '#16a34a' : '#d1d5db' }}>
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="sr-only" />
              <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform" style={{ transform: form.active ? 'translateX(20px)' : 'translateX(2px)' }} />
            </label>
            <span className="text-sm text-gray-600">{form.active ? 'Producto visible' : 'Producto oculto'}</span>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2">
              {editing ? <><Edit className="w-4 h-4" /> Guardar Cambios</> : <><Plus className="w-4 h-4" /> Crear Producto</>}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancelar</button>
          </div>
        </form>
      </Modal>

      {/* Stock Update Modal */}
      <Modal open={stockModal.open} onClose={() => setStockModal({ open: false, product: null, value: '' })} title="Actualizar Stock" size="sm">
        {stockModal.product && (
          <div className="space-y-4">
            <p className="text-gray-600">
              <span className="font-medium text-gray-800">{stockModal.product.name}</span>
              <span className="text-gray-400"> — Stock actual: {stockModal.product.stock}</span>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo stock</label>
              <input
                type="number" min="0"
                value={stockModal.value}
                onChange={(e) => setStockModal({ ...stockModal, value: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder={String(stockModal.product.stock)}
                autoFocus
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleStockUpdate} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" /> Actualizar
              </button>
              <button onClick={() => setStockModal({ open: false, product: null, value: '' })} className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancelar</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
