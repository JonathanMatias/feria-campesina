<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('users');
            $table->decimal('total', 10, 2);
            $table->string('status')->default('pendiente'); // pendiente, confirmado, en_reparto, entregado, cancelado
            $table->string('payment_method'); // transferencia, contra_entrega
            $table->date('delivery_date');
            $table->text('delivery_address');
            $table->string('customer_phone', 20)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
