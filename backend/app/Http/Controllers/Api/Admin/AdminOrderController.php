<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;

class AdminOrderController extends Controller
{
    /**
     * GET /api/admin/orders
     * Xem danh sách đơn hàng (kèm bộ lọc)
     */
    public function index(Request $request)
    {
        // Khởi tạo query
        $query = Order::with('user'); // Load sẵn thông tin người mua để hiển thị tên

        // 1. Lọc theo trạng thái (status)
        // Ví dụ: ?status=pending
        if ($request->has('status') && $request->status != null) {
            $query->where('status', $request->status);
        }

        // 2. Lọc theo ngày (date)
        // Ví dụ: ?date_from=2023-10-01&date_to=2023-10-30
        if ($request->has('date_from') && $request->date_from != null) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to != null) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Sắp xếp đơn mới nhất lên đầu
        $orders = $query->orderBy('created_at', 'desc')->paginate(10); // Phân trang 10 đơn/lần

        return response()->json($orders);
    }

    /**
     * GET /api/admin/orders/{id}
     * Xem chi tiết 1 đơn
     */
    public function show($id)
    {
        // Lấy đơn hàng kèm theo:
        // - user: để biết ai mua
        // - details.product: để biết mua cái gì, tên sp, ảnh sp
        $order = Order::with(['user', 'details.product'])->find($id);

        if (!$order) {
            return response()->json(['message' => 'Không tìm thấy đơn hàng'], 404);
        }

        return response()->json($order);
    }

    /**
     * PUT /api/admin/orders/{id}/status
     * Cập nhật trạng thái đơn hàng
     */
    public function updateStatus(Request $request, $id)
    {
        // Validate các trạng thái cho phép
        // pending: Chờ xử lý | processing: Đang chuẩn bị | shipping: Đang giao | completed: Đã giao | cancelled: Đã huỷ
        $request->validate([
            'status' => 'required|in:pending,processing,shipping,completed,cancelled'
        ]);

        $order = Order::find($id);

        if (!$order) {
            return response()->json(['message' => 'Không tìm thấy đơn hàng'], 404);
        }

        // Cập nhật trạng thái
        $oldStatus = $order->status;
        $order->status = $request->status;
        $order->save();

        return response()->json([
            'message' => 'Cập nhật trạng thái thành công',
            'order_id' => $order->id,
            'old_status' => $oldStatus,
            'new_status' => $order->status
        ]);
    }
}