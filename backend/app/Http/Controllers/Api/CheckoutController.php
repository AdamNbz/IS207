<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Cart;

class CheckoutController extends Controller
{
    public function checkout(Request $request)
    {
        $user = Auth::user();

        // 1. Validate dữ liệu đúng theo các cột trong Migration
        $request->validate([
            'customer_name'    => 'required|string',
            'customer_phone'   => 'required|string|max:20',
            'shipping_address' => 'required|string',
            'city'             => 'required|string|max:100',
            'payment_method'   => 'in:COD,VNPAY,MOMO', // Kiểm tra phương thức thanh toán hợp lệ
            'note'             => 'nullable|string'
        ]);

        // 2. Lấy giỏ hàng
        $cart = Cart::where('user_id', $user->id)->with('items.product')->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['message' => 'Giỏ hàng trống!'], 400);
        }

        // 3. Tính toán tiền nong (Subtotal)
        $subtotal = 0;
        foreach ($cart->items as $item) {
            $subtotal += $item->quantity * $item->product->price;
        }

        // Logic phí ship (Tạm tính bằng 0 hoặc lấy từ request nếu có logic tính ship riêng)
        $shippingFee = 30000; // Ví dụ: Phí ship cố định 30k
        $discount = 0;        // Tạm thời chưa có mã giảm giá
        
        // Tổng tiền cuối cùng
        $totalAmount = $subtotal + $shippingFee - $discount;

        // 4. Bắt đầu Transaction
        DB::beginTransaction();
        try {
            // A. Tạo Đơn hàng (Khớp từng cột với migration của bạn)
            $order = Order::create([
                'user_id'          => $user->id,
                'customer_name'    => $request->customer_name, // Lấy từ form gửi lên
                'customer_phone'   => $request->customer_phone,
                'shipping_address' => $request->shipping_address,
                'city'             => $request->city,
                'note'             => $request->note,
                
                // Các cột về tiền
                'subtotal'        => $subtotal,
                'shipping_fee'    => $shippingFee,
                'discount_amount' => $discount,
                'total_amount'    => $totalAmount,
                
                // Trạng thái và thanh toán
                'payment_method'  => $request->payment_method ?? 'COD',
                'payment_status'  => 'unpaid',
                'status'          => 'pending'
            ]);

            // B. Lưu chi tiết đơn hàng
            // (Lưu ý: Bạn cần kiểm tra xem migration bảng order_details có khớp tên cột không nhé)
            foreach ($cart->items as $item) {
                OrderDetail::create([
                    'order_id'   => $order->id,
                    'product_id' => $item->product_id,
                    'quantity'   => $item->quantity,
                    'price'      => $item->product->price
                ]);
            }

            // C. Xóa giỏ hàng
            $cart->items()->delete();

            DB::commit();
            
            return response()->json([
                'message' => 'Đặt hàng thành công!', 
                'order_id' => $order->id,
                'total' => $totalAmount
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }
}