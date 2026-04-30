<?php

namespace App\Http\Controllers\Api;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(Category::where('active', true)->orderBy('name')->get());
    }

    public function adminIndex()
    {
        return response()->json(Category::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:categories',
            'active' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $validated['icon'] = $request->icon;

        $category = Category::create($validated);

        Log::info('Categoría creada', ['category_id' => $category->id, 'name' => $category->name, 'user_id' => auth()->id()]);
        ActivityLog::log('crear_categoria', "Categoría {$category->name} creada", ['category_id' => $category->id], 'info');

        return response()->json($category, 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100|unique:categories,name,' . $id,
            'active' => 'boolean',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        if ($request->has('icon')) {
            $validated['icon'] = $request->icon;
        }

        $category->update($validated);

        Log::info('Categoría actualizada', ['category_id' => $category->id, 'name' => $category->name, 'user_id' => auth()->id()]);
        ActivityLog::log('editar_categoria', "Categoría {$category->name} actualizada", ['category_id' => $category->id], 'info');

        return response()->json($category);
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        Log::info('Categoría eliminada', ['category_id' => (int) $id, 'user_id' => auth()->id()]);
        ActivityLog::log('eliminar_categoria', "Categoría #{$id} eliminada", [], 'info');

        return response()->json(['message' => 'Categoría eliminada']);
    }
}
