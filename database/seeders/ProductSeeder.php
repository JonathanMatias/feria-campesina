<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        DB::table('products')->insert([
            [
                'farmer_id' => 2,
                'category_id' => 2,
                'name' => 'Tomates Orgánicos',
                'description' => 'Tomates cultivados sin pesticidas, cosecha fresca',
                'price' => 2500, 'stock' => 50, 'unit' => 'kg',
                'image_url' => null, 'available_saturday' => true, 'available_sunday' => true,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'farmer_id' => 2,
                'category_id' => 2,
                'name' => 'Lechuga Hidropónica',
                'description' => 'Lechuga crujiente, lavada y lista para comer',
                'price' => 1800, 'stock' => 30, 'unit' => 'unidad',
                'image_url' => null, 'available_saturday' => true, 'available_sunday' => true,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'farmer_id' => 2,
                'category_id' => 3,
                'name' => 'Zanahorias Baby',
                'description' => 'Dulces y crocantes, ideal para ensaladas',
                'price' => 2000, 'stock' => 40, 'unit' => 'atado',
                'image_url' => null, 'available_saturday' => true, 'available_sunday' => true,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'farmer_id' => 3,
                'category_id' => 1,
                'name' => 'Manzanas Verdes',
                'description' => 'Variedad Granny Smith, ácidas y crujientes',
                'price' => 3200, 'stock' => 35, 'unit' => 'kg',
                'image_url' => null, 'available_saturday' => true, 'available_sunday' => true,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'farmer_id' => 3,
                'category_id' => 1,
                'name' => 'Frutillas',
                'description' => 'Frutas del bosque, cosechadas al amanecer',
                'price' => 4500, 'stock' => 20, 'unit' => 'bandeja',
                'image_url' => null, 'available_saturday' => true, 'available_sunday' => true,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'farmer_id' => 3,
                'category_id' => 1,
                'name' => 'Paltas Hass',
                'description' => 'Paltas cremosas, punto justo de madurez',
                'price' => 3800, 'stock' => 25, 'unit' => 'kg',
                'image_url' => null, 'available_saturday' => true, 'available_sunday' => true,
                'created_at' => $now, 'updated_at' => $now,
            ],
        ]);
    }
}
