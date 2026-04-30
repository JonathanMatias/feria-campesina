<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        DB::table('users')->insert([
            [
                'name' => 'Super Admin',
                'email' => 'admin@feriacampesina.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phone' => '999999999',
                'address' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Don Juan Pérez',
                'email' => 'juan@huerto.cl',
                'password' => Hash::make('password'),
                'role' => 'agricultor',
                'phone' => '912345678',
                'address' => 'Camino a Lonquén 123',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Doña María González',
                'email' => 'maria@organica.cl',
                'password' => Hash::make('password'),
                'role' => 'agricultor',
                'phone' => '987654321',
                'address' => 'Valle de la Luna s/n',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Cliente de Prueba',
                'email' => 'cliente@test.cl',
                'password' => Hash::make('password'),
                'role' => 'cliente',
                'phone' => '911223344',
                'address' => 'Av. Siempre Viva 742',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }
}
