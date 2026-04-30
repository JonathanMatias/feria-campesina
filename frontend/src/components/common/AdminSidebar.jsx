import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Users, ShoppingBag, BarChart3, ChevronRight, Tags, ScrollText, PanelLeftClose, PanelLeftOpen, Menu } from 'lucide-react'

export default function AdminSidebar() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('admin_sidebar_collapsed') === 'true')
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('admin_sidebar_collapsed', next)
  }

  const links = [
    { to: '/admin/usuarios', icon: Users, label: 'Usuarios' },
    { to: '/admin/categorias', icon: Tags, label: 'Categorías' },
    { to: '/admin/pedidos', icon: ShoppingBag, label: 'Pedidos' },
    { to: '/admin/estadisticas', icon: BarChart3, label: 'Estadísticas' },
    { to: '/admin/logs', icon: ScrollText, label: 'Actividad' },
  ]

  const closeMobile = () => setMobileOpen(false)

  const SidebarContent = () => (
    <aside className={`${collapsed ? 'lg:w-16' : 'lg:w-64'} w-64 bg-green-800 dark:bg-green-950 min-h-screen text-white flex-shrink-0 transition-all duration-300`}>
      <div className={`p-5 border-b border-green-700 dark:border-green-800 flex items-center ${collapsed ? 'lg:justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ChevronRight className="w-5 h-5" /> Administración
          </h2>
        )}
        <button onClick={toggle} className="text-green-200 hover:text-white hidden lg:block">
          {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>
      <nav className="p-3">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = location.pathname === link.to
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={closeMobile}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-colors ${isActive ? 'bg-green-600 text-white font-medium' : 'text-green-100 hover:bg-green-700'} ${collapsed ? 'lg:justify-center' : ''}`}
              title={collapsed ? link.label : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {(!collapsed || typeof window === 'undefined') && <span className="lg:inline">{collapsed ? '' : link.label}</span>}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-20 left-4 z-30 bg-green-600 text-white p-2 rounded-lg shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={closeMobile} />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  )
}
