<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;

class CartController extends Controller
{
    // 1. Hàm xem giỏ hàng (GET /api/cart)
    public function index(Request $request)
    {
        // Lấy user đang đăng nhập (nhờ middleware auth:sanctum)
        $user = $request->user(); 

        // Tìm giỏ hàng của user đó
        $cart = Cart::where('user_id', $user->id)->first();

        // Nếu chưa có giỏ thì trả về mảng rỗng
        if (!$cart) {
            return response()->json(['items' => []]);
        }

        // Nếu có giỏ, lấy chi tiết các món bên trong + thông tin sản phẩm
        // 'items.product' nghĩa là: Từ Cart -> lấy Items -> lấy tiếp Product của item đó
        $cart->load('items.product');

        return response()->json($cart);
    }

    // 2. Hàm thêm vào giỏ (POST /api/cart/add)
    public function addToCart(Request $request)
    {
        // Validate dữ liệu gửi lên
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        $user = $request->user();

        // Bước 1: Tìm xem user đã có giỏ hàng chưa, chưa thì tạo mới
        $cart = Cart::firstOrCreate([
            'user_id' => $user->id
        ]);

        // Bước 2: Kiểm tra xem sản phẩm này đã có trong giỏ chưa
        $cartItem = CartItem::where('cart_id', $cart->id)
                            ->where('product_id', $request->product_id)
                            ->first();

        if ($cartItem) {
            // Trường hợp A: Đã có -> Cộng dồn số lượng
            $cartItem->quantity += $request->quantity;
            $cartItem->save();
        } else {
            // Trường hợp B: Chưa có -> Tạo món mới trong giỏ
            CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity
            ]);
        }

        return response()->json([
            'message' => 'Đã thêm sản phẩm vào giỏ hàng',
            'status' => 200
        ]);
    }
}