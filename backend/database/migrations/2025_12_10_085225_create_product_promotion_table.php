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
        Schema::create('product_promotion', function (Blueprint $table) {
            $table->id();

            // Khóa ngoại trỏ đến bảng products
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');

            // Khóa ngoại trỏ đến bảng promotions
            $table->foreignId('promotion_id')->constrained('promotions')->onDelete('cascade');

            // (Tùy chọn) Giá giảm riêng cho sản phẩm này trong đợt này 
            // (Nếu null thì lấy theo % chung của promotion)
            $table->decimal('discount_amount', 10, 2)->nullable(); 

            $table->timestamps();

            // Đảm bảo 1 sản phẩm không bị thêm 2 lần vào cùng 1 chương trình
            $table->unique(['product_id', 'promotion_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_promotion');
    }
};
