import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Package, ShoppingCart, ChevronRight, PanelLeftClose, PanelLeftOpen, Menu } from 'lucide-react'

export default function FarmerSidebar() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('farmer_sidebar_collapsed') === 'true')
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('farmer_sidebar_collapsed', next)
  }

  const links = [
    { to: '/panel/agricultor/pedidos', icon: ShoppingCart, label: 'Pedidos' },
    { to: '/panel/agricultor/productos', icon: Package, label: 'Productos' },
  ]

  const closeMobile = () => setMobileOpen(false)

  const SidebarContent = () => (
    <aside className={`${collapsed ? 'lg:w-16' : 'lg:w-56'} w-56 bg-green-800 dark:bg-green-950 min-h-screen text-white flex-shrink-0 transition-all duration-300`}>
      <div className={`p-5 border-b border-green-700 dark:border-green-800 flex items-center ${collapsed ? 'lg:justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ChevronRight className="w-5 h-5" /> Panel Agricultor
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
              <span className="lg:inline">{collapsed ? '' : link.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="lg:hidden fixed top-20 left-4 z-30 bg-green-600 text-white p-2 rounded-lg shadow-lg">
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden lg:block">
        <SidebarContent />
      </div>

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
