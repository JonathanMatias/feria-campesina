<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use App\Models\ActivityLog;
use App\Models\OrderStatusLog;

class AdminController extends Controller
{
    public function getUsers()
    {
        $users = User::select('id', 'name', 'email', 'role', 'phone', 'address', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($users);
    }

    public function updateRole(Request $request, $id)
    {
        $validated = $request->validate([
            'role' => 'required|in:admin,agricultor,cliente',
        ]);

        $user = User::findOrFail($id);
        $oldRole = $user->role;
        $user->update(['role' => $validated['role']]);

        Log::info('Rol de usuario cambiado por admin', ['target_user_id' => $user->id, 'old_role' => $oldRole, 'new_role' => $validated['role'], 'admin_id' => auth()->id()]);
        ActivityLog::log('cambiar_rol', "Rol de {$user->name} cambiado de {$oldRole} a {$validated['role']}", ['target_user_id' => $user->id, 'old_role' => $oldRole, 'new_role' => $validated['role'], 'admin_id' => auth()->id()], 'info');

        return response()->json($user);
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);

        if ($user->id === auth()->id()) {
            Log::warning('Admin intentó eliminar su propia cuenta', ['user_id' => auth()->id()]);
            ActivityLog::log('eliminar_usuario', 'Admin intentó eliminar su propia cuenta', ['user_id' => auth()->id()], 'warning');
            return response()->json(['message' => 'No puedes eliminar tu propia cuenta'], 422);
        }

        $user->delete();

        Log::info('Usuario eliminado por admin', ['deleted_user_id' => (int) $id, 'deleted_email' => $user->email, 'admin_id' => auth()->id()]);
        ActivityLog::log('eliminar_usuario', "Usuario {$user->email} eliminado", ['deleted_user_id' => (int) $id, 'admin_id' => auth()->id()], 'info');

        return response()->json(['message' => 'Usuario eliminado']);
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'role' => 'sometimes|in:admin,agricultor,cliente',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'maps_url' => 'nullable|url|max:500',
        ]);

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $data = collect($validated)->except(['password', 'avatar'])->filter()->toArray();
        if (isset($validated['avatar'])) $data['avatar'] = $validated['avatar'];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($validated['password']);
        }

        $user->update($data);

        Log::info('Usuario actualizado por admin', ['user_id' => $user->id, 'fields' => array_keys($data), 'admin_id' => auth()->id()]);
        ActivityLog::log('editar_usuario', "Usuario {$user->name} actualizado", ['user_id' => $user->id, 'fields' => array_keys($data), 'admin_id' => auth()->id()], 'info');

        return response()->json($user);
    }

    public function getAllOrders()
    {
        $orders = Order::with(['items.product', 'items.farmer', 'customer', 'statusLogs.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    public function updateOrderStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pendiente,confirmado,en_reparto,entregado,cancelado',
        ]);

        $order = Order::findOrFail($id);

        $transitions = [
            'pendiente'   => ['confirmado', 'cancelado'],
            'confirmado'  => ['en_reparto', 'cancelado'],
            'en_reparto'  => ['entregado'],
            'entregado'   => [],
            'cancelado'   => [],
        ];

        if (!in_array($validated['status'], $transitions[$order->status] ?? [])) {
            return response()->json([
                'message' => "No se puede cambiar de {$order->status} a {$validated['status']}"
            ], 422);
        }

        $oldStatus = $order->status;
        $order->update(['status' => $validated['status']]);

        OrderStatusLog::create([
            'order_id' => $order->id,
            'user_id' => auth()->id(),
            'old_status' => $oldStatus,
            'new_status' => $validated['status'],
        ]);

        Log::info('Estado de pedido actualizado por admin', ['order_id' => $order->id, 'old_status' => $oldStatus, 'new_status' => $validated['status'], 'admin_id' => auth()->id()]);
        ActivityLog::log('cambiar_estado_pedido_admin', "Pedido #{$order->id} de {$oldStatus} a {$validated['status']}", ['order_id' => $order->id, 'admin_id' => auth()->id()], 'info');

        return response()->json($order);
    }

    public function getStatistics()
    {
        $totalOrders = Order::count();
        $totalRevenue = Order::whereIn('status', ['pendiente', 'confirmado', 'en_reparto', 'entregado'])
            ->sum('total');
        $totalProducts = Product::count();
        $totalFarmers = User::where('role', 'agricultor')->count();
        $totalClients = User::where('role', 'cliente')->count();
        $ordersByStatus = Order::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        $topProducts = DB::table('order_items')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->select('products.name', DB::raw('SUM(order_items.quantity) as total_quantity'), DB::raw('SUM(order_items.subtotal) as total_revenue'))
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_quantity')
            ->limit(10)
            ->get();

        return response()->json([
            'total_orders' => $totalOrders,
            'total_revenue' => $totalRevenue,
            'total_products' => $totalProducts,
            'total_farmers' => $totalFarmers,
            'total_clients' => $totalClients,
            'orders_by_status' => $ordersByStatus,
            'top_products' => $topProducts,
        ]);
    }

    public function getFarmers()
    {
        $farmers = User::where('role', 'agricultor')
            ->with('products')
            ->get();

        return response()->json($farmers);
    }

    public function createFarmer(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
        ]);

        $farmer = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'agricultor',
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
        ]);

        Log::info('Agricultor creado por admin', ['farmer_id' => $farmer->id, 'email' => $farmer->email, 'admin_id' => auth()->id()]);
        ActivityLog::log('crear_agricultor', "Agricultor {$farmer->name} creado", ['farmer_id' => $farmer->id, 'admin_id' => auth()->id()], 'info');

        return response()->json($farmer, 201);
    }
}
