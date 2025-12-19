<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Cart;
use App\Models\CartItem; // Nhớ import model CartItem

class CheckoutController extends Controller
{
    public function checkout(Request $request)
    {
        $user = Auth::user();

        // 1. Validate
        $request->validate([
            'customer_name'    => 'required|string',
            'customer_phone'   => 'required|string|max:20',
            'shipping_address' => 'required|string',
            'city'             => 'required|string|max:100',
            'payment_method'   => 'in:COD,VNPAY,MOMO',
            'note'             => 'nullable|string',
            // 👉 MỚI: Bắt buộc phải có mảng chứa ID các sản phẩm được chọn
            'selected_product_ids' => 'required|array|min:1', 
            'selected_product_ids.*' => 'integer|exists:products,id'
        ]);

        // 2. Lấy giỏ hàng của User
        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart) {
            return response()->json(['message' => 'Giỏ hàng không tồn tại!'], 400);
        }

        // 👉 MỚI: Chỉ lấy những CartItem nào có product_id nằm trong danh sách gửi lên
        $selectedItems = $cart->items()
                              ->whereIn('product_id', $request->selected_product_ids)
                              ->with('product')
                              ->get();

        if ($selectedItems->isEmpty()) {
            return response()->json(['message' => 'Không tìm thấy sản phẩm nào được chọn trong giỏ hàng!'], 400);
        }

        // 3. Tính toán tiền (Chỉ tính trên items đã lọc)
        $subtotal = 0;
        foreach ($selectedItems as $item) {
            $subtotal += $item->quantity * $item->product->price;
        }

        $shippingFee = 30000;
        $discount = 0;
        $totalAmount = $subtotal + $shippingFee - $discount;

        // 4. Transaction
        DB::beginTransaction();
        try {
            // A. Tạo Order
            $order = Order::create([
                'user_id'          => $user->id,
                'customer_name'    => $request->customer_name,
                'customer_phone'   => $request->customer_phone,
                'shipping_address' => $request->shipping_address,
                'city'             => $request->city,
                'note'             => $request->note,
                'subtotal'         => $subtotal,
                'shipping_fee'     => $shippingFee,
                'discount_amount'  => $discount,
                'total_amount'     => $totalAmount,
                'payment_method'   => $request->payment_method ?? 'COD',
                'payment_status'   => 'unpaid',
                'status'           => 'pending'
            ]);

            // B. Tạo Order Details (Chỉ lưu những món đã chọn)
            foreach ($selectedItems as $item) {
                OrderDetail::create([
                    'order_id'   => $order->id,
                    'product_id' => $item->product_id,
                    'quantity'   => $item->quantity,
                    'price'      => $item->product->price
                ]);
            }

            // C. 👉 QUAN TRỌNG: Chỉ xóa những sản phẩm ĐÃ MUA khỏi giỏ hàng
            // (Không dùng $cart->items()->delete() vì nó xóa sạch sành sanh)
            CartItem::where('cart_id', $cart->id)
                    ->whereIn('product_id', $request->selected_product_ids)
                    ->delete();

            DB::commit();
            
            return response()->json([
                'message'  => 'Đặt hàng thành công!', 
                'order_id' => $order->id,
                'total'    => $totalAmount
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }
}