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
    Schema::create('products', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('slug')->unique();
        $table->string('sku', 100)->unique()->nullable();
        
        $table->foreignId('brand_id')->constrained('brands')->onDelete('cascade');
        $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
        
        $table->decimal('price', 15, 2);
        $table->decimal('old_price', 15, 2)->nullable();
        $table->integer('stock')->default(0);
        
        $table->text('thumbnail')->nullable();
        $table->text('description')->nullable();
        $table->longText('content')->nullable();
        
        $table->boolean('is_active')->default(true);
        $table->boolean('is_featured')->default(false);
        $table->integer('view_count')->default(0);
        
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
