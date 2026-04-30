<?php

namespace App\Http\Controllers\Api;

use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;

class ReviewController extends Controller
{
    public function farmerReviews($farmerId)
    {
        $reviews = Review::with('user:id,name,avatar')
            ->where('farmer_id', $farmerId)
            ->orderBy('created_at', 'desc')
            ->get();

        $avg = $reviews->avg('rating');

        return response()->json([
            'reviews' => $reviews,
            'average' => round($avg, 1),
            'count' => $reviews->count(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'farmer_id' => 'required|exists:users,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:3|max:500',
        ]);

        $exists = Review::where('user_id', $request->user()->id)
            ->where('farmer_id', $validated['farmer_id'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Ya has dejado un comentario a este agricultor'], 422);
        }

        $review = Review::create([
            'user_id' => $request->user()->id,
            'farmer_id' => $validated['farmer_id'],
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
        ]);

        $review->load('user:id,name,avatar');

        Log::info('Reseña creada', ['review_id' => $review->id, 'user_id' => $review->user_id, 'farmer_id' => $review->farmer_id]);

        return response()->json($review, 201);
    }

    public function destroy($id)
    {
        $review = Review::findOrFail($id);

        if ($review->user_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $review->delete();

        return response()->json(['message' => 'Reseña eliminada']);
    }
}
