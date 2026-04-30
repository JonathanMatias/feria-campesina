<?php

namespace App\Http\Controllers\Api;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class LogController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::with('user:id,name,email')
            ->orderBy('created_at', 'desc');

        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        if ($request->has('level')) {
            $query->where('level', $request->level);
        }

        return response()->json($query->paginate(25));
    }

    public function stats()
    {
        $actions = ActivityLog::selectRaw('action, count(*) as count')
            ->groupBy('action')
            ->orderByDesc('count')
            ->get();

        $total = ActivityLog::count();
        $today = ActivityLog::whereDate('created_at', today())->count();

        return response()->json([
            'total' => $total,
            'today' => $today,
            'actions' => $actions,
        ]);
    }
}
