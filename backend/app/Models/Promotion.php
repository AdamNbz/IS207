<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    use HasFactory;

    protected $guarded = []; // Cho phép sửa mọi cột (name, discount_percent...)

    // Mối quan hệ: Một Khuyến mãi áp dụng cho nhiều Sản phẩm
    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_promotion')
                    ->withPivot('discount_amount') // Lấy thêm cột giá giảm riêng (nếu có)
                    ->withTimestamps();
    }
}