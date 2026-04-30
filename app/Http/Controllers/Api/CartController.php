<?php

namespace App\Http\Controllers\Api;

use App\Models\Product;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;

class CartController extends Controller
{
    public function add(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|numeric|min:0.1',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        if ($product->stock < $validated['quantity']) {
            Log::warning('Stock insuficiente al agregar al carrito', ['product_id' => $product->id, 'requested' => $validated['quantity'], 'available' => $product->stock, 'user_id' => $request->user()->id]);
            ActivityLog::log('stock_insuficiente_carrito', "Stock insuficiente al agregar al carrito: {$product->name} — solicitado: {$validated['quantity']}, disponible: {$product->stock}", [], 'warning');
            return response()->json(['message' => 'Stock insuficiente. Stock disponible: ' . $product->stock], 422);
        }

        $cart = session()->get('cart', []);

        $existingIndex = $this->findCartItem($cart, $product->id);

        if ($existingIndex !== null) {
            $newQuantity = $cart[$existingIndex]['quantity'] + $validated['quantity'];
            if ($product->stock < $newQuantity) {
                Log::warning('Stock insuficiente al actualizar carrito (acumulado)', ['product_id' => $product->id, 'requested_total' => $newQuantity, 'available' => $product->stock, 'user_id' => $request->user()->id]);
                ActivityLog::log('stock_insuficiente_carrito', "Stock insuficiente al actualizar carrito (acumulado): {$product->name} — solicitado: {$newQuantity}, disponible: {$product->stock}", [], 'warning');
                return response()->json(['message' => 'Stock insuficiente. Stock disponible: ' . $product->stock], 422);
            }
            $cart[$existingIndex]['quantity'] = $newQuantity;
        } else {
            $cart[] = [
                'product_id' => $product->id,
                'name' => $product->name,
                'price' => $product->price,
                'unit' => $product->unit,
                'quantity' => $validated['quantity'],
                'farmer_id' => $product->farmer_id,
                'farmer_name' => $product->farmer->name ?? 'Desconocido',
            ];
        }

        session()->put('cart', $cart);

        Log::info('Producto agregado al carrito', ['product_id' => $product->id, 'quantity' => $validated['quantity'], 'user_id' => $request->user()->id]);
        ActivityLog::log('agregar_carrito', "Producto agregado al carrito: {$product->name} — cantidad: {$validated['quantity']}", [], 'info');

        return response()->json(['cart' => $cart, 'message' => 'Producto agregado al carrito']);
    }

    public function getCart()
    {
        $cart = session()->get('cart', []);
        $total = collect($cart)->sum(function ($item) {
            return $item['price'] * $item['quantity'];
        });

        return response()->json(['items' => $cart, 'total' => round($total, 2)]);
    }

    public function updateQuantity(Request $request, $index)
    {
        $cart = session()->get('cart', []);

        if (!isset($cart[$index])) {
            Log::warning('Item de carrito no encontrado para actualizar', ['index' => $index, 'user_id' => $request->user()->id]);
            ActivityLog::log('actualizar_carrito', "Ítem de carrito no encontrado para actualizar — índice: {$index}", [], 'warning');
            return response()->json(['message' => 'Item no encontrado'], 404);
        }

        $validated = $request->validate([
            'quantity' => 'required|numeric|min:0.1',
        ]);

        $product = Product::find($cart[$index]['product_id']);

        if ($product && $product->stock < $validated['quantity']) {
            Log::warning('Stock insuficiente al actualizar cantidad en carrito', ['product_id' => $product->id, 'requested' => $validated['quantity'], 'available' => $product->stock, 'user_id' => $request->user()->id]);
            ActivityLog::log('stock_insuficiente_carrito', "Stock insuficiente al actualizar carrito: {$product->name} — solicitado: {$validated['quantity']}, disponible: {$product->stock}", [], 'warning');
            return response()->json(['message' => 'Stock insuficiente. Stock disponible: ' . $product->stock], 422);
        }

        $cart[$index]['quantity'] = $validated['quantity'];
        session()->put('cart', $cart);

        Log::info('Cantidad en carrito actualizada', ['index' => $index, 'product_id' => $cart[$index]['product_id'], 'quantity' => $validated['quantity'], 'user_id' => $request->user()->id]);
        ActivityLog::log('actualizar_carrito', "Cantidad en carrito actualizada — producto #{$cart[$index]['product_id']}, nueva cantidad: {$validated['quantity']}", [], 'info');

        return response()->json(['cart' => $cart]);
    }

    public function remove($index)
    {
        $cart = session()->get('cart', []);

        if (isset($cart[$index])) {
            $removedProductId = $cart[$index]['product_id'] ?? null;
            array_splice($cart, $index, 1);
            session()->put('cart', $cart);
            Log::info('Producto eliminado del carrito', ['index' => $index, 'product_id' => $removedProductId]);
            ActivityLog::log('eliminar_carrito', "Producto eliminado del carrito — índice: {$index}, producto #{$removedProductId}", [], 'info');
        }

        return response()->json(['cart' => $cart]);
    }

    private function findCartItem($cart, $productId)
    {
        foreach ($cart as $index => $item) {
            if ($item['product_id'] == $productId) {
                return $index;
            }
        }
        return null;
    }
}
