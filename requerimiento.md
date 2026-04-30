PROMPT DE DESARROLLO: Feria Campesina MVP (Semana 1-2)
Contexto del proyecto
Plataforma de e-commerce multi-vendedor para agricultores locales. Los clientes compran frutas y verduras. Los agricultores venden sus productos, empacan individualmente y entregan a domicilio solo sábados y domingos. Métodos de pago: transferencia, efectivo contra entrega. Stock actualizado por WhatsApp (manual al inicio).

Stack técnico
Backend: Laravel 12 (PHP 8.2+)

Frontend: React 19 + Vite + TailwindCSS

Base de datos: PostgreSQL 18+

Autenticación: Laravel Sanctum (API tokens)

Estado global frontend: React Context o Zustand

HTTP client: Axios

Estructura de base de datos (PostgreSQL)
sql
-- Usuarios con roles (admin, agricultor, cliente)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'cliente', -- admin, agricultor, cliente
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Productos (cada producto pertenece a un agricultor)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    farmer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'kg', -- kg, unidad, docena, etc.
    image_url TEXT,
    available_saturday BOOLEAN DEFAULT TRUE,
    available_sunday BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pedidos
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES users(id),
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pendiente', -- pendiente, confirmado, en_reparto, entregado, cancelado
    payment_method VARCHAR(50) NOT NULL, -- transferencia, contra_entrega
    delivery_date DATE NOT NULL, -- sábado o domingo
    delivery_address TEXT NOT NULL,
    customer_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items del pedido
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id),
    farmer_id INT NOT NULL REFERENCES users(id),
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- Para tracking de notificaciones WhatsApp (opcional, pero útil)
CREATE TABLE whatsapp_logs (
    id SERIAL PRIMARY KEY,
    farmer_id INT REFERENCES users(id),
    order_id INT REFERENCES orders(id),
    message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pendiente'
);
Endpoints API requeridos (Laravel)
Método	Endpoint	Descripción
POST	/api/register	Registro de clientes y agricultores
POST	/api/login	Login (email+password)
GET	/api/user	Obtener usuario autenticado
GET	/api/products	Listar productos (con filtro por agricultor, stock>0)
GET	/api/products/{id}	Detalle de producto
POST	/api/cart/add	Agregar al carrito (sesión o DB)
GET	/api/cart	Ver carrito
POST	/api/orders	Crear pedido
GET	/api/orders/{id}	Ver detalle de pedido
GET	/api/orders/farmer	Pedidos del agricultor autenticado
PATCH	/api/products/{id}/stock	Actualizar stock (solo agricultor)
Funcionalidades frontend (React)
Rutas necesarias:

/ → Catálogo de productos

/productos/:id → Detalle de producto

/carrito → Carrito de compras

/checkout → Finalizar compra (fecha: sábado o domingo)

/mis-pedidos → Historial de pedidos (clientes)

/panel/agricultor/pedidos → Ver pedidos recibidos (agricultor)

/panel/agricultor/productos → CRUD de productos (agricultor)

/login y /registro

Componentes clave:

ProductCard (imagen, nombre, precio, stock, botón agregar)

CartItem (producto, cantidad, subtotal, eliminar)

OrderSummary (total, método de pago, fecha entrega)

FarmerOrdersList (tabla con pedidos, botón para marcar como listo)

✅ CHECKLIST POR ETAPA (Semana 1-2)
DÍA 1-2: Configuración inicial del proyecto
1.1 Crear proyecto Laravel: composer create-project laravel/laravel feria-campesina

1.2 Configurar .env con conexión a PostgreSQL (DB, usuario, password)

1.3 Crear proyecto React con Vite dentro de frontend/: npm create vite@latest frontend -- --template react

1.4 Instalar TailwindCSS en React: npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p

1.5 Configurar Laravel Sanctum: php artisan install:api y php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

1.6 Configurar CORS en Laravel para aceptar peticiones desde http://localhost:5173

1.7 Crear migraciones (ejecutar los SQL del schema adaptado a migrations de Laravel)

1.8 Ejecutar migraciones: php artisan migrate

DÍA 3-4: Backend - Autenticación y Catálogo
2.1 Crear modelo User con campo role (admin/agricultor/cliente) y phone

2.2 Crear seeders: al menos 2 agricultores de prueba, 3 productos por agricultor

2.3 Crear controlador AuthController (register, login, logout, user)

2.4 Crear rutas API protegidas con Sanctum

2.5 Crear controlador ProductController (index, show, store, update, destroy)

2.6 Agregar middleware para que solo agricultores puedan crear/editar productos

2.7 Crear endpoint PATCH /api/products/{id}/stock para actualizar stock individualmente

2.8 Probar todo con Postman o Thunder Client

DÍA 5-6: Backend - Carrito y Pedidos
3.1 Implementar carrito vía sesión (o tabla carts si prefieres persistente)

3.2 Crear controlador CartController (add, remove, updateQuantity, getCart)

3.3 Validar en el carrito que el stock disponible no sea menor a lo solicitado

3.4 Crear controlador OrderController con método store (crear pedido)

3.5 Al crear pedido: validar que delivery_date sea sábado o domingo (no fechas pasadas)

3.6 Registrar cada order_item con farmer_id para saber a quién pagar después

3.7 Vaciar carrito después de pedido exitoso

3.8 Crear endpoint GET /api/orders/farmer (pedidos del agricultor autenticado)

DÍA 7-8: Frontend - Autenticación y Catálogo
4.1 Configurar Axios en React con baseURL a Laravel y manejo de tokens

4.2 Crear contexto AuthContext (login, register, logout, user)

4.3 Crear páginas Login.jsx y Register.jsx

4.4 Proteger rutas: si no hay token, redirigir a login

4.5 Crear componente Navbar con enlaces según rol (cliente vs agricultor)

4.6 Crear página Home.jsx (catálogo de productos) consumiendo /api/products

4.7 Crear componente ProductCard y lógica de paginación básica

4.8 Conectar botón "Agregar al carrito" con el endpoint de cart

DÍA 9-10: Frontend - Carrito y Checkout
5.1 Crear contexto CartContext con estado global del carrito

5.2 Crear página Cart.jsx (lista de items, modificar cantidades, eliminar)

5.3 Validar stock antes de permitir cambios en carrito

5.4 Crear página Checkout.jsx con formulario de dirección y selección de fecha (sáb/dom)

5.5 Mostrar métodos de pago: transferencia y contra entrega

5.6 Enviar pedido a /api/orders y redirigir a página de éxito

5.7 Crear página MisPedidos.jsx (clientes) mostrando sus órdenes

5.8 Agregar detalle de pedido con items y total

DÍA 11-12: Frontend - Panel del Agricultor
6.1 Crear página PanelAgricultorPedidos.jsx (solo para role=agricultor)

6.2 Mostrar tabla con pedidos que contengan productos de ese agricultor

6.3 En cada pedido, mostrar: cliente, dirección, items, total

6.4 Agregar botón "Marcar como listo para reparto" (cambia estado local)

6.5 Crear página PanelAgricultorProductos.jsx (CRUD de sus productos)

6.6 Formulario para crear/editar producto (nombre, precio, stock, unidad)

6.7 Input rápido para actualizar stock de un producto existente

6.8 Generar "packing slip" simple (vista HTML) agrupado por pedido

DÍA 13-14: Integración WhatsApp y limpieza
7.1 Agregar en OrderController al crear pedido: enviar notificación al agricultor vía webhook (simulado)

7.2 Crear comando artisan whatsapp:notify que envíe mensajes desde tabla whatsapp_logs

7.3 Configurar en .env variables WHATSAPP_API_URL (placeholder si no tienes API real)

7.4 Agregar en panel agricultor un botón "Notificar por WhatsApp" (abre WhatsApp Web con mensaje predefinido)

7.5 Revisar que las fechas de entrega no permitan sábados/domingos anteriores a hoy

7.6 Agregar carga de imágenes de productos (usando Laravel Storage)

7.7 Escribir archivo README.md con instrucciones para levantar proyecto (migraciones, seeders, frontend build)

7.8 Desplegar en servidor de prueba (Railway, Render, o VPS simple) y probar con usuarios reales

✅ Finalización de etapa
Semana 1-2 completada cuando: Un cliente puede registrarse, ver productos, agregar al carrito, elegir sábado/domingo como fecha de entrega, pagar con transferencia o contra entrega, y el agricultor puede ver sus pedidos pendientes en un panel y actualizar stock.

Marcador de finalización: Ejecuta php artisan test con pruebas básicas (o manualmente verifica los 8 flujos principales). Si todos pasan, la etapa está lista.

Nota final para el desarrollador
Este prompt está diseñado para ser ejecutable en paralelo en tu máquina. Te sugiero:

Crear un repositorio Git e ir haciendo commits al marcar cada ítem.

Usar herramientas como Laravel Pint para formateo automático y ESLint + Prettier para React.

Si usas Cursor o Copilot, copia este prompt completo y dile: "Ayúdame a implementar el DÍA 1-2 según este checklist".

¿Quieres que desglose cualquier ítem específico con más detalle (código de ejemplo, estructura de carpetas, o configuración particular)?

lo mismo pero en un .md para descargar. Lo otro, existe un super usuario administrador?
Aquí tienes el archivo README.md completo para descargar, incluyendo el super usuario administrador y todas las funcionalidades organizadas por etapa.

📥 Instrucciones para descargar
Copia el contenido del bloque de código que está al final de este mensaje y:

Abre tu editor de código (VS Code, Sublime, etc.)

Crea un nuevo archivo llamado FERIA_CAMPESINA_MVP.md

Pega todo el contenido

Guarda el archivo

O si prefieres descargarlo directamente, puedo generarlo como un archivo adjunto simulado (pero como esto es texto plano, tendrás que copiarlo).

📋 Contenido del archivo .md
markdown
# 🚜 Feria Campesina - MVP Semana 1-2

**Plataforma de e-commerce multi-vendedor para agricultores locales**

---

## 📌 Tabla de Contenidos

1. [Contexto del Proyecto](#contexto-del-proyecto)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Base de Datos](#base-de-datos)
4. [Endpoints API](#endpoints-api)
5. [Estructura Frontend](#estructura-frontend)
6. [Super Usuario Administrador](#super-usuario-administrador)
7. [Checklist por Etapa (Día a Día)](#checklist-por-etapa-día-a-día)
8. [Criterios de Aceptación](#criterios-de-aceptación)
9. [Comandos Útiles](#comandos-útiles)

---

## 🎯 Contexto del Proyecto

Plataforma de e-commerce multi-vendedor donde:

- **Clientes** compran frutas y verduras orgánicas
- **Agricultores** venden sus productos, empacan individualmente
- **Entregas** solo sábados y domingos a domicilio
- **Pagos**: Transferencia bancaria o efectivo contra entrega
- **Stock**: Agricultores actualizan vía WhatsApp (manual al inicio)

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| Backend | Laravel | 11.x |
| Frontend | React | 18.x |
| Build Tool | Vite | 5.x |
| CSS | TailwindCSS | 3.x |
| Base de Datos | PostgreSQL | 15+ |
| Autenticación API | Laravel Sanctum | Última |
| HTTP Client | Axios | 1.x |

---

## 🗄️ Base de Datos (PostgreSQL)

### Script SQL Completo

```sql
-- =============================================
-- 1. TABLA DE USUARIOS (con roles)
-- =============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'cliente' CHECK (role IN ('admin', 'agricultor', 'cliente')),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 2. TABLA DE PRODUCTOS
-- =============================================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    farmer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    unit VARCHAR(50) DEFAULT 'kg',
    image_url TEXT,
    available_saturday BOOLEAN DEFAULT TRUE,
    available_sunday BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 3. TABLA DE PEDIDOS
-- =============================================
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES users(id),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    status VARCHAR(50) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'confirmado', 'en_reparto', 'entregado', 'cancelado')),
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('transferencia', 'contra_entrega')),
    delivery_date DATE NOT NULL,
    delivery_address TEXT NOT NULL,
    customer_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 4. TABLA DE ITEMS DEL PEDIDO
-- =============================================
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id),
    farmer_id INT NOT NULL REFERENCES users(id),
    quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0)
);

-- =============================================
-- 5. TABLA DE LOGS DE WHATSAPP (opcional)
-- =============================================
CREATE TABLE whatsapp_logs (
    id SERIAL PRIMARY KEY,
    farmer_id INT REFERENCES users(id),
    order_id INT REFERENCES orders(id),
    message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pendiente'
);

-- =============================================
-- 6. ÍNDICES PARA RENDIMIENTO
-- =============================================
CREATE INDEX idx_products_farmer ON products(farmer_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_farmer ON order_items(farmer_id);

-- =============================================
-- 7. SEEDERS (Datos de prueba)
-- =============================================
-- Super Admin
INSERT INTO users (name, email, password, role, phone) VALUES 
('Super Admin', 'admin@feriacampesina.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '999999999');

-- Contraseña del admin: password (hash por defecto de Laravel)

-- Agricultores de prueba
INSERT INTO users (name, email, password, role, phone, address) VALUES 
('Don Juan Pérez', 'juan@huerto.cl', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'agricultor', '912345678', 'Camino a Lonquén 123'),
('Doña María González', 'maria@organica.cl', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'agricultor', '987654321', 'Valle de la Luna s/n');

-- Productos de Don Juan
INSERT INTO products (farmer_id, name, description, price, stock, unit, image_url) VALUES 
(2, 'Tomates Orgánicos', 'Tomates cultivados sin pesticidas, cosecha fresca', 2500, 50, 'kg', 'tomates.jpg'),
(2, 'Lechuga Hidropónica', 'Lechuga crujiente, lavada y lista para comer', 1800, 30, 'unidad', 'lechuga.jpg'),
(2, 'Zanahorias Baby', 'Dulces y crocantes, ideal para ensaladas', 2000, 40, 'atado', 'zanahorias.jpg');

-- Productos de Doña María
INSERT INTO products (farmer_id, name, description, price, stock, unit, image_url) VALUES 
(3, 'Manzanas Verdes', 'Variedad Granny Smith, ácidas y crujientes', 3200, 35, 'kg', 'manzanas.jpg'),
(3, 'Frutillas', 'Frutas del bosque, cosechadas al amanecer', 4500, 20, 'bandeja', 'frutillas.jpg'),
(3, 'Paltas Hass', 'Paltas cremosas, punto justo de madurez', 3800, 25, 'kg', 'paltas.jpg');
🔌 Endpoints API (Laravel)
Autenticación
Método	Endpoint	Descripción	Rol
POST	/api/register	Registro de usuarios	Todos
POST	/api/login	Inicio de sesión	Todos
POST	/api/logout	Cerrar sesión	Todos
GET	/api/user	Obtener usuario actual	Todos
Productos
Método	Endpoint	Descripción	Rol
GET	/api/products	Listar productos (activos, stock>0)	Todos
GET	/api/products/{id}	Detalle de producto	Todos
POST	/api/products	Crear producto	Agricultor/Admin
PUT	/api/products/{id}	Actualizar producto	Agricultor (suyo) / Admin
DELETE	/api/products/{id}	Eliminar producto	Agricultor (suyo) / Admin
PATCH	/api/products/{id}/stock	Actualizar stock rápido	Agricultor/Admin
Carrito (vía sesión/contexto)
Método	Endpoint	Descripción
POST	/api/cart/add	Agregar item
GET	/api/cart	Ver carrito
PATCH	/api/cart/{itemId}	Actualizar cantidad
DELETE	/api/cart/{itemId}	Eliminar item
Pedidos
Método	Endpoint	Descripción	Rol
POST	/api/orders	Crear pedido	Cliente
GET	/api/orders	Listar mis pedidos	Cliente
GET	/api/orders/{id}	Detalle de pedido	Cliente/Agricultor(if owns items)
GET	/api/orders/farmer	Pedidos del agricultor	Agricultor/Admin
PATCH	/api/orders/{id}/status	Actualizar estado	Agricultor/Admin
Administración (solo admin)
Método	Endpoint	Descripción
GET	/api/admin/users	Listar todos los usuarios
PATCH	/api/admin/users/{id}/role	Cambiar rol de usuario
GET	/api/admin/stats	Estadísticas generales
GET	/api/admin/pedidos	Todos los pedidos del sistema
🎨 Estructura Frontend (React)
Árbol de Componentes
text
src/
├── components/
│   ├── common/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── LoadingSpinner.jsx
│   ├── products/
│   │   ├── ProductCard.jsx
│   │   ├── ProductList.jsx
│   │   └── ProductDetail.jsx
│   ├── cart/
│   │   ├── CartItem.jsx
│   │   └── CartSummary.jsx
│   ├── orders/
│   │   ├── OrderCard.jsx
│   │   └── OrderDetail.jsx
│   └── farmer/
│       ├── FarmerOrderList.jsx
│       ├── FarmerProductForm.jsx
│       └── StockUpdater.jsx
├── contexts/
│   ├── AuthContext.jsx
│   └── CartContext.jsx
├── pages/
│   ├── Home.jsx           (catálogo)
│   ├── ProductDetail.jsx
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── MisPedidos.jsx      (cliente)
│   ├── PanelAgricultor/
│   │   ├── Pedidos.jsx
│   │   ├── Productos.jsx
│   │   └── Dashboard.jsx
│   └── Admin/
│       ├── Usuarios.jsx
│       ├── Estadisticas.jsx
│       └── PedidosGlobales.jsx
├── services/
│   ├── api.js             (configuración Axios)
│   ├── authService.js
│   ├── productService.js
│   ├── cartService.js
│   └── orderService.js
├── utils/
│   ├── validators.js
│   └── formatters.js
├── App.jsx
└── main.jsx
Rutas Protegidas por Rol
Ruta	Componente	Rol Requerido
/	Home	Todos
/login	Login	Invitados
/register	Register	Invitados
/productos/:id	ProductDetail	Todos
/carrito	Cart	Cliente
/checkout	Checkout	Cliente
/mis-pedidos	MisPedidos	Cliente
/panel/agricultor/*	PanelAgricultor	Agricultor o Admin
/admin/*	Admin	Solo Admin
👑 Super Usuario Administrador
Características del Rol Admin
El Super Usuario Administrador tiene acceso a:

Gestión de Usuarios

Ver todos los usuarios registrados (clientes y agricultores)

Cambiar roles (promover cliente a agricultor, o al revés)

Activar/desactivar cuentas

Ver historial de pedidos de cualquier usuario

Gestión Global de Pedidos

Ver todos los pedidos del sistema

Filtrar por fecha, estado, agricultor, cliente

Cambiar estado de cualquier pedido manualmente

Resolver conflictos (ej. agricultor no actualizó stock)

Estadísticas y Reportes

Ventas totales por día/semana/mes

Top productos más vendidos

Ranking de agricultores por ventas

Reporte de comisiones (si implementas en V2)

Gestión de Agricultores

Agregar/Eliminar agricultores

Ver productos de cada agricultor

Forzar actualización de stock si un agricultor no responde

Configuración del Sistema

Modificar comisión global (para V2 con pagos automáticos)

Configurar días y horarios de entrega

Ver logs de WhatsApp

Credenciales por Defecto (Seeder)
php
// Admin por defecto
email: admin@feriacampesina.com
password: password

// NOTA: Cambiar en producción inmediatamente
Panel de Admin (Vista Rápida)
jsx
// Ejemplo de estructura del panel admin
<AdminLayout>
  <Route path="dashboard" element={<AdminDashboard />} />
  <Route path="usuarios" element={<UserManagement />} />
  <Route path="pedidos" element={<GlobalOrders />} />
  <Route path="agricultores" element={<FarmersList />} />
  <Route path="estadisticas" element={<Statistics />} />
  <Route path="configuracion" element={<SystemConfig />} />
</AdminLayout>
Middleware para Proteger Rutas Admin (Laravel)
php
// app/Http/Middleware/AdminMiddleware.php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!auth()->check() || auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Acceso denegado. Se requieren permisos de administrador.'], 403);
        }
        
        return $next($request);
    }
}

// Registrar en kernel.php
// 'admin' => \App\Http\Middleware\AdminMiddleware::class,
Rutas Admin en api.php
php
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/users', [AdminController::class, 'getUsers']);
    Route::patch('/users/{id}/role', [AdminController::class, 'updateRole']);
    Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
    Route::get('/orders', [AdminController::class, 'getAllOrders']);
    Route::patch('/orders/{id}/status', [AdminController::class, 'updateOrderStatus']);
    Route::get('/stats', [AdminController::class, 'getStatistics']);
    Route::get('/farmers', [AdminController::class, 'getFarmers']);
    Route::post('/farmers', [AdminController::class, 'createFarmer']);
});
✅ Checklist por Etapa (Día a Día)
📅 DÍA 1-2: Configuración Inicial
1.1 Crear proyecto Laravel: composer create-project laravel/laravel feria-campesina

1.2 Configurar .env con PostgreSQL

1.3 Crear proyecto React con Vite en frontend/

1.4 Instalar y configurar TailwindCSS

1.5 Instalar Laravel Sanctum: composer require laravel/sanctum

1.6 Publicar y configurar Sanctum: php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

1.7 Configurar CORS y habilitar credenciales

1.8 Crear migraciones (usar SQL del schema)

1.9 Ejecutar migraciones: php artisan migrate

1.10 Crear seeders con datos de prueba (admin, agricultores, productos)

📅 DÍA 3-4: Backend - Autenticación y Catálogo
2.1 Crear modelo User con campo role y phone

2.2 Crear modelo Product con relaciones

2.3 Crear controlador AuthController (register, login, logout, me)

2.4 Configurar rutas API protegidas con auth:sanctum

2.5 Crear controlador ProductController (CRUD completo)

2.6 Implementar middleware para agricultores (solo ellos crean/editan)

2.7 Crear endpoint PATCH /api/products/{id}/stock

2.8 Probar endpoints con Postman/Thunder Client

📅 DÍA 5-6: Backend - Carrito y Pedidos
3.1 Implementar carrito (usar sesión o tabla carts)

3.2 Crear controlador CartController (add, remove, update, get)

3.3 Validar stock antes de agregar/actualizar

3.4 Crear controlador OrderController (store, index, show, farmerOrders)

3.5 Validar delivery_date (sábado o domingo, no pasado)

3.6 Al crear pedido: registrar order_items con farmer_id

3.7 Vaciar carrito después de pedido exitoso

3.8 Probar flujo completo: carrito → checkout → pedido

📅 DÍA 7-8: Frontend - Autenticación y Catálogo
4.1 Configurar Axios con interceptor para token

4.2 Crear AuthContext (login, register, logout, user)

4.3 Crear páginas Login.jsx y Register.jsx

4.4 Implementar rutas protegidas (PrivateRoute)

4.5 Crear Navbar.jsx con opciones según rol

4.6 Crear página Home.jsx (catálogo de productos)

4.7 Crear ProductCard.jsx e integrar con API

4.8 Conectar botón "Agregar al carrito"

📅 DÍA 9-10: Frontend - Carrito y Checkout
5.1 Crear CartContext con estado global

5.2 Crear página Cart.jsx (lista, modificar, eliminar)

5.3 Validar stock en cada modificación

5.4 Crear página Checkout.jsx (dirección, fecha, pago)

5.5 Mostrar opciones de pago (transferencia / contra entrega)

5.6 Enviar pedido a /api/orders

5.7 Redirigir a página de éxito y vaciar carrito

5.8 Crear página MisPedidos.jsx para clientes

📅 DÍA 11-12: Frontend - Panel del Agricultor
6.1 Crear página PanelAgricultorPedidos.jsx

6.2 Mostrar tabla con pedidos del agricultor

6.3 Agregar detalle de items por pedido

6.4 Implementar botón "Marcar como listo"

6.5 Crear página PanelAgricultorProductos.jsx

6.6 Formulario para crear/editar productos

6.7 Input rápido para actualizar stock

6.8 Generar "packing slip" (vista HTML imprimible)

📅 DÍA 13-14: Panel Admin, WhatsApp e Integración
7.1 Crear AdminMiddleware y registrar en kernel

7.2 Crear AdminController (usuarios, pedidos, stats)

7.3 Crear página Admin/Usuarios.jsx (CRUD usuarios)

7.4 Crear página Admin/PedidosGlobales.jsx

7.5 Crear página Admin/Estadisticas.jsx (gráficos básicos)

7.6 Implementar notificación WhatsApp (webhook simulado)

7.7 Agregar botón en panel agricultor para enviar WhatsApp manual

7.8 Escribir README.md con instrucciones de despliegue

✅ Criterios de Aceptación (Semanas 1-2)
Al finalizar estas dos semanas, el sistema debe permitir:

Flujo Cliente ✅
Registrarse e iniciar sesión

Ver catálogo de productos con stock

Agregar/eliminar productos del carrito

Validar que no pueda agregar más stock del disponible

Realizar checkout eligiendo sábado o domingo como fecha de entrega

Seleccionar método de pago (transferencia o contra entrega)

Confirmar pedido y recibir número de orden

Ver historial de sus pedidos

Flujo Agricultor ✅
Iniciar sesión con rol de agricultor

Ver sus productos (CRUD completo)

Actualizar stock fácilmente (input numérico)

Ver pedidos que incluyen sus productos

Marcar pedidos como "listos para reparto"

Generar packing slip por pedido

Flujo Administrador ✅
Iniciar sesión con credenciales de admin

Ver todos los usuarios del sistema

Cambiar roles (cliente ↔ agricultor)

Ver todos los pedidos (global)

Ver estadísticas básicas (ventas totales, top productos)

Acceder a cualquier panel de agricultor para resolver conflictos

Reglas de Negocio ✅
No se permiten fechas de entrega anteriores a hoy

Solo sábado y domingo como opciones de entrega

El stock se reduce automáticamente al hacer un pedido

Cada pedido registra qué agricultor vende cada item (para pagos futuros)

🚀 Comandos Útiles
Laravel
bash
# Crear migraciones
php artisan make:migration create_products_table
php artisan make:migration create_orders_table
php artisan make:migration create_order_items_table

# Crear modelos
php artisan make:model Product -m
php artisan make:model Order -m
php artisan make:model OrderItem -m

# Crear controladores
php artisan make:controller Api/AuthController
php artisan make:controller Api/ProductController --api
php artisan make:controller Api/OrderController --api
php artisan make:controller Api/AdminController --api

# Crear middleware admin
php artisan make:middleware AdminMiddleware

# Ejecutar migraciones y seeders
php artisan migrate:fresh --seed

# Crear seeder
php artisan make:seeder UserSeeder
php artisan make:seeder ProductSeeder

# Comandos útiles
php artisan route:list      # Ver todas las rutas
php artisan tinker           # Consola interactiva
php artisan cache:clear      # Limpiar caché
React + Vite
bash
# Crear proyecto React con Vite
npm create vite@latest frontend -- --template react

# Instalar dependencias
cd frontend
npm install axios react-router-dom tailwindcss postcss autoprefixer
npm install -D @vitejs/plugin-react

# Inicializar Tailwind
npx tailwindcss init -p

# Ejecutar desarrollo
npm run dev

# Build para producción
npm run build
PostgreSQL
bash
# Acceder a PostgreSQL
sudo -u postgres psql

# Crear base de datos
CREATE DATABASE feria_campesina;
CREATE USER feria_user WITH PASSWORD 'secret';
GRANT ALL PRIVILEGES ON DATABASE feria_campesina TO feria_user;

# Conectar a la base
\c feria_campesina

# Ver tablas
\dt

# Salir
\q
Git (Control de Versiones)
bash
# Inicializar repositorio
git init

# Crear .gitignore (incluir vendor/, node_modules/, .env)
echo "vendor/\nnode_modules/\n.env\n.DS_Store" > .gitignore

# Commits frecuentes
git add .
git commit -m "Día 1-2: Configuración inicial"

# Ver historial de cambios (cada checklist ítem debería ser un commit)
git log --oneline
📦 Despliegue Rápido (Pruebas)
Opción 1: Railway (Recomendado para pruebas)
bash
# Instalar CLI de Railway
npm install -g @railway/cli

# Inicializar proyecto
railway init
railway up
Opción 2: VPS Simple (DigitalOcean, Linode)
bash
# Instalar dependencias
sudo apt update
sudo apt install nginx postgresql php8.2-fpm

# Clonar repositorio
git clone https://tu-repo/feria-campesina.git

# Configurar Nginx y PHP
# (Detalles según proveedor)
📝 Notas Finales
Próximas Características (V2 - Post MVP)
Split payments automáticos (Mercado Pago / Stripe Connect)

WhatsApp API real (envío automático al crear pedido)

Calendario de disponibilidad por agricultor

Sistema de calificaciones y reseñas

Notificaciones push (estado del pedido)

Dashboard con gráficos avanzados

Solución de Problemas Comunes
Problema	Solución
CORS error en React	Verificar config/cors.php, agregar http://localhost:5173 a paths
Token no se guarda	Usar localStorage o cookie HttpOnly (Sanctum)
Error 419 CSRF	Configurar Sanctum stateless o incluir token en headers
Stock negativo	Agregar CHECK (stock >= 0) en BD y validar en backend
Fecha entrega inválida	Validar en OrderController@store con Carbon
Contacto y Soporte
Para dudas durante el desarrollo, revisar:

Laravel Documentation

React Documentation

PostgreSQL Documentation

TailwindCSS Documentation

¡Buena suerte con Feria Campesina! 🚜

Última actualización: Abril 2026

text

---

## 📥 Instrucciones finales

El contenido completo está en el bloque de código anterior. Para guardarlo como archivo `.md`:

1. **Selecciona todo el contenido** del bloque de código (desde ````markdown` hasta el final)
2. **Copia** (Ctrl+C o Cmd+C)
3. **Abre tu editor de texto** (VS Code, Notepad++, Sublime, etc.)
4. **Pega** (Ctrl+V o Cmd+V)
5. **Guarda el archivo** con el nombre `FERIA_CAMPESINA_MVP.md`

**Importante sobre el Super Usuario Administrador:**

✅ **Sí existe** y está completamente integrado en el plan con:

- Rol `admin` en la base de datos (junto a `agricultor` y `cliente`)
- Credenciales por defecto: `admin@feriacampesina.com` / `password`
- Middleware exclusivo para proteger rutas admin
- Panel completo con gestión de usuarios, pedidos globales y estadísticas
- Capacidad de cambiar roles y resolver conflictos

¿Necesitas que ajuste algo del administrador (más permisos, menos permisos, o alguna funcionalidad específica)?