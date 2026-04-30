<?php

namespace App\Http\Controllers\Api;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['farmer:id,name,phone,avatar,maps_url', 'category:id,name,slug', 'images']);

        $user = $request->user() ?? auth('sanctum')->user();

        $isAdmin = $user && $user->role === 'admin';
        $isOwner = $user && $user->role === 'agricultor' && $request->has('farmer_id') && $request->farmer_id == $user->id;

        $showAll = $request->has('show_all') && ($isAdmin || $isOwner);

        if (!$showAll) {
            $query->where('active', true)->where('stock', '>', 0);
        }

        if ($request->has('farmer_id')) {
            $query->where('farmer_id', $request->farmer_id);
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $products = $query->orderBy('created_at', 'desc')->paginate(12);

        return response()->json($products);
    }

    public function show($id)
    {
        $product = Product::with(['farmer:id,name,phone,address,avatar,maps_url', 'category:id,name,slug', 'images'])->findOrFail($id);
        return response()->json($product);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'unit' => 'sometimes|string|max:50',
            'available_saturday' => 'boolean',
            'available_sunday' => 'boolean',
            'category_id' => 'nullable|exists:categories,id',
            'active' => 'boolean',
            'images' => 'sometimes|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $validated['farmer_id'] = $request->user()->id;
        unset($validated['images']);

        $product = Product::create($validated);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $i => $file) {
                $path = $file->store('products', 'public');
                $product->images()->create([
                    'path' => $path,
                    'order' => $i,
                ]);
            }
        }

        $product->load('images');

        Log::info('Producto creado', ['product_id' => $product->id, 'user_id' => $request->user()->id, 'name' => $product->name, 'images_count' => $product->images->count()]);
        ActivityLog::log('crear_producto', "{$product->name} — \${$product->price}");

        return response()->json($product, 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        if ($product->farmer_id !== $request->user()->id && $request->user()->role !== 'admin') {
            Log::warning('Intento no autorizado de actualizar producto', ['product_id' => (int) $id, 'user_id' => $request->user()->id, 'role' => $request->user()->role]);
            ActivityLog::log('acceso_no_autorizado', "Intento no autorizado de editar producto #{$id}");
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'unit' => 'sometimes|string|max:50',
            'available_saturday' => 'boolean',
            'available_sunday' => 'boolean',
            'category_id' => 'nullable|exists:categories,id',
            'images' => 'sometimes|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
            'delete_images' => 'sometimes|array',
            'delete_images.*' => 'integer|exists:product_images,id',
            'active' => 'boolean',
        ]);

        unset($validated['images'], $validated['delete_images']);

        $product->update($validated);

        if ($request->has('delete_images')) {
            $images = $product->images()->whereIn('id', $request->delete_images)->get();
            foreach ($images as $img) {
                Storage::disk('public')->delete($img->path);
                $img->delete();
            }
        }

        if ($request->hasFile('images')) {
            $maxOrder = $product->images()->max('order') ?? -1;
            foreach ($request->file('images') as $i => $file) {
                $path = $file->store('products', 'public');
                $product->images()->create([
                    'path' => $path,
                    'order' => $maxOrder + $i + 1,
                ]);
            }
        }

        $product->load('images');

        Log::info('Producto actualizado', ['product_id' => $product->id, 'user_id' => $request->user()->id]);
        ActivityLog::log('editar_producto', "{$product->name} actualizado");

        return response()->json($product);
    }

    public function destroy(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        if ($product->farmer_id !== $request->user()->id && $request->user()->role !== 'admin') {
            Log::warning('Intento no autorizado de eliminar producto', ['product_id' => (int) $id, 'user_id' => $request->user()->id, 'role' => $request->user()->role]);
            ActivityLog::log('acceso_no_autorizado', "Intento no autorizado de eliminar producto #{$id}");
            return response()->json(['message' => 'No autorizado'], 403);
        }

        foreach ($product->images as $img) {
            Storage::disk('public')->delete($img->path);
        }

        $product->delete();

        Log::info('Producto eliminado', ['product_id' => (int) $id, 'user_id' => $request->user()->id]);
        ActivityLog::log('eliminar_producto', "{$product->name} eliminado");

        return response()->json(['message' => 'Producto eliminado']);
    }

    public function updateStock(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        if ($product->farmer_id !== $request->user()->id && $request->user()->role !== 'admin') {
            Log::warning('Intento no autorizado de actualizar stock', ['product_id' => (int) $id, 'user_id' => $request->user()->id, 'role' => $request->user()->role]);
            ActivityLog::log('acceso_no_autorizado', "Intento no autorizado de actualizar stock del producto #{$id}");
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'stock' => 'required|integer|min:0',
        ]);

        $oldStock = $product->stock;
        $product->update(['stock' => $validated['stock']]);

        Log::info('Stock de producto actualizado', ['product_id' => $product->id, 'old_stock' => $oldStock, 'new_stock' => $validated['stock'], 'user_id' => $request->user()->id]);
        ActivityLog::log('actualizar_stock', "Stock de {$product->name} actualizado de {$oldStock} a {$validated['stock']}");

        return response()->json($product);
    }
}
