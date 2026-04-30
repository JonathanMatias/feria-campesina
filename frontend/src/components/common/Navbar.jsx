import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { useTheme } from '../../contexts/ThemeContext'
import { ShoppingCart, Package, User, LogOut, LayoutDashboard, Leaf, Moon, Sun, Menu, X, MoreVertical } from 'lucide-react'

export default function Navbar() {
  const { user, logout, isAdmin, isAgricultor } = useAuth()
  const { itemCount } = useCart()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
    setMobileOpen(false)
  }

  const closeMobile = () => setMobileOpen(false)

  const navLinks = (
    <>
      {user ? (
        <>
          {/* Desktop: botón agrupador */}
          <div className="hidden lg:block relative group/menu">
            <button className="hover:text-green-200 p-1.5 rounded-lg hover:bg-green-600/30 flex items-center gap-1">
              <MoreVertical className="w-5 h-5" />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 z-50 animate-scale-in">
              <Link to="/carrito" onClick={closeMobile} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <ShoppingCart className="w-4 h-4" /> Carrito
                {itemCount > 0 && <span className="ml-auto bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5">{itemCount}</span>}
              </Link>
              <Link to="/mis-pedidos" onClick={closeMobile} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Package className="w-4 h-4" /> Mis Pedidos
              </Link>
              {(isAgricultor || isAdmin) && (
                <Link to="/panel/agricultor/pedidos" onClick={closeMobile} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <LayoutDashboard className="w-4 h-4" /> Panel Agricultor
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin/usuarios" onClick={closeMobile} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <User className="w-4 h-4" /> Administración
                </Link>
              )}
            </div>
          </div>

          {/* Mobile: links individuales */}
          <div className="lg:hidden flex flex-col gap-2">
            <Link to="/carrito" onClick={closeMobile} className="relative hover:text-green-200 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Carrito
              {itemCount > 0 && <span className="bg-yellow-400 text-green-900 text-xs rounded-full px-1.5 py-0.5 font-bold">{itemCount}</span>}
            </Link>
            <Link to="/mis-pedidos" onClick={closeMobile} className="hover:text-green-200 flex items-center gap-2">
              <Package className="w-5 h-5" /> Mis Pedidos
            </Link>
            {(isAgricultor || isAdmin) && (
              <Link to="/panel/agricultor/pedidos" onClick={closeMobile} className="hover:text-green-200 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5" /> Panel
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin/usuarios" onClick={closeMobile} className="hover:text-green-200 flex items-center gap-2">
                <User className="w-5 h-5" /> Admin
              </Link>
            )}
          </div>

          {/* Avatar dropdown (siempre visible) */}
          <div className="relative group">
            <button className="flex items-center gap-2">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-green-400 group-hover:ring-green-200 transition-all" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-green-600 ring-2 ring-green-400 group-hover:ring-green-200 transition-all flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              )}
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 animate-scale-in">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Cerrar sesión
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <Link to="/login" onClick={closeMobile} className="hover:text-green-200 flex items-center gap-1">
            <User className="w-4 h-4" />
            Ingresar
          </Link>
          <Link to="/registro" onClick={closeMobile} className="bg-white text-green-700 px-3 py-1 rounded hover:bg-green-100 font-medium">
            Registrarse
          </Link>
        </>
      )}
    </>
  )

  return (
    <nav className="bg-green-700 dark:bg-green-900 text-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold tracking-tight flex items-center gap-2 flex-shrink-0" style={{ fontFamily: "'Lora', serif" }}>
            <Leaf className="w-6 h-6" />
            <span className="hidden sm:inline">Feria Campesina</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-4">
            <button onClick={toggle} className="hover:text-green-200 p-1.5 rounded-lg hover:bg-green-600/30" title={dark ? 'Modo claro' : 'Modo oscuro'}>
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-5">
              {navLinks}
            </div>
          </div>

          {/* Mobile buttons */}
          <div className="flex lg:hidden items-center gap-2">
            <button onClick={toggle} className="hover:text-green-200 p-1.5 rounded-lg hover:bg-green-600/30">
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1.5 rounded-lg hover:bg-green-600/30">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-green-600 py-4 space-y-3 animate-in slide-in-from-top duration-200">
            <div className="flex flex-col gap-3">
              {navLinks}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
