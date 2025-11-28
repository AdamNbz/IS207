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
}