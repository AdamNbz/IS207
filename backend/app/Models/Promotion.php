<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    use HasFactory;
    protected $guarded = [];

    // Khai báo quan hệ: 1 CTKM có nhiều sản phẩm
    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_promotion')
                    ->withTimestamps();
    }
}