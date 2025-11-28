<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $guarded = []; // Cho phép sửa mọi cột

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'password' => 'hashed',
    ];

    // Quan hệ
    public function addresses() {
        return $this->hasMany(UserAddress::class);
    }

    public function orders() {
        return $this->hasMany(Order::class);
    }

    public function cart() {
        return $this->hasOne(Cart::class); // Mỗi user 1 giỏ hàng
    }

    public function reviews() {
        return $this->hasMany(Review::class);
    }
}