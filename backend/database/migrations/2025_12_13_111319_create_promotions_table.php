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
    {// Bảng lưu thông tin đợt khuyến mãi
    Schema::create('promotions', function (Blueprint $table) {
        $table->id();
        $table->string('name'); // Tên chương trình (VD: Black Friday)
        $table->string('description')->nullable();
        $table->decimal('discount_percent', 5, 2); // Giảm bao nhiêu %
        $table->dateTime('start_date');
        $table->dateTime('end_date');
        $table->timestamps();
    });

    // Bảng trung gian để nối Product và Promotion (Quan hệ nhiều-nhiều)
    Schema::create('product_promotion', function (Blueprint $table) {
        $table->id();
        $table->foreignId('promotion_id')->constrained()->onDelete('cascade');
        $table->foreignId('product_id')->constrained()->onDelete('cascade');
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
