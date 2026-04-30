<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\ActivityLog;
use App\Http\Controllers\Controller;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'sometimes|in:cliente,agricultor',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->hasFile('avatar')) {
            $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'] ?? 'cliente',
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'avatar' => $validated['avatar'] ?? null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        Log::info('Usuario registrado', ['user_id' => $user->id, 'email' => $user->email, 'role' => $user->role]);
        ActivityLog::log('registro', "{$user->name} se registró como {$user->role}", ['email' => $user->email, 'role' => $user->role]);

        return response()->json([
            'user' => $user->load('products'),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            Log::warning('Intento de login fallido', ['email' => $validated['email']]);
            ActivityLog::log('login_fallido', "Intento de inicio de sesión fallido para {$validated['email']}", ['email' => $validated['email']], 'warning');
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        Log::info('Usuario logueado', ['user_id' => $user->id, 'email' => $user->email, 'role' => $user->role]);
        ActivityLog::log('login', "{$user->name} inició sesión");

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        $request->user()->currentAccessToken()->delete();

        Log::info('Usuario cerró sesión', ['user_id' => $user->id, 'email' => $user->email]);
        ActivityLog::log('logout', "{$user->name} cerró sesión");

        return response()->json(['message' => 'Sesión cerrada exitosamente']);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
