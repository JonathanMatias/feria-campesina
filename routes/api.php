<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\LogController;

// Auth (públicas)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Productos (públicas)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Categorías (pública)
Route::get('/categories', [CategoryController::class, 'index']);

// Reseñas (públicas para leer)
Route::get('/farmers/{farmerId}/reviews', [ReviewController::class, 'farmerReviews']);

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Productos (CRUD para agricultores)
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::patch('/products/{id}/stock', [ProductController::class, 'updateStock']);

    // Carrito
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::get('/cart', [CartController::class, 'getCart']);
    Route::patch('/cart/{itemId}', [CartController::class, 'updateQuantity']);
    Route::delete('/cart/{itemId}', [CartController::class, 'remove']);

    // Pedidos
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/farmer', [OrderController::class, 'farmerOrders']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);

    // Reseñas
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

    // Admin
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/users', [AdminController::class, 'getUsers']);
        Route::patch('/users/{id}/role', [AdminController::class, 'updateRole']);
        Route::put('/users/{id}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
        Route::get('/orders', [AdminController::class, 'getAllOrders']);
        Route::patch('/orders/{id}/status', [AdminController::class, 'updateOrderStatus']);
        Route::get('/stats', [AdminController::class, 'getStatistics']);
        Route::get('/farmers', [AdminController::class, 'getFarmers']);
        Route::post('/farmers', [AdminController::class, 'createFarmer']);
        Route::apiResource('/categories', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::get('/categories/all', [CategoryController::class, 'adminIndex']);
        Route::get('/logs', [LogController::class, 'index']);
        Route::get('/logs/stats', [LogController::class, 'stats']);
    });
});
