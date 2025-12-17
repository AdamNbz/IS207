<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;
    protected $guarded = [];

    // Quan hệ nòng cốt
    public function brand() {
        return $this->belongsTo(Brand::class);
    }

    public function category() {
        return $this->belongsTo(Category::class);
    }

    // Các bảng con
    public function specs() {
        return $this->hasMany(ProductSpec::class);
    }

    public function images() {
        return $this->hasMany(ProductImage::class)->orderBy('display_order');
    }

    public function reviews() {
        return $this->hasMany(Review::class);
    }
    
    // Hàm phụ trợ: Tính điểm sao trung bình (Ví dụ: 4.5 sao)
    public function getAvgRatingAttribute() {
        return round($this->reviews()->avg('rating'), 1);
    }

    // 1. Quan hệ gốc: Một sản phẩm có thể tham gia nhiều đợt khuyến mãi (lịch sử)
    public function promotions()
    {
        return $this->belongsToMany(Promotion::class, 'product_promotion')
                    ->withPivot('discount_amount')
                    ->withTimestamps();
    }

    // 2. Hàm tiện ích: Lấy khuyến mãi ĐANG CHẠY hiện tại (Chỉ lấy 1 cái ưu tiên nhất)
    // Cách dùng: $product->current_promotion
    public function getCurrentPromotionAttribute()
    {
        // Lấy ngày giờ hiện tại
        $now = now();

        return $this->promotions()
                    ->where('is_active', true)
                    ->where('start_date', '<=', $now)
                    ->where('end_date', '>=', $now)
                    ->orderByDesc('discount_percent') // Ưu tiên cái giảm sâu nhất nếu trùng
                    ->first();
    }
}