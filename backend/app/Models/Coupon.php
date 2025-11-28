<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;
    protected $guarded = [];
    
    // Cột expires_at là ngày tháng, cần khai báo để Laravel xử lý đúng
    protected $casts = [
        'expires_at' => 'datetime',
    ];
}