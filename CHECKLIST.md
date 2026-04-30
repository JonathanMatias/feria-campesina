# Feria Campesina - Checklist de Implementación

> **Regla:** Cada cambio, feature o fix que se realice debe agregarse a este checklist para mantener el contexto actualizado entre sesiones.

> **Git:** No subir cambios a GitHub a menos que el usuario lo pida explícitamente. Solo commits locales.

## 📅 DÍA 1-2: Configuración Inicial
- [x] 1.1 Crear proyecto Laravel
- [x] 1.2 Configurar .env con conexión a base de datos (SQLite)
- [x] 1.3 Crear proyecto React con Vite en frontend/
- [x] 1.4 Instalar y configurar TailwindCSS
- [x] 1.5 Instalar y configurar Laravel Sanctum
- [x] 1.6 Configurar CORS para aceptar peticiones desde frontend
- [x] 1.7 Crear migraciones (users, products, orders, order_items)
- [x] 1.8 Ejecutar migraciones
- [x] 1.9 Crear seeders con datos de prueba

## 📅 DÍA 3-4: Backend - Autenticación y Catálogo
- [x] 2.1 Crear modelo User con campo role
- [x] 2.2 Crear modelo Product con relaciones
- [x] 2.3 Crear controlador AuthController
- [x] 2.4 Configurar rutas API protegidas con Sanctum
- [x] 2.5 Crear controlador ProductController (CRUD)
- [x] 2.6 Middleware para agricultores (incluido en ProductController)
- [x] 2.7 Endpoint PATCH /api/products/{id}/stock
- [x] 2.8 Rutas verificadas (32+ rutas registradas)

## 📅 DÍA 5-6: Backend - Carrito y Pedidos
- [x] 3.1 Implementar carrito (sesión)
- [x] 3.2 Crear CartController
- [x] 3.3 Validar stock en carrito
- [x] 3.4 Crear OrderController
- [x] 3.5 Validar delivery_date (sáb/dom)
- [x] 3.6 Registrar order_items con farmer_id
- [x] 3.7 Vaciar carrito tras pedido exitoso
- [x] 3.8 Endpoint GET /api/orders/farmer

## 📅 DÍA 7-8: Frontend - Autenticación y Catálogo
- [x] 4.1 Configurar Axios con interceptores
- [x] 4.2 Crear AuthContext
- [x] 4.3 Páginas Login.jsx y Register.jsx
- [x] 4.4 Rutas protegidas (PrivateRoute)
- [x] 4.5 Componente Navbar
- [x] 4.6 Página Home.jsx (catálogo)
- [x] 4.7 Componente ProductCard
- [x] 4.8 Botón "Agregar al carrito"

## 📅 DÍA 9-10: Frontend - Carrito y Checkout
- [x] 5.1 CartContext con estado global
- [x] 5.2 Página Cart.jsx
- [x] 5.3 Validación de stock
- [x] 5.4 Página Checkout.jsx (timeline + resumen + validación)
- [x] 5.5 Opciones de pago
- [x] 5.6 Enviar pedido a /api/orders
- [x] 5.7 Página MisPedidos.jsx
- [x] 5.8 Detalle de pedido

## 📅 DÍA 11-12: Frontend - Panel del Agricultor
- [x] 6.1 PanelAgricultorPedidos.jsx
- [x] 6.2 Tabla de pedidos del agricultor
- [x] 6.3 Detalle de items por pedido
- [x] 6.4 Botón "Marcar como listo"
- [x] 6.5 PanelAgricultorProductos.jsx (con Sidebar)
- [x] 6.6 Formulario CRUD productos (modales)
- [x] 6.7 Input rápido de stock (modal)
- [x] 6.8 Packing slip (vista HTML imprimible)

## 📅 DÍA 13-14: Panel Admin, WhatsApp e Integración
- [x] 7.1 AdminMiddleware
- [x] 7.2 AdminController
- [x] 7.3 Admin/Usuarios.jsx (CRUD usuarios con modal editar)
- [x] 7.4 Admin/PedidosGlobales.jsx
- [x] 7.5 Admin/Estadisticas.jsx
- [x] 7.6 Notificación WhatsApp (vía WhatsAppButton)
- [x] 7.7 Botón WhatsApp en panel agricultor
- [x] 7.8 README.md con instrucciones

---

**Última actualización:** Abril 2026


### Logging
- [x] 30 puntos de log en todos los controladores (Laravel Log)

### UI/UX
- [x] Sidebar vertical en Admin y Panel Agricultor
- [x] Íconos lucide-react en todo el frontend
- [x] Sonner (toast notifications) en lugar de alert()
- [x] KebabMenu (⋮) en tablas para acciones
- [x] DataTable reutilizable con búsqueda, ordenamiento y paginación
- [x] Modales para crear/editar productos y usuarios
- [x] Tipografía: Lora (headings) + Nunito (body)
- [x] Checkout con timeline paso a paso
- [x] Validación visual de pasos completados (verde)
- [x] Bloqueo de confirmación si faltan datos
- [x] Botón cancelar en checkout

### Categorías
- [x] Tabla categories (name, slug, icon emoji, active)
- [x] Relación Product - Category
- [x] Filtro por categoría en catálogo (chips)
- [x] Mantenedor CRUD en Admin con toggle activar/desactivar
- [x] Solo categorías activas visibles en catálogo público

### Imágenes de productos
- [x] Tabla product_images (hasta múltiples por producto)
- [x] ImageUploader con drag & drop y preview
- [x] Carrusel de imágenes en ProductCard (← → dots)
- [x] Galería en ProductDetail
- [x] Eliminación de imágenes individuales

### Fotos de perfil (avatar)
- [x] Campo avatar en users
- [x] Upload en registro y edición de usuario
- [x] Avatar circular en Navbar, tablas y perfil de agricultor

### Perfil de agricultor
- [x] Página /agricultor/:id estilo perfil
- [x] Info de contacto, productos y reseñas
- [x] Sistema de reseñas con estrellas
- [x] Cliente solo puede dejar 1 reseña por agricultor
- [x] Últimas 3 reseñas en grid horizontal

### Control de visibilidad
- [x] Campo active en products y categories
- [x] Toggle activar/desactivar en tablas de administración
- [x] Productos ocultos no visibles en catálogo público
- [x] Badge "Visible"/"Oculto" en Mis Productos

### Seguridad
- [x] Admin ve todos los productos en panel
- [x] Agricultor solo ve sus propios productos
- [x] Rutas protegidas por rol (admin, agricultor, cliente)

---

**Stack:** Laravel 10 + React 19 + Vite + TailwindCSS 4 + SQLite
