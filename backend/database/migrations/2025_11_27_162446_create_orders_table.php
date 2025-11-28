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
        // Nếu xóa user thì set null để giữ lịch sử đơn hàng
        $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
        
        $table->string('customer_name');
        $table->string('customer_phone', 20);
        $table->string('shipping_address');
        $table->string('city', 100);
        $table->text('note')->nullable();
        
        $table->decimal('subtotal', 15, 2);
        $table->decimal('shipping_fee', 15, 2)->default(0);
        $table->decimal('discount_amount', 15, 2)->default(0);
        $table->decimal('total_amount', 15, 2);
        $table->string('coupon_code', 50)->nullable();
        
        $table->string('payment_method', 50)->default('COD');
        $table->string('payment_status', 50)->default('unpaid');
        $table->string('status', 50)->default('pending');
        
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
