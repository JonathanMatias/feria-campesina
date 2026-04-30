<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('categories')->insert([
            ['name' => 'Frutas', 'slug' => 'frutas', 'icon' => '🍎', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Verduras', 'slug' => 'verduras', 'icon' => '🥬', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Hortalizas', 'slug' => 'hortalizas', 'icon' => '🥕', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Hierbas', 'slug' => 'hierbas', 'icon' => '🌿', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Frutos Secos', 'slug' => 'frutos-secos', 'icon' => '🥜', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
