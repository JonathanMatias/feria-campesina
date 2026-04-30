import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { ThemeProvider } from './contexts/ThemeContext'
import PrivateRoute from './components/common/PrivateRoute'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import AdminSidebar from './components/common/AdminSidebar'
import FarmerSidebar from './components/common/FarmerSidebar'
import PageTransition from './components/common/PageTransition'
import ScrollToButton from './components/common/ScrollToButton'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ProductDetail from './pages/ProductDetail'
import FarmerProfilePage from './pages/FarmerProfilePage'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import MisPedidos from './pages/MisPedidos'
import AgricultorPedidos from './pages/PanelAgricultor/Pedidos'
import AgricultorProductos from './pages/PanelAgricultor/Productos'
import { AdminUsuarios, AdminEstadisticas, AdminPedidosGlobales, AdminCategorias, AdminLogs } from './pages/Admin/Admin'

function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex flex-col">
      <Toaster richColors position="top-right" />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/productos/:id" element={<PageTransition><ProductDetail /></PageTransition>} />
          <Route path="/agricultor/:id" element={<PageTransition><FarmerProfilePage /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/registro" element={<PageTransition><Register /></PageTransition>} />

          <Route path="/carrito" element={
            <PrivateRoute roles={['cliente', 'agricultor', 'admin']}>
              <div className="container mx-auto px-4 py-8"><Cart /></div>
            </PrivateRoute>
          } />
          <Route path="/checkout" element={
            <PrivateRoute roles={['cliente', 'agricultor', 'admin']}>
              <div className="container mx-auto px-4 py-8"><Checkout /></div>
            </PrivateRoute>
          } />
          <Route path="/mis-pedidos" element={
            <PrivateRoute roles={['cliente', 'agricultor', 'admin']}>
              <div className="container mx-auto px-4 py-8"><MisPedidos /></div>
            </PrivateRoute>
          } />

          {/* Panel Agricultor con sidebar */}
          <Route path="/panel/agricultor/pedidos" element={
            <PrivateRoute roles={['agricultor', 'admin']}>
              <div className="flex flex-col lg:flex-row">
                <FarmerSidebar />
                <div className="flex-1 p-4 lg:p-8 pt-16 lg:pt-8">
                  <AgricultorPedidos />
                </div>
              </div>
            </PrivateRoute>
          } />
          <Route path="/panel/agricultor/productos" element={
            <PrivateRoute roles={['agricultor', 'admin']}>
              <div className="flex flex-col lg:flex-row">
                <FarmerSidebar />
                <div className="flex-1 p-4 lg:p-8 pt-16 lg:pt-8">
                  <AgricultorProductos />
                </div>
              </div>
            </PrivateRoute>
          } />

          {/* Admin con sidebar */}
          <Route path="/admin/usuarios" element={
            <PrivateRoute roles={['admin']}>
              <div className="flex flex-col lg:flex-row">
                <AdminSidebar />
                <div className="flex-1 p-4 lg:p-8 pt-16 lg:pt-8">
                  <AdminUsuarios />
                </div>
              </div>
            </PrivateRoute>
          } />
          <Route path="/admin/pedidos" element={
            <PrivateRoute roles={['admin']}>
              <div className="flex flex-col lg:flex-row">
                <AdminSidebar />
                <div className="flex-1 p-4 lg:p-8 pt-16 lg:pt-8">
                  <AdminPedidosGlobales />
                </div>
              </div>
            </PrivateRoute>
          } />
          <Route path="/admin/estadisticas" element={
            <PrivateRoute roles={['admin']}>
              <div className="flex flex-col lg:flex-row">
                <AdminSidebar />
                <div className="flex-1 p-4 lg:p-8 pt-16 lg:pt-8">
                  <AdminEstadisticas />
                </div>
              </div>
            </PrivateRoute>
          } />
          <Route path="/admin/categorias" element={
            <PrivateRoute roles={['admin']}>
              <div className="flex flex-col lg:flex-row">
                <AdminSidebar />
                <div className="flex-1 p-4 lg:p-8 pt-16 lg:pt-8">
                  <AdminCategorias />
                </div>
              </div>
            </PrivateRoute>
          } />
          <Route path="/admin/logs" element={
            <PrivateRoute roles={['admin']}>
              <div className="flex flex-col lg:flex-row">
                <AdminSidebar />
                <div className="flex-1 p-4 lg:p-8 pt-16 lg:pt-8">
                  <AdminLogs />
                </div>
              </div>
            </PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <ScrollToButton />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <AppLayout />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
