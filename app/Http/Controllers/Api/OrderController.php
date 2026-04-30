<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use App\Models\Product;
use App\Models\OrderItem;
use App\Models\ActivityLog;
use App\Models\OrderStatusLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Carbon\Carbon;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::with(['items.product', 'items.farmer', 'statusLogs.user'])
            ->where('customer_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'payment_method' => 'required|in:transferencia,contra_entrega',
            'delivery_date' => 'required|date',
            'delivery_address' => 'required|string',
            'customer_phone' => 'nullable|string|max:20',
            'cart_items' => 'required|array|min:1',
            'cart_items.*.product_id' => 'required|exists:products,id',
            'cart_items.*.quantity' => 'required|numeric|min:0.1',
        ]);

        $deliveryDate = Carbon::parse($validated['delivery_date']);

        if ($deliveryDate->isPast() || $deliveryDate->isToday()) {
            Log::warning('Fecha de entrega inválida (pasado o hoy)', ['delivery_date' => $validated['delivery_date'], 'user_id' => $request->user()->id]);
            ActivityLog::log('fecha_invalida', "Fecha de entrega inválida (pasada o de hoy): {$validated['delivery_date']}", [], 'warning');
            return response()->json(['message' => 'La fecha de entrega debe ser un día futuro (sábado o domingo).'], 422);
        }

        $dayOfWeek = $deliveryDate->dayOfWeek;
        if ($dayOfWeek !== Carbon::SATURDAY && $dayOfWeek !== Carbon::SUNDAY) {
            Log::warning('Fecha de entrega no es fin de semana', ['delivery_date' => $validated['delivery_date'], 'day_of_week' => $dayOfWeek, 'user_id' => $request->user()->id]);
            ActivityLog::log('fecha_invalida', "Fecha de entrega no es fin de semana: {$validated['delivery_date']}", [], 'warning');
            return response()->json(['message' => 'La fecha de entrega debe ser sábado o domingo.'], 422);
        }

        return DB::transaction(function () use ($validated, $request) {
            $cartItems = $validated['cart_items'];
            $total = 0;
            $orderItems = [];

            foreach ($cartItems as $item) {
                $product = Product::findOrFail($item['product_id']);

                if ($product->stock < $item['quantity']) {
                    Log::warning('Stock insuficiente al crear pedido', ['product_id' => $product->id, 'product_name' => $product->name, 'requested' => $item['quantity'], 'available' => $product->stock, 'user_id' => $request->user()->id]);
                    ActivityLog::log('stock_insuficiente_pedido', "Stock insuficiente al crear pedido: {$product->name} — solicitado: {$item['quantity']}, disponible: {$product->stock}", [], 'warning');
                    throw new \Exception("Stock insuficiente para: {$product->name}. Disponible: {$product->stock}");
                }

                $subtotal = $product->price * $item['quantity'];
                $total += $subtotal;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'farmer_id' => $product->farmer_id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->price,
                    'subtotal' => $subtotal,
                ];

                $product->decrement('stock', $item['quantity']);
            }

            $order = Order::create([
                'customer_id' => $request->user()->id,
                'total' => round($total, 2),
                'status' => 'pendiente',
                'payment_method' => $validated['payment_method'],
                'delivery_date' => $validated['delivery_date'],
                'delivery_address' => $validated['delivery_address'],
                'customer_phone' => $validated['customer_phone'] ?? $request->user()->phone,
            ]);

            foreach ($orderItems as $item) {
                $item['order_id'] = $order->id;
                OrderItem::create($item);
            }

            OrderStatusLog::create([
                'order_id' => $order->id,
                'user_id' => $request->user()->id,
                'old_status' => null,
                'new_status' => 'pendiente',
            ]);

            session()->forget('cart');

            Log::info('Pedido creado', ['order_id' => $order->id, 'user_id' => $request->user()->id, 'total' => $order->total, 'items_count' => count($orderItems), 'status' => $order->status]);
            ActivityLog::log('crear_pedido', "Pedido #{$order->id} — \${$order->total} — {$validated['payment_method']}");

            $order->load(['items.product', 'items.farmer']);

            return response()->json(['order' => $order, 'message' => 'Pedido creado exitosamente'], 201);
        });
    }

    public function show($id)
    {
        $order = Order::with(['items.product', 'items.farmer', 'customer', 'statusLogs.user'])
            ->findOrFail($id);

        $user = request()->user();

        $isOwner = $order->customer_id === $user->id;
        $isFarmer = $order->items->contains('farmer_id', $user->id);
        $isAdmin = $user->role === 'admin';

        if (!$isOwner && !$isFarmer && !$isAdmin) {
            Log::warning('Intento no autorizado de ver pedido', ['order_id' => (int) $id, 'user_id' => $user->id, 'role' => $user->role]);
            ActivityLog::log('acceso_no_autorizado', "Intento no autorizado de ver pedido #{$id}", [], 'warning');
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json($order);
    }

    public function farmerOrders(Request $request)
    {
        $farmerId = $request->user()->id;

        $orderIds = OrderItem::where('farmer_id', $farmerId)->pluck('order_id')->unique();

        $orders = Order::with(['items' => function ($query) use ($farmerId) {
            $query->where('farmer_id', $farmerId)->with('product');
        }, 'customer:id,name,phone,address', 'statusLogs.user'])
            ->whereIn('id', $orderIds)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $user = $request->user();

        $isFarmerRelated = $order->items()->where('farmer_id', $user->id)->exists();
        $isAdmin = $user->role === 'admin';

        if (!$isFarmerRelated && !$isAdmin) {
            Log::warning('Intento no autorizado de cambiar estado de pedido', ['order_id' => (int) $id, 'user_id' => $user->id, 'role' => $user->role]);
            ActivityLog::log('acceso_no_autorizado', "Intento no autorizado de cambiar estado de pedido #{$id}", [], 'warning');
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pendiente,confirmado,en_reparto,entregado,cancelado',
        ]);

        if (!$this->isValidTransition($order->status, $validated['status'])) {
            return response()->json([
                'message' => "No se puede cambiar de {$order->status} a {$validated['status']}"
            ], 422);
        }

        $oldStatus = $order->status;
        $order->update(['status' => $validated['status']]);

        OrderStatusLog::create([
            'order_id' => $order->id,
            'user_id' => $user->id,
            'old_status' => $oldStatus,
            'new_status' => $validated['status'],
        ]);

        Log::info('Estado de pedido actualizado', ['order_id' => $order->id, 'old_status' => $oldStatus, 'new_status' => $validated['status'], 'user_id' => $user->id, 'role' => $user->role]);
        ActivityLog::log('cambiar_estado_pedido', "Estado de pedido #{$order->id} cambiado de {$oldStatus} a {$validated['status']}", [], 'info');

        return response()->json($order);
    }

    private function isValidTransition($from, $to)
    {
        $transitions = [
            'pendiente'   => ['confirmado', 'cancelado'],
            'confirmado'  => ['en_reparto', 'cancelado'],
            'en_reparto'  => ['entregado'],
            'entregado'   => [],
            'cancelado'   => [],
        ];

        return in_array($to, $transitions[$from] ?? []);
    }
}
