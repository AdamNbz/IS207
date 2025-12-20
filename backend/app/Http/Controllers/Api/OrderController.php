<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Order;

class OrderController extends Controller
{
   
    // 1. XEM LỊCH SỬ MUA HÀNG (List)
    // Method: GET /orders
    
    public function index()
    {
        // Lấy danh sách đơn hàng của user, sắp xếp mới nhất lên đầu
        $orders = Order::where('user_id', Auth::id())
                        ->orderBy('created_at', 'desc')
                        ->get();

        return response()->json($orders);
    }

    
    // 2. XEM CHI TIẾT ĐƠN HÀNG (Detail)
    // Method: GET /orders/{id}
    
    public function show($id)
    {
        // Tìm đơn hàng theo ID và User ID (để tránh xem trộm đơn người khác)
        $order = Order::where('user_id', Auth::id())
                      ->where('id', $id)
                      // Load mối quan hệ 'details' (trong Model Order) 
                      // và từ details load tiếp 'product' (trong Model OrderDetail)
                      ->with('orderDetails.product') 
                      ->first();

        if (!$order) {
            return response()->json(['message' => 'Không tìm thấy đơn hàng'], 404);
        }

        return response()->json($order);
    }

   
    // 3. HỦY ĐƠN HÀNG
    // Method: POST /orders/cancel/{id}
    
    public function cancel($id)
    {
        $order = Order::where('user_id', Auth::id())
                      ->where('id', $id)
                      ->first();

        if (!$order) {
            return response()->json(['message' => 'Không tìm thấy đơn hàng'], 404);
        }

        // Kiểm tra trạng thái: Chỉ cho hủy khi đang 'pending'
        // (Khớp với cột 'status' mặc định trong migration orders bạn gửi)
        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Đơn hàng đang xử lý hoặc đã giao, không thể hủy!'], 400);
        }

        // Cập nhật trạng thái thành 'cancelled'
        $order->status = 'cancelled';
        $order->save();

        return response()->json(['message' => 'Đã hủy đơn hàng thành công']);
    }
}