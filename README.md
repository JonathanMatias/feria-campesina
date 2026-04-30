# Feria Campesina

Plataforma de e-commerce multi-vendedor para agricultores locales.

## Stack

- **Backend:** Laravel 10 + Sanctum (API tokens)
- **Frontend:** React 19 + Vite + TailwindCSS 4
- **Base de datos:** SQLite (desarrollo)

## Requisitos

- PHP 8.1+ con extensiones: pdo_sqlite, sqlite3, gd
- Node.js 18+
- Composer

## Instalación rápida

```bash
# 1. Clonar o copiar el proyecto
cd feria-campesina

# 2. Backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link

# 3. Frontend
cd frontend
npm install
npm run dev
```

## Iniciar

```bash
# Terminal 1 - Backend (http://localhost:8000)
cd feria-campesina
php artisan serve

# Terminal 2 - Frontend (http://localhost:5173)
cd feria-campesina/frontend
npm run dev
```

## Usuarios de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@feriacampesina.com | password |
| Agricultor | juan@huerto.cl | password |
| Agricultora | maria@organica.cl | password |
| Cliente | cliente@test.cl | password |

## Funcionalidades

### Cliente
- Catálogo con búsqueda y filtro por categorías
- Perfil de agricultor con productos y reseñas
- Carrito de compras con sesión
- Checkout con timeline paso a paso
- Selección de fecha (sáb/dom) y método de pago
- Historial de pedidos

### Agricultor
- Panel lateral con sidebar
- CRUD de productos con imágenes (drag & drop)
- Actualización rápida de stock
- Ver pedidos recibidos
- Packing slip imprimible
- Notificación WhatsApp

### Admin
- Panel lateral con sidebar
- Gestión de usuarios (editar, cambiar rol, eliminar)
- Gestión de categorías (activar/desactivar)
- Todos los pedidos del sistema
- Estadísticas generales

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/` | Catálogo de productos |
| `/productos/:id` | Detalle de producto |
| `/agricultor/:id` | Perfil del agricultor |
| `/carrito` | Carrito de compras |
| `/checkout` | Finalizar pedido |
| `/mis-pedidos` | Historial de pedidos |
| `/panel/agricultor/*` | Panel del agricultor |
| `/admin/*` | Panel de administración |

## Endpoints API

Ver todas las rutas: `php artisan route:list`

## Notas

- Se usa SQLite. Para producción cambiar a MySQL/PostgreSQL en `.env`
- Las imágenes se almacenan en `storage/app/public/`
- Ejecutar `php artisan storage:link` una sola vez
